<?php

namespace App\Http\Controllers\Api;

use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\StudentResource;
use App\Http\Resources\AttendanceResource;
use Illuminate\Support\Facades\Validator;

class AttendanceController extends BaseController
{
    /**
     * Get attendance records with pagination and search
     */
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details
        $instituteId = Auth::user()->staff->institute_id;
        
        // Start the query by filtering attendance based on the institute_id
        $query = Attendance::where('institute_id', $instituteId);
        
        // Filter by division_id if provided
        if ($request->has('division_id')) {
            $query->where('division_id', $request->query('division_id'));
        }
        
        // Filter by date if provided
        if ($request->has('date')) {
            $query->where('attendance_date', $request->query('date'));
        }
        
        // If there's a search term, apply additional filtering
        if ($request->has('search')) {
            $searchTerm = $request->query('search');
            $query->whereHas('student', function ($q) use ($searchTerm) {
                $q->where('student_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('prn', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Paginate the results
        $attendances = $query->paginate(10);
        
        return $this->sendResponse(
            [
                'attendances' => AttendanceResource::collection($attendances),
                'pagination' => [
                    'current_page' => $attendances->currentPage(),
                    'last_page' => $attendances->lastPage(),
                    'per_page' => $attendances->perPage(),
                    'total' => $attendances->total(),
                ]
            ],
            'Attendance records retrieved successfully'
        );
    }
    
    /**
     * Get students by division for attendance
     */
    public function getStudentsByDivision(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'division_id' => 'required|exists:divisions,id',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $instituteId = Auth::user()->staff->institute_id;
        $divisionId = $request->input('division_id');
        
        // Get students from the division
        $students = Student::where('institute_id', $instituteId)
                          ->where('division_id', $divisionId)
                          ->get();
        
        if ($students->isEmpty()) {
            return $this->sendResponse(
                ['students' => []],
                'No students found in this division'
            );
        }
        
        return $this->sendResponse(
            ['students' => StudentResource::collection($students)],
            'Students retrieved successfully'
        );
    }
    
    /**
     * Get attendance for a specific date and division
     */
    public function getAttendanceByDateAndDivision(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'division_id' => 'required|exists:divisions,id',
            'date' => 'required|date',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $instituteId = Auth::user()->staff->institute_id;
        $divisionId = $request->input('division_id');
        $date = $request->input('date');
        
        // Get students from the division
        $students = Student::where('institute_id', $instituteId)
                          ->where('division_id', $divisionId)
                          ->get();
        
        if ($students->isEmpty()) {
            return $this->sendResponse(
                ['students' => [], 'attendanceDate' => $date],
                'No students found in this division'
            );
        }
        
        // Get existing attendance records for the date
        $existingAttendance = Attendance::where('institute_id', $instituteId)
                                       ->where('division_id', $divisionId)
                                       ->where('attendance_date', $date)
                                       ->get()
                                       ->keyBy('student_id');
        
        $studentsWithAttendance = $students->map(function ($student) use ($existingAttendance, $date, $instituteId, $divisionId) {
            $attendance = $existingAttendance->get($student->id);
            
            return [
                'student' => new StudentResource($student),
                'attendance' => $attendance ? new AttendanceResource($attendance) : [
                    'id' => null,
                    'student_id' => $student->id,
                    'division_id' => $divisionId,
                    'institute_id' => $instituteId,
                    'attendance_date' => $date,
                    'is_present' => false,
                    'remarks' => null
                ]
            ];
        });
        
        return $this->sendResponse(
            [
                'students' => $studentsWithAttendance,
                'attendanceDate' => $date
            ],
            'Students with attendance records retrieved successfully'
        );
    }
    
    /**
     * Save attendance for multiple students
     */
    public function saveAttendance(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'division_id' => 'required|exists:divisions,id',
            'date' => 'required|date',
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.is_present' => 'required|boolean',
            'attendance.*.remarks' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $instituteId = Auth::user()->staff->institute_id;
        $divisionId = $request->input('division_id');
        $date = $request->input('date');
        $attendanceData = $request->input('attendance');
        
        foreach ($attendanceData as $data) {
            $studentId = $data['student_id'];
            $isPresent = $data['is_present'];
            $remarks = $data['remarks'] ?? null;
            
            // Update or create attendance record
            Attendance::updateOrCreate(
                [
                    'student_id' => $studentId,
                    'attendance_date' => $date,
                ],
                [
                    'institute_id' => $instituteId,
                    'division_id' => $divisionId,
                    'is_present' => $isPresent,
                    'remarks' => $remarks,
                ]
            );
        }
        
        return $this->sendResponse([], 'Attendance saved successfully');
    }
    
    /**
     * Display the specified attendance record.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id): JsonResponse
    {
        $attendance = Attendance::find($id);
        
        if (!$attendance) {
            return $this->sendError('Attendance record not found', [], 404);
        }
        
        return $this->sendResponse(
            ['attendance' => new AttendanceResource($attendance)],
            'Attendance record retrieved successfully'
        );
    }
    
    /**
     * Get attendance analysis by year for all divisions
     */
    public function getAttendanceAnalysis(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'year' => 'required|integer|min:2000|max:2100',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $instituteId = Auth::user()->staff->institute_id;
        $year = $request->query('year');
        
        // Calculate date range for the selected year
        $startDate = $year . '-01-01';
        $endDate = $year . '-12-31';
        
        // Get all divisions in the institute
        $divisions = \App\Models\Division::where('institute_id', $instituteId)->get();
        
        if ($divisions->isEmpty()) {
            return $this->sendResponse(
                ['analysis' => []],
                'No divisions found in this institute'
            );
        }
        
        $analysisData = [];
        $monthlyData = [];
        
        // Initialize monthly data structure
        for ($month = 1; $month <= 12; $month++) {
            $monthlyData[$month] = [
                'month_name' => date('F', mktime(0, 0, 0, $month, 10)),
                'divisions' => []
            ];
        }
        
        foreach ($divisions as $division) {
            // Get total students in the division
            $totalStudents = Student::where('institute_id', $instituteId)
                                  ->where('division_id', $division->id)
                                  ->count();
            
            if ($totalStudents === 0) {
                continue; // Skip divisions with no students
            }
            
            // Get attendance records for the year and division
            $attendanceRecords = Attendance::where('institute_id', $instituteId)
                                         ->where('division_id', $division->id)
                                         ->whereBetween('attendance_date', [$startDate, $endDate])
                                         ->get();
            
            $totalPresentCount = $attendanceRecords->where('is_present', true)->count();
            $totalAbsentCount = $attendanceRecords->where('is_present', false)->count();
            $totalRecordsCount = $totalPresentCount + $totalAbsentCount;
            
            // Calculate overall attendance percentage
            $attendancePercentage = $totalRecordsCount > 0 ? round(($totalPresentCount / $totalRecordsCount) * 100, 2) : 0;
            
            // Summary data for the division for the entire year
            $analysisData[] = [
                'division_id' => $division->id,
                'division_name' => $division->division,
                'total_students' => $totalStudents,
                'present_count' => $totalPresentCount,
                'absent_count' => $totalAbsentCount,
                'total_records' => $totalRecordsCount,
                'attendance_percentage' => $attendancePercentage,
            ];
            
            // Calculate monthly breakdown
            for ($month = 1; $month <= 12; $month++) {
                $monthStart = sprintf('%s-%02d-01', $year, $month);
                $monthEnd = date('Y-m-t', strtotime($monthStart));
                
                $monthlyAttendance = $attendanceRecords->filter(function ($record) use ($monthStart, $monthEnd) {
                    $date = $record->attendance_date;
                    return $date >= $monthStart && $date <= $monthEnd;
                });
                
                $monthlyPresentCount = $monthlyAttendance->where('is_present', true)->count();
                $monthlyAbsentCount = $monthlyAttendance->where('is_present', false)->count();
                $monthlyRecordsCount = $monthlyPresentCount + $monthlyAbsentCount;
                
                $monthlyPercentage = $monthlyRecordsCount > 0 ? round(($monthlyPresentCount / $monthlyRecordsCount) * 100, 2) : 0;
                
                $monthlyData[$month]['divisions'][] = [
                    'division_id' => $division->id,
                    'division_name' => $division->division,
                    'present_count' => $monthlyPresentCount,
                    'absent_count' => $monthlyAbsentCount,
                    'total_records' => $monthlyRecordsCount,
                    'attendance_percentage' => $monthlyPercentage,
                ];
            }
        }
        
        return $this->sendResponse(
            [
                'year' => $year,
                'yearly_analysis' => $analysisData,
                'monthly_analysis' => array_values($monthlyData)
            ],
            'Attendance analysis retrieved successfully'
        );
    }
    
    /**
     * Get attendance statistics
     */
    public function getStatistics(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'division_id' => 'required|exists:divisions,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $instituteId = Auth::user()->staff->institute_id;
        $divisionId = $request->input('division_id');
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        
        // Get students from the division
        $students = Student::where('institute_id', $instituteId)
                          ->where('division_id', $divisionId)
                          ->get();
        
        if ($students->isEmpty()) {
            return $this->sendResponse(
                ['statistics' => []],
                'No students found in this division'
            );
        }
        
        $statistics = [];
        
        foreach ($students as $student) {
            $totalDays = Attendance::where('student_id', $student->id)
                                  ->whereBetween('attendance_date', [$fromDate, $toDate])
                                  ->count();
            
            $presentDays = Attendance::where('student_id', $student->id)
                                    ->whereBetween('attendance_date', [$fromDate, $toDate])
                                    ->where('is_present', true)
                                    ->count();
            
            $absentDays = $totalDays - $presentDays;
            $attendancePercentage = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 2) : 0;
            
            $statistics[] = [
                'student' => new StudentResource($student),
                'total_days' => $totalDays,
                'present_days' => $presentDays,
                'absent_days' => $absentDays,
                'attendance_percentage' => $attendancePercentage,
            ];
        }
        
        return $this->sendResponse(
            ['statistics' => $statistics],
            'Attendance statistics retrieved successfully'
        );
    }
}
