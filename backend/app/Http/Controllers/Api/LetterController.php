<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LetterResource;
use App\Models\Letter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

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
