<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\CourseRequest;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CourseResource;
use App\Http\Controllers\Api\BaseController;

class CourseController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Course::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('medium_code', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $course = $query->paginate(15);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Course" => CourseResource::collection($course),
                'Pagination' => [
                    'current_page' => $course->currentPage(),
                    'last_page'    => $course->lastPage(),
                    'per_page'     => $course->perPage(),
                    'total'        => $course->total(),
                ]
            ],
            "Course retrieved successfully"
        );
    }


    public function store(CourseRequest $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $course = new Course();
        $course->institute_id = Auth::user()->staff->institute_id;  
        $course->medium_code = $request->input('medium_code');
        $course->medium_title = $request->input('medium_title');
        $course->organization = $request->input('organization');
        $course->save();
        
        return $this->sendResponse([ "Courses" => new CourseResource($course)], "Course stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $course = Course::find($id);

        if(!$course){
            return $this->sendError("Course not found", ['error'=>'Course not found']);
        }

  
        return $this->sendResponse([ "Courses" => new CourseResource($course) ], "Course retrived successfully");
    }


    public function update(CourseRequest $request, string $id): JsonResponse
    {
 
        $course = Course::find($id);

        if(!$course){
            return $this->sendError("Course not found", ['error'=>'Course not found']);
        }
       
                       
        $course->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
         $course->medium_code = $request->input('medium_code');
        $course->medium_title = $request->input('medium_title');
        $course->organization = $request->input('organization');
           $course->save();
       
        return $this->sendResponse([ "Courses" => new CourseResource($course)], "Course updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $course = Course::find($id);
        if(!$course){
            return $this->sendError("Course not found", ['error'=> 'Course not found']);
        }
         $course->delete();
         return $this->sendResponse([], "Course deleted successfully");
    }

}