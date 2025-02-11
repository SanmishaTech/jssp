<?php

namespace App\Http\Controllers\Api;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Http\Controllers\Api\BaseController;


/**
 * @group Course
 */

class CourseController extends BaseController
{
    /**
     * Paginate Course.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::query();
        if ($request -> query('search')){
            $searchTerm = $request -> query('search');

            $query -> where(function($query) use ($searchTerm){
                $query -> where('medium_code', 'like', '%' . $searchTerm . '%');
            });
        }


        $courses = $query -> orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Courses"=>CourseResource::collection($courses),
        'Pagination'=> [
            'current_page'=>$courses->currentpage(),
            'last_page'=>$courses->lastpage(),
            'per_page'=>$courses->perPage(),
            'total'=>$courses->total(),
        ]],"Courses retrived successfully");
    }

    /**
     * Store Courses
     * @bodyParam institute_id string The Insitute id of the Course.
     * @bodyParam medium_code string The Medium Code of the Course.
     * @bodyParam medium_title string The Medium Title of the Course.
     * @bodyParam organization string The Organization of the Course.
     */

    public function store(Request $request): JsonResponse
    {
        $courses = new Course();
        $courses->institute_id = $request->input('institute_id');
        $courses->medium_code = $request->input('medium_code');
        $courses->medium_title = $request->input('medium_title');
        $courses->organization = $request->input('organization');

        if(!$courses -> save()){
            return response()->json(['error'=>'Course creation failed'], 500);
        }

        return $this->sendResponse(
            [
                'Courses' => new CourseResource($courses),
            ],
            'Courses Created Successfully'
        );
    }

    /**
     * Show Course
     */

    public function show(string $id): JsonResponse
    {
        $courses = Courses::find($id);

        if (!$courses){
            return $this->sendError("Courses not found", ['error' => 'Course not found']);
        }
        return $this -> sendResponse(new CourseResponse($courses), "Course retrived successfully");
    }

    /**
     * Update Course
     * @bodyParam institute_id string The Institute id of the Course.
     * @bodyParam medium_code string The Medium Code of the Course.
     * @bodyParam medium_title string The Medium Title of the Course.
     * @bodyParam organization string The Organization of the Course.
     */

    public function update(Request $request, string $id): JsonResponse
    {
        $courses = Course::find($id);

        if(!$courses) {
            return $this-> sendError("Courses not found", ['error'=> 'Course not found']);
        }

        $courses->institute_id = $request->input('institute_id');
        $courses->medium_code = $request->input('medium_code');
        $courses->medium_title = $request->input('medium_title');
        $courses->organization = $request->input('organization');

        $courses-> save();

        return $this->sendResponse(
            ["Courses" => new CourseResource($courses)],
            "Courses Updated Successfully"
        );
    }

    /**
     * Destory Course
     */

    public function destroy(string $id): JsonResponse
    {
        $courses = Course::find($id);
        if(!$courses){
            return $this->sendError("Courses not found", ['error' => 'Courses not found']);
        }
        $courses->delete();
        return $this->sendResponse([], "Courses Deleted Successfully");
    }

    /**
     * Show all Course
     */

    public function allCourses(): Jsonresponse
    {
        $courses = Course::all();
        return $this-> sendResponse(["Courses" => CoursesResource::collection($courses)], "Courses retrieved successfully");
    }


}