<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Syllabus;
use App\Models\Staff;
use App\Http\Resources\SyllabusResource;
use App\Models\Subject;
use App\Models\AcademicYears;

class SyllabusController extends Controller
{
    /**
     * Helper to parse stored JSON/CSV fields into arrays.
     */
    private function parseArrayField($field)
    {
        if (empty($field)) {
            return [];
        }
        if (is_array($field)) {
            return $field;
        }
        // Try JSON decode (once or twice)
        $decoded = json_decode($field, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            if (is_array($decoded)) {
                return $decoded;
            }
        }
        // Fallback: CSV string
        return array_map('trim', explode(',', $field));
    }

    /**
     * Display a listing of the syllabi for the logged-in staff.
     */
    public function index()
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();

        if (!$staff) {
            return response()->json(['status' => 'error', 'message' => 'Staff profile not found'], 404);
        }

        // Get assigned subject IDs
        $subjectIds = $this->parseArrayField($staff->subject_id);
        if (empty($subjectIds)) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        // Fetch subject info
        $subjects = Subject::with(['course', 'semester'])->whereIn('id', $subjectIds)->get();

        $academicYearId = $staff->academic_years_id;
        $academicYear = $academicYearId ? AcademicYears::find($academicYearId) : null;

        $result = [];
        foreach ($subjects as $sub) {
            // Existing syllabus record (if any)
            $syllabus = Syllabus::where([
                'staff_id' => $staff->id,
                'subject_id' => $sub->id,
                'academic_year_id' => $academicYearId,
            ])->first();

            $result[] = [
                'staff_id' => $staff->id, // Added staff_id
                'staff_name' => $staff->staff_name, // Added staff_name (assuming 'name' property exists on Staff model)
                'assignment_id' => $sub->id, // placeholder; can be refined if separate assignment table exists
                'subject_id' => $sub->id,
                'subject_name' => $sub->subject_name,
                'subject_code' => $sub->subject_code ?? '',
                'course_id' => $sub->course_id,
                'course_name' => $sub->course->course_name ?? '',
                'semester_id' => $sub->semester_id,
                'semester_name' => $sub->semester->semester_name ?? '',
                'academic_year_id' => $academicYearId,
                'academic_year_name' => $academicYear->academic_year ?? '',
                'completed_percentage' => $syllabus->completed_percentage ?? 0,
                'remarks' => $syllabus->remarks ?? null,
                'syllabus_id' => $syllabus->id ?? null,
                'last_updated' => $syllabus ? $syllabus->updated_at : null,
            ];
        }

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    /**
     * Store or update syllabus completion for a staff-subject.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();

        if (!$staff) {
            return response()->json(['status' => 'error', 'message' => 'Staff profile not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'subject_id' => 'required|exists:subjects,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'course_id' => 'nullable|exists:courses,id',
            'semester_id' => 'nullable|exists:semesters,id',
            'completed_percentage' => 'required|integer|min:0|max:100',
            'remarks' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['staff_id'] = $staff->id;

        // Upsert based on unique index (staff_id, subject_id, academic_year_id)
        $syllabus = Syllabus::updateOrCreate([
            'staff_id' => $staff->id,
            'subject_id' => $data['subject_id'],
            'academic_year_id' => $data['academic_year_id'] ?? null,
        ], $data);

        return response()->json(['status' => 'success', 'data' => new SyllabusResource($syllabus)], 201);
    }
}
