<?php

namespace App\Http\Controllers\Api;

use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\SemesterResource;
use App\Http\Controllers\Api\BaseController;

class SemesterController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Semester::query();

        if($request->query('search')){
            $searchTerm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('semester', 'like', '%' . $searchTerm . '%');
            });
        }

        $semesters = $query->orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Semester"=>SemesterResource::collection($semesters),
        'Pagination' => [
            'current_page' => $semesters->currentPage(),
            'last_page'=> $semesters->lastPage(),
            'per_page'=> $semesters->perPage(),
            'total'=> $semesters->total(),
        ]], "Semester retrived successfully");
    }

    public function store(Request $request): JsonResponse
    {
        $semesters = new Semester();
        $semesters->institute_id = $request->input('institute_id');
        $semesters->course_id = $request->input('course_id');
        $semesters->semester = $request->input('semester');
        $semesters->standard = $request->input('standard');

        if(!$semesters -> save()){
            return response()->json(['error'=>'Semester creation failed'], 500);
        }

        return $this->sendResponse(
            [
                'Semesters' => new SemesterResource($semesters),
            ],
            'Semester Created Successfully'
        );
    }

    public function show(string $id): JsonResponse
    {
        $semesters = Semester::find($id);

        if (!$semesters){
            return $this->sendError("Semesters not found", ['error' => 'Semester not found']);
        }
        return $this -> sendResponse(new SemesterResponse($semesters), "Semester retrived successfully");
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $semesters = Semester::find($id);

        if(!$semesters) {
            return $this-> sendError("Semesters not found", ['error'=> 'Semesters not found']);
        }

        $semesters->institute_id = $request->input('institute_id');
        $semesters->course_id = $request->input('course_id');
        $semesters->semester = $request->input('semester');
        $semesters->standard = $request->input('standard');


        $semesters-> save();

        return $this->sendResponse(
            ["Semesters" => new SemesterResource($semesters)],
            "Semesters Updated Successfully"
        );
    }


    public function destroy(string $id): JsonResponse
    {
        $semesters = Semester::find($id);
        if(!$semesters){
            return $this->sendError("Semesters not found", ['error' => 'Semesters not found']);
        }
        $semesters->delete();
        return $this->sendResponse([], "Semesters Deleted Successfully");
    }

    public function allSemesters(): Jsonresponse
    {
        $semesters = Semester::all();
        return $this-> sendResponse(["Semesters" => SemesterResource::collection($semesters)], "Semesters retrieved successfully");
    }


}