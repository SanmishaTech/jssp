<?php

namespace App\Http\Controllers\Api;

 use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
 use App\Http\Resources\SemesterResource;
use App\Http\Requests\SemesterRequest;
use App\Http\Controllers\Api\BaseController;

class SemesterController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Semester::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('semester', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $semester = $query->paginate(1);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Semester" => SemesterResource::collection($semester),
                'Pagination' => [
                    'current_page' => $semester->currentPage(),
                    'last_page'    => $semester->lastPage(),
                    'per_page'     => $semester->perPage(),
                    'total'        => $semester->total(),
                ]
            ],
            "Semester retrieved successfully"
        );
    }


    public function store(SemesterRequest $request): JsonResponse
    {
        // Create a new staff record and assign the institute_id from the logged-in admin
        $semester = new Semester();
        $semester->institute_id = Auth::user()->staff->institute_id;  
        $semester->course_id = $request->input('course_id');
        $semester->semester = $request->input('semester');
        $semester->standard = $request->input('standard');
         $semester->save();
        
        return $this->sendResponse([new SemesterResource($semester)], "Semester stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $semester = Semester::find($id);

        if(!$semester){
            return $this->sendError("Semester not found", ['error'=>'Semester not found']);
        }

  
        return $this->sendResponse([ "Semester" => new SemesterResource($semester) ], "Semester retrived successfully");
    }


    public function update(SemesterRequest $request, string $id): JsonResponse
    {
 
        $semester = Semester::find($id);

        if(!$semester){
            return $this->sendError("Semester not found", ['error'=>'Semester not found']);
        }
       
                       
        $semester->institute_id = Auth::user()->staff->institute_id; 
        $semester->course_id = $request->input('course_id');
        $semester->semester = $request->input('semester');
        $semester->standard = $request->input('standard');
           
        $semester->save();
       
        return $this->sendResponse([ new SemesterResource($semester)], "Semester updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $semester = Semester::find($id);
        if(!$semester){
            return $this->sendError("Semester not found", ['error'=> 'Semester not found']);
        }
         $semester->delete();
         return $this->sendResponse([], "Semester deleted successfully");
    }

    public function allSemesters(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $semester = Semester::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Semester" => SemesterResource::collection($semester)],
            "Semester retrieved successfully"
        );
    }
}