<?php

namespace App\Http\Controllers\Api;

use App\Models\Student;
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
     * Generate an Excel template for student import
     */
    public function downloadTemplate(Request $request)
    {
        // Create spreadsheet object
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Set headers
        $sheet->setCellValue('A1', 'Student Name');
        $sheet->setCellValue('B1', 'PRN');
        $sheet->setCellValue('C1', 'Subject ID');
        $sheet->setCellValue('D1', 'Division ID');
        
        // Add some sample data
        $sheet->setCellValue('A2', 'John Doe');
        $sheet->setCellValue('B2', 'PRN12345');
        $sheet->setCellValue('C2', '1');  // Example subject ID
        $sheet->setCellValue('D2', '1');  // Example division ID
        
        // Create a temporary file
        $fileName = 'students_template.xlsx';
        $tempPath = storage_path('app/public/' . $fileName);
        
        $writer = new Xlsx($spreadsheet);
        $writer->save($tempPath);
        
        // Return the file as download response
        return response()->download($tempPath, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
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
            
            // Skip header row
            $dataRows = array_slice($rows, 1);
            $instituteId = Auth::user()->staff->institute_id;
            $importCount = 0;
            
            foreach ($dataRows as $row) {
                // Skip empty rows
                if (empty($row[0]) && empty($row[1])) {
                    continue;
                }
                
                // Create new student
                $student = new Student();
                $student->student_name = $row[0];
                $student->prn = $row[1];
                $student->subject_id = $row[2];
                $student->division_id = $row[3];
                $student->institute_id = $instituteId;
                $student->save();
                
                $importCount++;
            }
            
            return $this->sendResponse(
                ['count' => $importCount],
                "Successfully imported {$importCount} students"
            );
            
        } catch (\Exception $e) {
            return $this->sendError('Import Error', ['error' => $e->getMessage()], 500);
        }
    }
}