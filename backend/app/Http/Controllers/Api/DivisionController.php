<?php

namespace App\Http\Controllers\Api;

use App\Models\Division;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\DivisionResource;
use App\Http\Controllers\Api\BaseController;

class DivisionController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Division::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('division', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $division = $query->paginate(1);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Division" => DivisionResource::collection($division),
                'Pagination' => [
                    'current_page' => $division->currentPage(),
                    'last_page'    => $division->lastPage(),
                    'per_page'     => $division->perPage(),
                    'total'        => $division->total(),
                ]
            ],
            "Division retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $division = new Division();
        $division->institute_id = Auth::user()->staff->institute_id;  
        $division->course_id = $request->input('course_id');
        $division->semester_id = $request->input('semester_id');
        $division->room_id = $request->input('room_id');
        $division->division = $request->input('division');
        $division->save();
        
        return $this->sendResponse([new DivisionResource($division)], "Division stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $division = Division::find($id);

        if(!$division){
            return $this->sendError("Division not found", ['error'=>'Division not found']);
        }

  
        return $this->sendResponse([ "Division" => new DivisionResource($division) ], "Division retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $division = Division::find($id);

        if(!$division){
            return $this->sendError("Division not found", ['error'=>'Division not found']);
        }
       
                       
        $division->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $division->course_id = $request->input('course_id');
        $division->semester_id = $request->input('semester_id');
        $division->room_id = $request->input('room_id');
        $division->division = $request->input('division');
           $division->save();
       
        return $this->sendResponse([ new DivisionResource($division)], "Division updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $division = Division::find($id);
        if(!$division){
            return $this->sendError("Division not found", ['error'=> 'Division not found']);
        }
         $division->delete();
         return $this->sendResponse([], "Division deleted successfully");
    }


    public function allDivisions(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $division = Division::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Division" => DivisionResource::collection($division)],
            "Division retrieved successfully"
        );
    }
}