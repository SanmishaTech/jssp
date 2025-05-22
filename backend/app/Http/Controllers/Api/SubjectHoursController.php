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

class SubjectHoursController extends Controller
{
    /**
     * Get subject hours for authenticated staff
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $staff = Staff::where('user_id', $user->id)->first();
        
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
        
        // Ensure course_id is an array and not empty before querying
        if (!empty($staffData->course_id) && is_array($staffData->course_id)) {
            try {
                $courses = \App\Models\Course::whereIn('id', $staffData->course_id)->get();
            } catch (\Exception $e) {
                // Log error and continue
                \Log::error('Error fetching courses: ' . $e->getMessage());
            }
        }
        
        // Ensure semester_id is an array and not empty before querying
        if (!empty($staffData->semester_id) && is_array($staffData->semester_id)) {
            try {
                $semesters = \App\Models\Semester::whereIn('id', $staffData->semester_id)->get();
            } catch (\Exception $e) {
                // Log error and continue
                \Log::error('Error fetching semesters: ' . $e->getMessage());
            }
        }
        
        // Ensure subject_id is an array and not empty before querying
        if (!empty($staffData->subject_id) && is_array($staffData->subject_id)) {
            try {
                $subjects = Subject::with('subSubjects')->whereIn('id', $staffData->subject_id)->get();
                
                // Get hours for each sub-subject
                foreach ($subjects as $subject) {
                    if ($subject->subSubjects) {
                        foreach ($subject->subSubjects as $subSubject) {
                            $hours = SubjectHours::where([
                                'staff_id' => $staff->id,
                                'subject_id' => $subject->id,
                                'sub_subject_id' => $subSubject->id
                            ])->first();
                            
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
                    'staff_raw_data' => [
                        'model_data' => [
                            'course_id' => $staffData->course_id,
                            'semester_id' => $staffData->semester_id,
                            'subject_id' => $staffData->subject_id,
                        ],
                        'db_data' => [
                            'course_id' => $rawStaffData->course_id ?? null,
                            'semester_id' => $rawStaffData->semester_id ?? null,
                            'subject_id' => $rawStaffData->subject_id ?? null,
                        ]
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
