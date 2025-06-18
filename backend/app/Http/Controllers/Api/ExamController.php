<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\ExamResource;
use App\Models\Exam;
class ExamController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Exam::query();

        // Get institute id from authenticated user's staff
        $instituteId = Auth::user()->staff->institute_id ?? null;

        if ($instituteId) {
            $query->where('institute_id', $instituteId);
        }

        // Search by exam_title if provided
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where('exam_title', 'like', "%{$searchTerm}%");
        }

        $exams = $query->orderBy('id', 'DESC')->paginate(7);

        return $this->sendResponse([
            'Exams' => ExamResource::collection($exams),
            'Pagination' => [
                'current_page' => $exams->currentPage(),
                'last_page'    => $exams->lastPage(),
                'per_page'     => $exams->perPage(),
                'total'        => $exams->total(),
            ]
        ], 'Exams retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            
            'exam_title'   => ['required', 'string', 'max:255'],
            'from_date'    => ['required', 'date'],
            'to_date'      => ['required', 'date', 'after_or_equal:from_date'],
            'description'  => ['nullable', 'string'],
        ]);

        // Attach institute_id automatically from authenticated user
        $validated['institute_id'] = Auth::user()->staff->institute_id;
        $exam = Exam::create($validated);

        return $this->sendResponse(['Exam' => new ExamResource($exam)], 'Exam stored successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Exam $exam): JsonResponse
    {
        return $this->sendResponse(['Exam' => new ExamResource($exam)], 'Exam stored successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exam $exam): JsonResponse
    {
        $validated = $request->validate([
            'exam_title'  => ['sometimes', 'string', 'max:255'],
            'from_date'   => ['sometimes', 'date'],
            'to_date'     => ['sometimes', 'date', 'after_or_equal:from_date'],
            'description' => ['nullable', 'string'],
        ]);

        $exam->update($validated);

        return $this->sendResponse(['Exam' => new ExamResource($exam)], 'Exam stored successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exam $exam): JsonResponse
    {
        $exam->delete();

        return $this->sendResponse([], 'Exam deleted successfully');
    }

    public function allExams(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $exam = Exam::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Exam" => ExamResource::collection($exam)],
            "Exams retrieved successfully"
        );
    }

}
