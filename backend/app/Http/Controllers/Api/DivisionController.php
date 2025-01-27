<?php

namespace App\Http\Controllers\Api;

use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\DivisionResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Api\DivisionController;

class DivisionController extends BaseController
{
    public function index(Request $request):JsonResponse
    {
        $query = Division::query();
        if($request -> query('search')){
            $searchTerm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('division_name', 'like', '%' . $searchTerm . '%');
            });
        }

        $divisions = $query->orderBy("id", "DESC")->paginate(5);
        return $this->sendResponse(["Division"=>DivisionResource::collection($divisions),
        'Pagination' => [
            'current_page' => $divisions->currentPage(),
            'last_page'=> $divisions->lastPage(),
            'per_page'=> $divisions->perPage(),
            'total'=> $divisions->total(),
        ]], "Division retrived successfully");

    }



    public function store(Request $request): JsonResponse
    {
        $divisions = new Division();
        $divisions->institute_id = $request->input('institute_id');
        $divisions->course_id = $request->input('course_id');
        $divisions->semester_id = $request->input('semester_id');
        $divisions->room_id = $request->input('room_id');
        $divisions->division_name = $request->input('division_name');

        if(!$divisions -> save()){
            return response()->json(['error'=>'Division creation failed'], 500);
        }

        return $this->sendResponse(
            [
                'Divisions' => new DivisionResource($divisions),
            ],
            'Division Created Successfully'
        );



    }


    public function show(string $id): JsonResponse
    {
        $divisions = Division::find($id);

        if (!$divisions){
            return $this->sendError("Divisions not found", ['error' => 'Division not found']);
        }
        return $this -> sendResponse(new DivisionResponse($divisions), "Division retrived successfully");
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $divisions = Division::find($id);

        if(!$divisions) {
            return $this-> sendError("Divisions not found", ['error'=> 'Divisions not found']);
        }

        $divisions->institute_id = $request->input('institute_id');
        $divisions->course_id = $request->input('course_id');
        $divisions->semester_id = $request->input('semester_id');
        $divisions->room_id = $request->input('room_id');
        $divisions->division_name = $request->input('division_name');


        $divisions-> save();

        return $this->sendResponse(
            ["Divisions" => new DivisionResource($divisions)],
            "Divisions Updated Successfully"
        );
    }
    public function destroy(string $id): JsonResponse
    {
        $divisions = Division::find($id);
        if(!$divisions){
            return $this->sendError("Divisions not found", ['error' => 'Divisions not found']);
        }
        $divisions->delete();
        return $this->sendResponse([], "Divisions Deleted Successfully");
    }

    public function allDivisions(): Jsonresponse
    {
        $divisions = Division::all();
        return $this-> sendResponse(["Divisions" => DivisionResource::collection($divisions)], "Divisions retrieved successfully");
    }





}