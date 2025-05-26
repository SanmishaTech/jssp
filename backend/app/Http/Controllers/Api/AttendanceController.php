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
            'time_slot' => 'nullable|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'slot_id' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        $instituteId = Auth::user()->staff->institute_id;
        $divisionId = $request->input('division_id');
        $date = $request->input('date');
        $timeSlot = $request->input('time_slot');
        $subjectId = $request->input('subject_id');
        $slotId = $request->input('slot_id');
        
        // Get students from the division
        $students = Student::where('institute_id', $instituteId)
                          ->where('division_id', $divisionId)
                          ->get();
        
        if ($students->isEmpty()) {
            return $this->sendResponse(
                [
                    'students' => [], 
                    'attendanceDate' => $date,
                    'timeSlot' => $timeSlot,
                    'subjectId' => $subjectId,
                    'slotId' => $slotId
                ],
                'No students found in this division'
            );
        }
        
        // Get existing attendance records for the date and lecture
        $query = Attendance::where('institute_id', $instituteId)
                         ->where('division_id', $divisionId)
                         ->where('attendance_date', $date);

        // If lecture-specific parameters are provided, filter by them
        if ($timeSlot) {
            $query->where('time_slot', $timeSlot);
        }
        
        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }
        
        if ($slotId) {
            $query->where('slot_id', $slotId);
        }
        
        $existingAttendance = $query->get()->keyBy('student_id');
        
        $studentsWithAttendance = $students->map(function ($student) use ($existingAttendance, $date, $instituteId, $divisionId, $timeSlot, $subjectId, $slotId) {
            $attendance = $existingAttendance->get($student->id);
            
            return [
                'student' => new StudentResource($student),
                'attendance' => $attendance ? new AttendanceResource($attendance) : [
                    'id' => null,
                    'student_id' => $student->id,
                    'student_name' => $student->student_name,
                    'division_id' => $divisionId,
                    'division_name' => $student->division->division,
                    'institute_id' => $instituteId,
                    'institute_name' => $student->institute->institute_name,
                    'attendance_date' => $date,
                    'time_slot' => $timeSlot,
                    'subject_id' => $subjectId,
                    'subject_name' => $subjectId ? (\App\Models\Subject::find($subjectId)?->subject_name ?? null) : null,
                    'slot_id' => $slotId,
                    'is_present' => false,
                    'remarks' => null
                ]
            ];
        });
        
        return $this->sendResponse(
            [
                'students' => $studentsWithAttendance,
                'attendanceDate' => $date,
                'timeSlot' => $timeSlot,
                'subjectId' => $subjectId,
                'subject_name' => $subjectId ? (\App\Models\Subject::find($subjectId)?->subject_name ?? null) : null,
                'slotId' => $slotId
            ],
            'Students with attendance records retrieved successfully'
        );
    }
    
    /**
     * Save attendance for multiple students
     */
    public function saveAttendance(Request $request): JsonResponse
    {
        try {
            // Log the entire request for debugging
            \Log::info('Attendance save request data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'division_id' => 'required|exists:divisions,id',
                'date' => 'required|date',
                'time_slot' => 'nullable|string',
                'subject_id' => 'nullable|exists:subjects,id',
                'slot_id' => 'nullable|string',
                'attendance' => 'required|array',
                'attendance.*.student_id' => 'required|exists:students,id',
                'attendance.*.is_present' => 'required|boolean',
                'attendance.*.remarks' => 'nullable|string',
            ]);
            
            if ($validator->fails()) {
                \Log::warning('Attendance validation failed:', $validator->errors()->toArray());
                return $this->sendError('Validation Error', $validator->errors(), 422);
            }
            
            $instituteId = Auth::user()->staff->institute_id;
            $divisionId = $request->input('division_id');
            $date = $request->input('date');
            $timeSlot = $request->input('time_slot');
            $subjectId = $request->input('subject_id');            
            $slotId = $request->input('slot_id');
            $attendanceData = $request->input('attendance');
            
            \Log::info('Processing attendance for institute_id: ' . $instituteId . ', division_id: ' . $divisionId . ', date: ' . $date);
            \Log::info('Total attendance records to process: ' . count($attendanceData));
            
            foreach ($attendanceData as $index => $data) {
                $studentId = $data['student_id'];
                $isPresent = $data['is_present'];
                $remarks = $data['remarks'] ?? null;
                
                // Define the unique key for finding/creating attendance record
                $attendanceKey = [
                    'student_id' => $studentId,
                    'attendance_date' => $date,
                ];
                
                // If lecture-specific parameters are provided, include them in the key
                if ($timeSlot) {
                    $attendanceKey['time_slot'] = $timeSlot;
                }
                
                if ($subjectId) {
                    $attendanceKey['subject_id'] = $subjectId;
                }
                
                if ($slotId) {
                    $attendanceKey['slot_id'] = $slotId;
                }
                
                // Define the data to update or create
                $attendanceValues = [
                    'institute_id' => $instituteId,
                    'division_id' => $divisionId,
                    'is_present' => $isPresent,
                    'remarks' => $remarks,
                ];
                
                // Add lecture-specific fields to values if provided
                if ($timeSlot && !isset($attendanceKey['time_slot'])) {
                    $attendanceValues['time_slot'] = $timeSlot;
                }
                
                if ($subjectId && !isset($attendanceKey['subject_id'])) {
                    $attendanceValues['subject_id'] = $subjectId;
                }
                
                if ($slotId && !isset($attendanceKey['slot_id'])) {
                    $attendanceValues['slot_id'] = $slotId;
                }
                
                // Log the data for each record
                \Log::info('Processing attendance record ' . ($index + 1) . ' for student_id: ' . $studentId);
                \Log::info('Attendance key:', $attendanceKey);
                \Log::info('Attendance values:', $attendanceValues);
                
                try {
                    // Update or create attendance record and get the model instance
                    $attendance = Attendance::updateOrCreate($attendanceKey, $attendanceValues);
                    \Log::info('Saved attendance record ID: ' . $attendance->id);
                } catch (\Exception $e) {
                    \Log::error('Error saving individual attendance record for student_id: ' . $studentId . ', Error: ' . $e->getMessage());
                    throw $e; // Rethrow to be caught by outer try-catch
                }
            }
            
            \Log::info('All attendance records processed successfully');
            return $this->sendResponse(['saved_count' => count($attendanceData)], 'Attendance saved successfully');
            
        } catch (\Exception $e) {
            \Log::error('Exception in saveAttendance: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            return $this->sendError('Failed to save attendance: ' . $e->getMessage(), [], 500);
        }
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
     * Generate day-wise attendance report for download
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadDayReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'division_id' => 'required|exists:divisions,id',
            'date' => 'required|date',
            'format' => 'required|in:csv,pdf',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        try {
            $instituteId = Auth::user()->staff->institute_id;
            $divisionId = $request->input('division_id');
            $date = $request->input('date');
            $format = $request->input('format');
            
            // Get the division name
            $division = \App\Models\Division::find($divisionId);
            if (!$division) {
                return $this->sendError('Division not found', [], 404);
            }
            
            // Get students with attendance for the specified date
            $attendanceData = $this->getAttendanceDataForReport($instituteId, $divisionId, $date);
            
            // Generate report filename
            $filename = 'attendance_' . $division->division . '_' . $date . '.' . $format;
            
            // Generate and return the report
            return $this->generateReport($attendanceData, $filename, $format, [
                'title' => 'Daily Attendance Report',
                'date' => $date,
                'division' => $division->division
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error generating day report: ' . $e->getMessage());
            return $this->sendError('Failed to generate report', [], 500);
        }
    }
    
    /**
     * Generate week-wise attendance report for download
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadWeekReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'division_id' => 'required|exists:divisions,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'required|in:csv,pdf',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        try {
            $instituteId = Auth::user()->staff->institute_id;
            $divisionId = $request->input('division_id');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');
            $format = $request->input('format');
            
            // Get the division name
            $division = \App\Models\Division::find($divisionId);
            if (!$division) {
                return $this->sendError('Division not found', [], 404);
            }
            
            // Get all students in this division
            $students = Student::where('institute_id', $instituteId)
                ->where('division_id', $divisionId)
                ->get();
                
            if ($students->isEmpty()) {
                return $this->sendError('No students found in this division', [], 404);
            }
            
            // Get attendance data for date range
            $reportData = $this->getAttendanceDataForDateRange($instituteId, $divisionId, $startDate, $endDate, $students);
            
            // Generate report filename
            $filename = 'attendance_' . $division->division . '_week_' . $startDate . '_to_' . $endDate . '.' . $format;
            
            // Generate and return the report
            return $this->generateReport($reportData, $filename, $format, [
                'title' => 'Weekly Attendance Report',
                'period' => $startDate . ' to ' . $endDate,
                'division' => $division->division
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error generating week report: ' . $e->getMessage());
            return $this->sendError('Failed to generate report', [], 500);
        }
    }
    
    /**
     * Generate month-wise attendance report for download
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadMonthReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'division_id' => 'required|exists:divisions,id',
            'month' => 'required|numeric|min:1|max:12',
            'year' => 'required|numeric|min:2000|max:2100',
            'format' => 'required|in:csv,pdf',
        ]);
        
        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }
        
        try {
            $instituteId = Auth::user()->staff->institute_id;
            $divisionId = $request->input('division_id');
            $month = $request->input('month');
            $year = $request->input('year');
            $format = $request->input('format');
            
            // Get the division name
            $division = \App\Models\Division::find($divisionId);
            if (!$division) {
                return $this->sendError('Division not found', [], 404);
            }
            
            // Calculate first and last day of the month
            $startDate = date('Y-m-d', strtotime($year . '-' . $month . '-01'));
            $endDate = date('Y-m-t', strtotime($startDate));
            
            // Get all students in this division
            $students = Student::where('institute_id', $instituteId)
                ->where('division_id', $divisionId)
                ->get();
                
            if ($students->isEmpty()) {
                return $this->sendError('No students found in this division', [], 404);
            }
            
            // Get attendance data for the month
            $reportData = $this->getAttendanceDataForDateRange($instituteId, $divisionId, $startDate, $endDate, $students);
            
            // Get month name
            $monthName = date('F', strtotime($startDate));
            
            // Generate report filename
            $filename = 'attendance_' . $division->division . '_' . $monthName . '_' . $year . '.' . $format;
            
            // Generate and return the report
            return $this->generateReport($reportData, $filename, $format, [
                'title' => 'Monthly Attendance Report',
                'period' => $monthName . ' ' . $year,
                'division' => $division->division
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error generating month report: ' . $e->getMessage());
            return $this->sendError('Failed to generate report', [], 500);
        }
    }
    
    /**
     * Helper method to get attendance data for a specific date
     *
     * @param int $instituteId
     * @param int $divisionId
     * @param string $date
     * @return array
     */
    private function getAttendanceDataForReport($instituteId, $divisionId, $date)
    {
        // Get all students in this division
        $students = Student::where('institute_id', $instituteId)
            ->where('division_id', $divisionId)
            ->get();
            
        // Get attendance records for the specified date and division
        $attendanceRecords = Attendance::where('institute_id', $instituteId)
            ->where('division_id', $divisionId)
            ->where('attendance_date', $date)
            ->get()
            ->keyBy('student_id');
        
        $attendanceData = [];
        
        foreach ($students as $student) {
            $attendance = $attendanceRecords->get($student->id);
            
            $attendanceData[] = [
                'prn' => $student->prn,
                'student_name' => $student->student_name,
                'status' => $attendance ? ($attendance->is_present ? 'Present' : 'Absent') : 'Not Recorded',
                'remarks' => $attendance ? $attendance->remarks : '',
            ];
        }
        
        return $attendanceData;
    }
    
    /**
     * Helper method to get attendance data for a date range
     *
     * @param int $instituteId
     * @param int $divisionId
     * @param string $startDate
     * @param string $endDate
     * @param \Illuminate\Database\Eloquent\Collection $students
     * @return array
     */
    private function getAttendanceDataForDateRange($instituteId, $divisionId, $startDate, $endDate, $students)
    {
        // Get all dates in the range
        $period = new \DatePeriod(
            new \DateTime($startDate),
            new \DateInterval('P1D'),
            new \DateTime($endDate . ' 23:59:59')
        );
        
        $dates = [];
        foreach ($period as $date) {
            $dates[] = $date->format('Y-m-d');
        }
        
        // Get attendance records for the date range
        $attendanceRecords = Attendance::where('institute_id', $instituteId)
            ->where('division_id', $divisionId)
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->get()
            ->groupBy('student_id');
        
        $reportData = [];
        
        // Prepare report data with student info and attendance for each date
        foreach ($students as $student) {
            $studentData = [
                'prn' => $student->prn,
                'student_name' => $student->student_name,
            ];
            
            $studentAttendance = $attendanceRecords->get($student->id, collect([]));
            $attendanceByDate = $studentAttendance->keyBy('attendance_date');
            
            // Add attendance status for each date
            foreach ($dates as $date) {
                $attendance = $attendanceByDate->get($date);
                $studentData['attendance_' . $date] = $attendance 
                    ? ($attendance->is_present ? 'Present' : 'Absent') 
                    : 'Not Recorded';
            }
            
            $reportData[] = $studentData;
        }
        
        return [
            'dates' => $dates,
            'students' => $reportData
        ];
    }
    
    /**
     * Generate and return a report file
     *
     * @param array $data
     * @param string $filename
     * @param string $format
     * @param array $reportInfo
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generateReport($data, $filename, $format, $reportInfo)
    {
        $tempFile = storage_path('app/' . $filename);
        
        if ($format === 'csv') {
            return $this->generateCsvReport($data, $tempFile, $reportInfo);
        } else {
            return $this->generatePdfReport($data, $tempFile, $reportInfo);
        }
    }
    
    /**
     * Generate a CSV report
     *
     * @param array $data
     * @param string $filepath
     * @param array $reportInfo
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generateCsvReport($data, $filepath, $reportInfo)
    {
        $handle = fopen($filepath, 'w');
        
        // Add report header info
        fputcsv($handle, [$reportInfo['title']]);
        
        if (isset($reportInfo['date'])) {
            fputcsv($handle, ['Date:', $reportInfo['date']]);
        } else if (isset($reportInfo['period'])) {
            fputcsv($handle, ['Period:', $reportInfo['period']]);
        }
        
        fputcsv($handle, ['Division:', $reportInfo['division']]);
        fputcsv($handle, []); // Empty row for spacing
        
        // For day report
        if (!isset($data['dates'])) {
            // Headers
            fputcsv($handle, ['PRN', 'Student Name', 'Status', 'Remarks']);
            
            // Data rows
            foreach ($data as $record) {
                fputcsv($handle, [
                    $record['prn'],
                    $record['student_name'],
                    $record['status'],
                    $record['remarks']
                ]);
            }
        } 
        // For week/month report
        else {
            $headers = ['PRN', 'Student Name'];
            
            // Format dates for headers
            foreach ($data['dates'] as $date) {
                $headers[] = date('d M', strtotime($date));
            }
            
            fputcsv($handle, $headers);
            
            // Data rows for each student
            foreach ($data['students'] as $record) {
                $row = [$record['prn'], $record['student_name']];
                
                foreach ($data['dates'] as $date) {
                    $row[] = $record['attendance_' . $date];
                }
                
                fputcsv($handle, $row);
            }
        }
        
        fclose($handle);
        
        // Return file as download response
        return response()->download($filepath)->deleteFileAfterSend(true);
    }
    
    /**
     * Generate a PDF report
     *
     * @param array $data
     * @param string $filepath
     * @param array $reportInfo
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generatePdfReport($data, $filepath, $reportInfo)
    {
        // Convert the data to HTML table first
        $html = '<h2>' . $reportInfo['title'] . '</h2>';
        $html .= '<p><strong>Division:</strong> ' . $reportInfo['division'] . '</p>';
        
        if (isset($reportInfo['date'])) {
            $html .= '<p><strong>Date:</strong> ' . $reportInfo['date'] . '</p>';
        } else if (isset($reportInfo['period'])) {
            $html .= '<p><strong>Period:</strong> ' . $reportInfo['period'] . '</p>';
        }
        
        $html .= '<table border="1" cellpadding="5" cellspacing="0" width="100%">';
        
        // For day report
        if (!isset($data['dates'])) {
            // Headers
            $html .= '<tr style="background-color: #f2f2f2;">';
            $html .= '<th>PRN</th>';
            $html .= '<th>Student Name</th>';
            $html .= '<th>Status</th>';
            $html .= '<th>Remarks</th>';
            $html .= '</tr>';
            
            // Data rows
            foreach ($data as $record) {
                $statusColor = $record['status'] === 'Present' ? '#d4edda' : 
                              ($record['status'] === 'Absent' ? '#f8d7da' : '#fff');
                
                $html .= '<tr>';
                $html .= '<td>' . $record['prn'] . '</td>';
                $html .= '<td>' . $record['student_name'] . '</td>';
                $html .= '<td style="background-color: ' . $statusColor . '">' . $record['status'] . '</td>';
                $html .= '<td>' . $record['remarks'] . '</td>';
                $html .= '</tr>';
            }
        }
        // For week/month report
        else {
            // Headers
            $html .= '<tr style="background-color: #f2f2f2;">';
            $html .= '<th>PRN</th>';
            $html .= '<th>Student Name</th>';
            
            // Format dates for headers
            foreach ($data['dates'] as $date) {
                $html .= '<th>' . date('d M', strtotime($date)) . '</th>';
            }
            
            $html .= '</tr>';
            
            // Data rows for each student
            foreach ($data['students'] as $record) {
                $html .= '<tr>';
                $html .= '<td>' . $record['prn'] . '</td>';
                $html .= '<td>' . $record['student_name'] . '</td>';
                
                foreach ($data['dates'] as $date) {
                    $status = $record['attendance_' . $date];
                    $statusColor = $status === 'Present' ? '#d4edda' : 
                                 ($status === 'Absent' ? '#f8d7da' : '#fff');
                    
                    $html .= '<td style="background-color: ' . $statusColor . '">' . $status . '</td>';
                }
                
                $html .= '</tr>';
            }
        }
        
        $html .= '</table>';
        
        // Create PDF using DomPDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        $pdf->save($filepath);
        
        // Return file as download response
        return response()->download($filepath)->deleteFileAfterSend(true);
    }
}
