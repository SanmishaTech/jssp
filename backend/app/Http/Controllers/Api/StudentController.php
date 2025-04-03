<?php

namespace App\Http\Controllers\Api;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\StudentResource;
use App\Http\Controllers\Api\BaseController;

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
}