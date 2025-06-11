<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\SubSubject;
use App\Models\SubjectHours;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubjectHoursController extends Controller
{
    /**
     * Helper method to parse fields that could be JSON strings or arrays
     */
    private function parseArrayField($field)
    {
        if (empty($field)) {
            return [];
        }
        
        // If it's already an array, return it
        if (is_array($field)) {
            return $field;
        }
        
        // If it's a JSON string (possibly double-encoded), try to decode it
        try {
            // First try a single decode
            $decoded = json_decode($field, true);
            
            // If it's still a string that looks like JSON, try decoding again
            if (is_string($decoded) && (str_starts_with($decoded, '[') || str_starts_with($decoded, '{'))) {
                $decoded = json_decode($decoded, true);
            }
            
            // If we have a valid array now, return it
            if (is_array($decoded)) {
                return $decoded;
            }
            
            // If the field is a string with comma-separated values
            if (is_string($field) && strpos($field, ',') !== false) {
                return array_map('trim', explode(',', $field));
            }
            
            // Last resort: wrap the single value in an array
            return [$field];
        } catch (\Exception $e) {
            Log::error("Error parsing array field: " . $e->getMessage());
            return [];
        }
    }
    /**
     * Get subject hours for authenticated staff
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Determine which staff record to use:
        // 1. If the authenticated user is an admin and has supplied a `staff_id` query param,
        //    we attempt to fetch that staff member (must exist and be a teaching staff).
        // 2. Otherwise, we default to the staff record linked to the authenticated user
        //    (standard teaching-staff workflow).

        if ($user && (($user->role ?? null) === 'admin' || $user->hasRole('admin')) && $request->has('staff_id')) {
            $staff = Staff::find($request->input('staff_id'));

            // Validate that the selected staff exists and is indeed a teaching staff member
            if (!$staff || !optional($staff->user)->hasRole('teachingstaff')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid staff selection',
                ], 404);
            }
        } else {
            $staff = Staff::where('user_id', $user->id)->first();
        }

        if (!$staff) {
            return response()->json([
                'status' => 'error',
                'message' => 'Staff profile not found',
            ], 404);
        }
        
        // Get staff assignments from the staff table (with fresh data)
        $staffData = Staff::with(['user'])->findOrFail($staff->id);
        
        // For debugging, get raw data directly from the database to check JSON columns
        $rawStaffData = DB::table('staff')->where('id', $staff->id)->first();
        
        // Get all academic years, courses, semesters, and subjects assigned to this staff
        $academicYear = null;
        $courses = [];
        $semesters = [];
        $subjects = [];
        
        if ($staffData->academic_years_id) {
            $academicYear = \App\Models\AcademicYears::find($staffData->academic_years_id);
        }
        
        // Parse course_id properly - could be a JSON string or already an array
        $courseIds = $this->parseArrayField($staffData->course_id);
        if (!empty($courseIds)) {
            try {
                $courses = \App\Models\Course::whereIn('id', $courseIds)->get();
            } catch (\Exception $e) {
                // Log error and continue
                \Log::error('Error fetching courses: ' . $e->getMessage());
            }
        }
        
        // Parse semester_id properly - could be a JSON string or already an array
        $semesterIds = $this->parseArrayField($staffData->semester_id);
        if (!empty($semesterIds)) {
            try {
                $semesters = \App\Models\Semester::whereIn('id', $semesterIds)->get();
            } catch (\Exception $e) {
                // Log error and continue
                \Log::error('Error fetching semesters: ' . $e->getMessage());
            }
        }
        
        // Parse subject_id properly - could be a JSON string or already an array
        $subjectIds = $this->parseArrayField($staffData->subject_id);

        // Fallback: if no subject_ids are specified on the staff record, derive them
        // from existing subject_hours entries for this staff. This ensures that we
        // can still return subjects even if the staff table hasn’t been fully
        // populated with assignment IDs.
        if (empty($subjectIds)) {
            $subjectIds = SubjectHours::where('staff_id', $staff->id)
                ->distinct()
                ->pluck('subject_id')
                ->toArray();
        }
        
        if (!empty($subjectIds)) {
            try {
                // Get subjects with their sub-subjects
                $subjects = Subject::with('subSubjects')->whereIn('id', $subjectIds)->get();
                
                // Ensure consistent property name for frontend
                $subjects->each(function ($subject) {
                    if (isset($subject->subSubjects)) {
                        $subject->sub_subjects = $subject->subSubjects;
                        unset($subject->subSubjects);
                    }
                });
                
                // If we still have no subjects (e.g., staff had no assignments table data),
                // derive them entirely from subject_hours.
                if ($subjects->isEmpty()) {
                    $derivedIds = SubjectHours::where('staff_id', $staff->id)
                        ->distinct()
                        ->pluck('subject_id')
                        ->toArray();

                    if (!empty($derivedIds)) {
                        $subjects = Subject::with('subSubjects')
                            ->whereIn('id', $derivedIds)
                            ->get();

                        // Ensure consistent property name for frontend
                        $subjects->each(function ($subject) {
                            if (isset($subject->subSubjects)) {
                                $subject->sub_subjects = $subject->subSubjects;
                                unset($subject->subSubjects);
                            }
                        });

                        // Attach hours same as earlier
                        foreach ($subjects as $subject) {
                            foreach ($subject->sub_subjects as $subSubject) {
                                $hours = SubjectHours::where([
                                    'staff_id' => $staff->id,
                                    'subject_id' => $subject->id,
                                    'sub_subject_id' => $subSubject->id,
                                ])->first();
                                $subSubject->hours = $hours ? $hours->hours : 0;
                            }
                        }
                    }
                }
                
                // Get hours for each sub-subject
                foreach ($subjects as $subject) {
                    if ($subject->sub_subjects) {
                        foreach ($subject->sub_subjects as $subSubject) {
                            $hours = SubjectHours::where([
                                'staff_id' => $staff->id,
                                'subject_id' => $subject->id,
                                'sub_subject_id' => $subSubject->id
                            ])->first();
                            
                            // Ensure hours are set explicitly to show in the response
                            $subSubject->hours = $hours ? $hours->hours : 0;
                        }
                    }
                }
            } catch (\Exception $e) {
                // Log error and continue
                \Log::error('Error fetching subjects: ' . $e->getMessage());
            }
        }
        
        // Include both model-parsed data and raw database data for comparison
        return response()->json([
            'status' => 'success',
            'data' => [
                'staff_assignments' => [
                    'staff_id' => $staff->id,
                    'parsed_ids' => [
                        'course_ids' => $courseIds,
                        'semester_ids' => $semesterIds,
                        'subject_ids' => $subjectIds,
                    ],
                    'academic_year' => $academicYear,
                    'courses' => $courses,
                    'semesters' => $semesters,
                    'subjects' => $subjects,
                ]
            ]
        ]);
    }
    
    /**
     * Store or update a batch of subject hours entries
     */
    public function storeBatch(Request $request)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
        if (!$staff) {
            return response()->json([
                'status' => 'error',
                'message' => 'Staff profile not found',
            ], 404);
        }
        
        $validator = Validator::make($request->all(), [
            'updates' => 'required|array',
            'updates.*.subject_id' => 'required|exists:subjects,id',
            'updates.*.sub_subject_id' => 'required|exists:sub_subjects,id',
            'updates.*.hours' => 'required|integer|min:0',
            'updates.*.academic_year_id' => 'nullable|exists:academic_years,id',
            'updates.*.course_id' => 'nullable|exists:courses,id',
            'updates.*.semester_id' => 'nullable|exists:semesters,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        $updates = $request->input('updates');
        
        foreach ($updates as $update) {
            SubjectHours::updateOrCreate(
                [
                    'staff_id' => $staff->id,
                    'subject_id' => $update['subject_id'],
                    'sub_subject_id' => $update['sub_subject_id'],
                    'academic_year_id' => $update['academic_year_id'] ?? null,
                    'course_id' => $update['course_id'] ?? null,
                    'semester_id' => $update['semester_id'] ?? null,
                ],
                [
                    'hours' => $update['hours']
                ]
            );
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Subject hours updated successfully'
        ]);
    }
}
