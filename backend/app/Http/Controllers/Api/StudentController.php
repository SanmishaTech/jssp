<?php

namespace App\Http\Controllers\Api;

use App\Models\Student;
use App\Models\Subject;
use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\StudentResource;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class StudentController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Student::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('student_name', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $student = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Student" => StudentResource::collection($student),
                'Pagination' => [
                    'current_page' => $student->currentPage(),
                    'last_page'    => $student->lastPage(),
                    'per_page'     => $student->perPage(),
                    'total'        => $student->total(),
                ]
            ],
            "Student retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $student = new Student();
        $student->institute_id = Auth::user()->staff->institute_id;  
        $student->subject_id  = $request->input('subject_id');
        $student->division_id = $request->input('division_id');
        $student->student_name = $request->input('student_name');
        $student->prn = $request->input('prn');
        $student->save();
        
        return $this->sendResponse([new StudentResource($student)], "Student stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $student = Student::find($id);

        if(!$student){
            return $this->sendError("Student not found", ['error'=>'Student not found']);
        }

  
        return $this->sendResponse([ "Student" => new StudentResource($student) ], "Student retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $student = Student::find($id);

        if(!$student){
            return $this->sendError("Student not found", ['error'=>'Student not found']);
        }
       
                       
        $student->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
         $student->subject_id  = $request->input('subject_id');
        $student->division_id = $request->input('division_id');
        $student->student_name = $request->input('student_name');
        $student->prn = $request->input('prn');
        $student->save();
       
        return $this->sendResponse([ new StudentResource($student)], "Student updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $student = Student::find($id);
        if(!$student){
            return $this->sendError("Student not found", ['error'=> 'Student not found']);
        }
         $student->delete();
         return $this->sendResponse([], "Student deleted successfully");
    }


    public function allStudents(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $student = Student::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Student" => StudentResource::collection($student)],
            "Student retrieved successfully"
        );
    }

    /**
     * Import students from Excel file
     */
    public function import(Request $request): JsonResponse
    {
        // Validate the uploaded file
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 422);
        }

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            if (empty($rows) || count($rows) < 2) {
                return $this->sendError('Import Error', ['error' => 'The uploaded file is empty or does not contain any data rows.'], 422);
            }
            
            // Get header row and map column indices
            $headers = array_map('trim', $rows[0]);
            $columnMap = [
                'student_name' => array_search('Student Name', $headers),
                'prn' => array_search('PRN', $headers),
                'subject' => array_search('Subject', $headers) !== false ? array_search('Subject', $headers) : array_search('Subject Name', $headers),
                'division' => array_search('Division', $headers) !== false ? array_search('Division', $headers) : array_search('Division Name', $headers)
            ];
            
            // Validate that all required columns are present
            foreach ($columnMap as $key => $index) {
                if ($index === false) {
                    return $this->sendError('Import Error', ['error' => "Required column '{$key}' not found in the uploaded file."], 422);
                }
            }
            
            // Skip header row
            $dataRows = array_slice($rows, 1);
            $instituteId = Auth::user()->staff->institute_id;
            $importCount = 0;
            $errors = [];
            $errorRows = [];
            
            // Get all subjects and divisions for this institute for lookup
            $subjects = Subject::where('institute_id', $instituteId)->get();
            $divisions = Division::where('institute_id', $instituteId)->get();
            
            // Log the number of subjects and divisions found
            \Log::info('Import subjects count: ' . $subjects->count());
            \Log::info('Import divisions count: ' . $divisions->count());
            \Log::info('Column mapping: ' . json_encode($columnMap));
            
            foreach ($dataRows as $index => $row) {
                $rowNum = $index + 2; // +2 because of 1-indexing and header row
                
                // Skip empty rows
                if (empty($row[$columnMap['student_name']]) && empty($row[$columnMap['prn']])) {
                    \Log::info('Skipping empty row: ' . $rowNum);
                    continue;
                }
                
                // Log the row data for debugging
                \Log::info('Processing row: ' . $rowNum . ', Data: ' . json_encode($row));
                
                // Check if subject and division columns have values
                if (!isset($row[$columnMap['subject']]) || !isset($row[$columnMap['division']])) {
                    $errors[] = 'Row ' . $rowNum . ': Missing subject or division';
                    $errorRows[] = $rowNum;
                    \Log::warning('Missing subject or division in row: ' . $rowNum);
                    continue;
                }
                
                // Find subject ID by name
                $subject_name = trim($row[$columnMap['subject']]);
                \Log::info('Looking for subject: ' . $subject_name);
                
                $subject = $subjects->first(function($item) use ($subject_name) {
                    return strtolower(trim($item->subject_name)) === strtolower($subject_name);
                });
                
                if (!$subject) {
                    $errors[] = 'Row ' . $rowNum . ': Subject "' . $subject_name . '" not found';
                    $errorRows[] = $rowNum;
                    \Log::warning('Subject not found: ' . $subject_name);
                    continue; // Skip if subject not found
                }
                
                // Find division ID by name
                $division_name = trim($row[$columnMap['division']]);
                \Log::info('Looking for division: ' . $division_name);
                
                $division = $divisions->first(function($item) use ($division_name) {
                    return strtolower(trim($item->division)) === strtolower($division_name);
                });
                
                if (!$division) {
                    $errors[] = 'Row ' . $rowNum . ': Division "' . $division_name . '" not found';
                    $errorRows[] = $rowNum;
                    \Log::warning('Division not found: ' . $division_name);
                    continue; // Skip if division not found
                }
                
                try {
                    // Create new student
                    $student = new Student();
                    $student->student_name = trim($row[$columnMap['student_name']]);
                    $student->prn = trim($row[$columnMap['prn']]);
                    $student->subject_id = $subject->id;
                    $student->division_id = $division->id;
                    $student->institute_id = $instituteId;
                    $student->save();
                    
                    \Log::info('Student created: ' . $student->id);
                    $importCount++;
                } catch (\Exception $e) {
                    $errors[] = 'Row ' . $rowNum . ': ' . $e->getMessage();
                    $errorRows[] = $rowNum;
                    \Log::error('Error creating student: ' . $e->getMessage());
                }
            }
            
            $message = "Successfully imported {$importCount} students";
            $response = ['count' => $importCount];
            
            
            if (!empty($errors)) {
                $response['errors'] = $errors;
                $response['errorRows'] = $errorRows;
                if ($importCount == 0) {
                    $message = "No students were imported. Please check the errors.";
                } else {
                    $message = "Imported {$importCount} students with some errors.";
                }
            }
            
            return $this->sendResponse($response, $message);
            
        } catch (\Exception $e) {
            return $this->sendError('Import Error', ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Download the student import template
     */
    public function downloadTemplate(): JsonResponse
    {
        try {
            $filePath = public_path('excel/students.xlsx');
            if (!file_exists($filePath)) {
                $filePath = base_path('excel/students.xlsx');
                if (!file_exists($filePath)) {
                    return $this->sendError('Template Error', ['error' => 'Template file not found'], 404);
                }
            }
            
            return response()->download($filePath, 'students.xlsx', [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => 'attachment; filename="students.xlsx"'
            ]);
        } catch (\Exception $e) {
            return $this->sendError('Download Error', ['error' => $e->getMessage()], 500);
        }
    }
}