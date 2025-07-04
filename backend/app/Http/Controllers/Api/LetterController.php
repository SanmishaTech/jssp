<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LetterResource;
use App\Models\Letter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Mpdf\Mpdf;

class LetterController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $instituteId = $user->staff->institute_id;

        $query = Letter::where('institute_id', $instituteId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('letter_title', 'like', "%{$search}%")
                    ->orWhere('letter_description', 'like', "%{$search}%")
                    ->orWhere('letter_number', 'like', "%{$search}%");
            });
        }

        $perPage = $request->query('per_page', 9);
        $letters = $query->latest()->paginate($perPage);

        return $this->sendResponse([
            'Letter' => LetterResource::collection($letters),
            'Pagination' => [
                'current_page' => $letters->currentPage(),
                'last_page' => $letters->lastPage(),
                'per_page' => $letters->perPage(),
                'total' => $letters->total(),
            ]
        ], 'Letters retrieved successfully');
    }

    public function pdf($id)
    {
        try {
            $user = Auth::user();
            $letter = Letter::findOrFail($id);

            if ($user->staff->institute_id !== $letter->institute_id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $data = [
                'letter' => $letter,
                'staff' => $user->staff,
            ];

            $pdf = new Mpdf([
                'mode' => 'utf-8',
                'format' => 'A4',
                'tempDir' => storage_path('app/mpdf')
            ]);

            $pdf->SetAuthor('JSSP');
            $pdf->SetCreator('JSSP');
            $pdf->SetTitle('Letter - ' . $letter->letter_title);
            $pdf->SetSubject('Letter PDF');

            // Use a view for the PDF content
            $html = view('pdf.letter', $data)->render();

            $pdf->WriteHTML($html);

            // Output the PDF as a download
            return $pdf->Output('letter_' . $letter->id . '.pdf', 'I');

        } catch (\Exception $e) {
            // Log the error or handle it as needed
            return response()->json(['error' => 'Could not generate PDF', 'message' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'letter_title' => 'required|string',
            'letter_description' => 'required|string',
        ]);

        $user = Auth::user();
        $instituteId = $user->staff->institute_id;

        $letterNumber = 'LET-' . Str::upper(Str::random(6));

        $letter = Letter::create([
            'institute_id' => $instituteId,
            'letter_number' => $letterNumber,
            'letter_title' => $request->input('letter_title'),
            'letter_description' => $request->input('letter_description'),
        ]);

        return $this->sendResponse(['Letter' => new LetterResource($letter)], 'Letter stored successfully');
    }

    public function show(string $id): JsonResponse
    {
        $letter = Letter::find($id);
        if (!$letter) {
            return $this->sendError('Letter not found', [], 404);
        }
        return $this->sendResponse(['Letter' => new LetterResource($letter)], 'Letter retrieved successfully');
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $letter = Letter::find($id);
        if (!$letter) {
            return $this->sendError('Letter not found', [], 404);
        }

        $request->validate([
            'letter_title' => 'required|string',
            'letter_description' => 'required|string',
        ]);

        $letter->update($request->only(['letter_title', 'letter_description']));

        return $this->sendResponse(['Letter' => new LetterResource($letter)], 'Letter updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $letter = Letter::find($id);
        if (!$letter) {
            return $this->sendError('Letter not found', [], 404);
        }
        $letter->delete();
        return $this->sendResponse([], 'Letter deleted successfully');
    }
}
