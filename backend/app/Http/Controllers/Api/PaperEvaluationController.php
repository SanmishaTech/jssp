<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaperEvaluationResource;
use App\Models\PaperEvaluation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PaperEvaluationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $paperEvaluations = PaperEvaluation::with(['examCalendar', 'subject', 'staff'])->get();
        return PaperEvaluationResource::collection($paperEvaluations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'exam_calendar_id' => 'required|exists:exam_calendars,id',
            'subject_id' => 'required|exists:subjects,id',
            'staff_id' => 'required|exists:staff,id',
            'due_date' => 'required|date',
            'total_papers' => 'required|integer|min:1',
            'completed_papers' => 'integer|min:0',
            'status' => 'string|in:assigned,in_progress,completed',
        ]);

        $paperEvaluation = PaperEvaluation::create($validatedData);
        $paperEvaluation->load(['examCalendar', 'subject', 'staff']);
        return new PaperEvaluationResource($paperEvaluation);
    }

    /**
     * Display the specified resource.
     */
    public function show(PaperEvaluation $paperEvaluation)
    {
        $paperEvaluation->load(['examCalendar', 'subject', 'staff']);
        return new PaperEvaluationResource($paperEvaluation);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaperEvaluation $paperEvaluation)
    {
        $validatedData = $request->validate([
            'exam_calendar_id' => 'sometimes|required|exists:exam_calendars,id',
            'subject_id' => 'sometimes|required|exists:subjects,id',
            'staff_id' => 'sometimes|required|exists:staff,id',
            'due_date' => 'sometimes|required|date',
            'total_papers' => 'sometimes|required|integer|min:1',
            'completed_papers' => 'sometimes|integer|min:0',
            'status' => 'sometimes|string|in:assigned,in_progress,completed',
        ]);

        $paperEvaluation->update($validatedData);
        $paperEvaluation->load(['examCalendar', 'subject', 'staff']);
        return new PaperEvaluationResource($paperEvaluation);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaperEvaluation $paperEvaluation)
    {
        $paperEvaluation->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
