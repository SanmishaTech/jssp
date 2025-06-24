<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaperEvaluationResource;
use App\Models\PaperEvaluation;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Notification;
use App\Models\Staff;
use Illuminate\Support\Facades\Auth;

class PaperEvaluationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $query = PaperEvaluation::with(['examCalendar', 'subject', 'staff']);

        // Filter by subject if provided in the request
        if ($request->has('subject') && !empty($request->input('subject'))) {
            $query->where('subject_id', function ($query) use ($request) {
                $query->select('id')->from('subjects')->where('name', 'like', '%' . $request->input('subject') . '%');
            });
        }

        // Filter by status if provided in the request
        if ($request->has('status') && !empty($request->input('status'))) {
            $query->where('status', $request->input('status'));
        }

        $userRoles = $user->roles->pluck('name');

        if ($userRoles->contains('admin') || $userRoles->contains('vice-principal')) {
            // Admin and Vice-Principal can see all evaluations
        } elseif ($userRoles->contains('teachingstaff')) {
            if ($user->staff) {
                $query->where('staff_id', $user->staff->id);
            } else {
                // If teaching staff is not linked to a staff record, return empty
                return PaperEvaluationResource::collection(collect());
            }
        } else {
            // Other roles see no evaluations
            return PaperEvaluationResource::collection(collect());
        }

        $paperEvaluations = $query->orderByRaw("FIELD(status, 'assigned', 'in-progress', 'completed')")->get();
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

        // Determine status based on completed and total papers
        $completed = $validatedData['completed_papers'] ?? 0;
        $total = $validatedData['total_papers'];
        if ($completed >= $total) {
            $validatedData['status'] = 'completed';
        } elseif ($completed > 0) {
            $validatedData['status'] = 'in_progress';
        } else {
            $validatedData['status'] = 'assigned';
        }

        $paperEvaluation = PaperEvaluation::create($validatedData);
        $paperEvaluation->load(['examCalendar', 'subject', 'staff']);

        // Notify assigned staff
        if ($paperEvaluation->staff && $paperEvaluation->staff->user) {
            $subjectName = $paperEvaluation->subject?->name ?? 'subject';
            Notification::sendToUser(
                $paperEvaluation->staff->user,
                'Paper Evaluation Assignment',
                "You have been assigned to evaluate papers for {$subjectName} (Total: {$paperEvaluation->total_papers}).",
                '/teachers-paper-evaluation',
                Auth::user()
            );
        }

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

        // Determine status based on completed and total papers
        $completed = $validatedData['completed_papers'] ?? $paperEvaluation->completed_papers;
        $total = $validatedData['total_papers'] ?? $paperEvaluation->total_papers;
        if ($completed >= $total) {
            $validatedData['status'] = 'completed';
        } elseif ($completed > 0) {
            $validatedData['status'] = 'in_progress';
        } else {
            $validatedData['status'] = 'assigned';
        }

        $previousStaffId = $paperEvaluation->staff_id;

        $paperEvaluation->update($validatedData);
        $paperEvaluation->load(['examCalendar', 'subject', 'staff']);

        // If staff changed, notify new staff
        if ($paperEvaluation->staff_id && $paperEvaluation->staff_id != $previousStaffId) {
            $newStaff = Staff::with('user')->find($paperEvaluation->staff_id);
            if ($newStaff && $newStaff->user) {
                $subjectName = $paperEvaluation->subject?->name ?? 'subject';
                Notification::sendToUser(
                    $newStaff->user,
                    'Paper Evaluation Assignment Updated',
                    "You have been assigned to evaluate papers for {$subjectName} (Total: {$paperEvaluation->total_papers}).",
                    '/teachers-paper-evaluation',
                    Auth::user()
                );
            }
        }

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
