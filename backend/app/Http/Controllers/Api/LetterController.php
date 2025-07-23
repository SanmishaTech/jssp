<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LetterResource;
use App\Models\Letter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Mpdf\Mpdf;

class LetterController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $instituteId = $user->staff->institute_id;

        $query = Letter::where('institute_id', $instituteId);

        // Optionally filter by current staff member if needed (default: show all institute letters)
        if ($request->boolean('mine')) {
            $query->where('staff_id', $user->staff->id);
        }

        // Add type filter
        if ($type = $request->query('type')) {
            if (in_array($type, ['inward', 'outward'])) {
                $query->where('type', $type);
            }
        }

        // Existing search logic
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

    public function pdf($id, Request $request)
    {
        try {
            $user = Auth::user();
            $letter = Letter::findOrFail($id);

            if ($user->staff->institute_id !== $letter->institute_id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Get language from request parameter
            $language = $request->query('language', 'english');
            
            // Debug: Log user role and language
            $userRole = $user->getRoleNames()->first();
            Log::info('PDF Generation Debug', [
                'user_role' => $userRole,
                'language' => $language,
                'user_id' => $user->id
            ]);
            
            // Determine letterhead image path based on role and language
            $letterheadImage = null;
            if ($user->hasRole('superadmin')) {
                // Superadmin uses poi letterheads
                if ($language === 'marathi') {
                    $letterheadImage = public_path('images/poiM.png');
                } else {
                    $letterheadImage = public_path('images/poiE.png');
                }
            } elseif ($user->hasRole('admin')) {
                // Admin uses goveli letterheads
                if ($language === 'marathi') {
                    $letterheadImage = public_path('images/goveliM.png');
                } else {
                    $letterheadImage = public_path('images/goveliE.png');
                }
            }
            
            // Debug: Log letterhead path and file existence
            if ($letterheadImage) {
                Log::info('Letterhead Debug', [
                    'letterhead_path' => $letterheadImage,
                    'file_exists' => file_exists($letterheadImage)
                ]);
            }

            $data = [
                'letter' => $letter,
                'staff' => $user->staff,
                'letterheadImage' => $letterheadImage,
                'language' => $language,
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
        $rules = [
            'letter_title' => 'required|string',
            'type' => 'required|in:inward,outward'
        ];

        // Rules based on letter type
        if ($request->input('type') === 'outward') {
            $rules['letter_description'] = 'required|string';
            // No file allowed for outward letters
        } else {
            $rules['letter_description'] = 'nullable|string';
            // For inward letters, file is required
            $rules['letter_file'] = 'required|file|mimes:jpeg,png,jpg,pdf,doc,docx|max:5120';
        }

        $request->validate($rules);

        $user = Auth::user();
        $instituteId = $user->staff->institute_id;

        $staffId = $user->staff->id;
        
        // Generate sequential letter number with JSSP-G-I0001 format (initials)
        $letterTypeInitial = $request->input('type') === 'inward' ? 'I' : 'O';
        
        // Get the next sequential number for this institute and type
        $lastLetter = Letter::where('institute_id', $instituteId)
            ->where('type', $request->input('type'))
            ->where('letter_number', 'like', "JSSP-G-{$letterTypeInitial}%")
            ->orderBy('id', 'desc')
            ->first();
        
        $nextNumber = 1;
        if ($lastLetter && $lastLetter->letter_number) {
            // Extract the number part from the last letter number (last 4 digits)
            $numberPart = substr($lastLetter->letter_number, -4);
            if (is_numeric($numberPart)) {
                $lastNumber = intval($numberPart);
                $nextNumber = $lastNumber + 1;
            }
        }
        
        // Format as 4-digit number with leading zeros
        $formattedNumber = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        $letterNumber = "JSSP-G-{$letterTypeInitial}{$formattedNumber}";

        $letter = new Letter();
        $letter->institute_id = $instituteId;
        $letter->staff_id = $staffId;
        $letter->letter_number = $letterNumber;
        $letter->letter_title = $request->input('letter_title');
        $letter->type = $request->input('type');
        $letter->letter_description = $request->input('letter_description', '');

        // Handle file upload
        if ($request->hasFile('letter_file')) {
            $file = $request->file('letter_file');
            $original = $file->getClientOriginalName();
            $uniqueName = time() . '_' . $original;

            // Ensure directory exists
            Storage::disk('public')->makeDirectory('letter_attachments', 0755, true, true);

            $file->storeAs('letter_attachments', $uniqueName, 'public');

            $letter->letter_path = $uniqueName;
        }

        $letter->save();

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

        $rules = [
            'letter_title' => 'required|string',
            'type' => 'required|in:inward,outward',
            'delete_file' => 'nullable|boolean'
        ];

        // Rules based on letter type
        if ($request->input('type') === 'outward') {
            $rules['letter_description'] = 'required|string';
            // No file allowed for outward letters
        } else {
            $rules['letter_description'] = 'nullable|string';
            $rules['letter_file'] = 'nullable|file|mimes:jpeg,png,jpg,pdf,doc,docx|max:5120';
        }

        $request->validate($rules);

        $letter->letter_title = $request->input('letter_title');
        $letter->type = $request->input('type');
        $letter->letter_description = $request->input('letter_description', '');

        // Handle delete request for existing file
        if ($request->boolean('delete_file') && $letter->letter_path) {
            if (Storage::disk('public')->exists('letter_attachments/' . $letter->letter_path)) {
                Storage::disk('public')->delete('letter_attachments/' . $letter->letter_path);
            }
            $letter->letter_path = null;
        }

        // Handle new file upload
        if ($request->hasFile('letter_file')) {
            // Remove old file first
            if ($letter->letter_path && Storage::disk('public')->exists('letter_attachments/' . $letter->letter_path)) {
                Storage::disk('public')->delete('letter_attachments/' . $letter->letter_path);
            }

            $file = $request->file('letter_file');
            $original = $file->getClientOriginalName();
            $uniqueName = time() . '_' . $original;

            Storage::disk('public')->makeDirectory('letter_attachments', 0755, true, true);
            $file->storeAs('letter_attachments', $uniqueName, 'public');

            $letter->letter_path = $uniqueName;
        }

        $letter->save();

        return $this->sendResponse(['Letter' => new LetterResource($letter)], 'Letter updated successfully');
    }

    public function destroy(string $id): JsonResponse
    {
        $letter = Letter::find($id);
        if (!$letter) {
            return $this->sendError('Letter not found', [], 404);
        }
        
        // Delete associated file if exists
        if ($letter->letter_path && Storage::disk('public')->exists('letter_attachments/' . $letter->letter_path)) {
            Storage::disk('public')->delete('letter_attachments/' . $letter->letter_path);
        }
        
        $letter->delete();
        return $this->sendResponse([], 'Letter deleted successfully');
    }
}
