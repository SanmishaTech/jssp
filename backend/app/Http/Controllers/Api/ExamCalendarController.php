<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\ExamCalendarResource;
use App\Models\ExamCalendar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Notification;
use App\Models\Staff;

class ExamCalendarController extends BaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ExamCalendar::query();

        $instituteId = Auth::user()->staff->institute_id ?? null;
        if ($instituteId) {
            $query->where('institute_id', $instituteId);
        }

        if ($request->query('search')) {
            $search = $request->query('search');
            $query->where('exam_name', 'like', "%{$search}%");
        }

        $calendars = $query->orderBy('date')->get();

        return $this->sendResponse([
            'ExamCalendar' => ExamCalendarResource::collection($calendars)
        ], 'Exam calendar retrieved successfully');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'exam_name'        => 'required|string|max:255',
            'date'             => 'required|date',
            'exam_code'        => 'nullable|string|max:255',
            'exam_time'        => 'nullable|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:0',
            'course_id'        => 'nullable|exists:courses,id',
            'subject_id'       => 'nullable|exists:subjects,id',
            'description'      => 'nullable|string',
            'exam_id'          => 'nullable|exists:exams,id',
            'staff_id'         => 'nullable|array',
            'staff_id.*'       => 'exists:staff,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation error', $validator->errors(), 422);
        }

        $data = $validator->validated();
        $data['institute_id'] = Auth::user()->staff->institute_id;

        $calendar = ExamCalendar::create($data);

        // Send notifications to selected supervisor staff
        if (!empty($data['staff_id']) && is_array($data['staff_id'])) {
            $staffCollection = Staff::with('user')->whereIn('id', $data['staff_id'])->get();

            foreach ($staffCollection as $staff) {
                if ($staff->user) {
                    Notification::sendToUser(
                        $staff->user,
                        'Exam Supervision Duty',
                        "You have been assigned as a supervisor for the exam: {$calendar->exam_name} on " . $calendar->date->format('d-m-Y'),
                        '/displaytimetable',
                        Auth::user()
                    );
                }
            }
        }

        return $this->sendResponse(['ExamCalendar' => new ExamCalendarResource($calendar)], 'Exam calendar stored successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(ExamCalendar $examCalendar): JsonResponse
    {
        return $this->sendResponse(['ExamCalendar' => new ExamCalendarResource($examCalendar)], 'Exam calendar retrieved successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExamCalendar $examCalendar): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'exam_name'        => 'sometimes|string|max:255',
            'date'             => 'sometimes|date',
            'exam_code'        => 'nullable|string|max:255',
            'exam_time'        => 'nullable|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:0',
            'course_id'        => 'nullable|exists:courses,id',
            'subject_id'       => 'nullable|exists:subjects,id',
            'description'      => 'nullable|string',
            'exam_id'          => 'nullable|exists:exams,id',
            'staff_id'         => 'sometimes|nullable|array',
            'staff_id.*'       => 'sometimes|exists:staff,id',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation error', $validator->errors(), 422);
        }

        $examCalendar->update($validator->validated());

        return $this->sendResponse(['ExamCalendar' => new ExamCalendarResource($examCalendar)], 'Exam calendar updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExamCalendar $examCalendar): JsonResponse
    {
        $examCalendar->delete();

        return $this->sendResponse([], 'Exam calendar deleted successfully');
    }

    public function getSupervisionDuties(Request $request): JsonResponse
    {
        $staffId = Auth::user()->staff->id ?? null;

        if (!$staffId) {
            return $this->sendError('Staff not found', [], 404);
        }

        $query = ExamCalendar::query()->where(function ($q) use ($staffId) {
            $q->whereJsonContains('staff_id', $staffId)
              ->orWhereJsonContains('staff_id', (string) $staffId);
        });

        $duties = $query->orderBy('date')->get();

        return $this->sendResponse([
            'SupervisionDuties' => ExamCalendarResource::collection($duties)
        ], 'Supervision duties retrieved successfully');
    }
}
