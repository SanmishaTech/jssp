<?php

namespace App\Http\Controllers\Api;

use App\Models\Admission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\AdmissionResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Api\AdmissionController;

class AdmissionController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
         $instituteId = Auth::user()->staff->institute_id;
    
         $query = Admission::where('institute_id', $instituteId);
    
          if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('room_name', 'like', '%' . $searchTerm . '%');
            });
        }
    
          $admission = $query->paginate(7);
    
         return $this->sendResponse(
            [
                "Admission" => AdmissionResource::collection($admission),
                'Pagination' => [
                    'current_page' => $admission->currentPage(),
                    'last_page'    => $admission->lastPage(),
                    'per_page'     => $admission->perPage(),
                    'total'        => $admission->total(),
                ]
            ],
            "Admission retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $admission = new Admission();
        $admission->institute_id = Auth::user()->staff->institute_id;  
        $admission->total_valuation = $request->input('total_valuation');
        $admission->university_upload = $request->input('university_upload');
        $admission->received_prn = $request->input('received_prn');
        $admission->save();
        
        return $this->sendResponse([ "Admission" => new AdmissionResource($admission)], "Admission stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $admission = Admission::find($id);

        if(!$admission){
            return $this->sendError("Admission not found", ['error'=>'Admission not found']);
        }

  
        return $this->sendResponse(["Admission" => new AdmissionResource($admission) ], "Admission retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $admission = Admission::find($id);

        if(!$admission){
            return $this->sendError("Admission not found", ['error'=>'Admission not found']);
        }
       
                       
        $admission->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $admission->total_valuation = $request->input('total_valuation');
        $admission->university_upload = $request->input('university_upload');
        $admission->received_prn = $request->input('received_prn');
           $admission->save();
       
        return $this->sendResponse([ "Admission" => new AdmissionResource($admission)], "Admission updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $admission = Admission::find($id);
        if(!$admission){
            return $this->sendError("Admission not found", ['error'=> 'Admission not found']);
        }
         $admission->delete();
         return $this->sendResponse([], "Admission deleted successfully");
    }

    public function allRooms(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $admission = Admission::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Admission" => AdmissionResource::collection($admission)],
            "Admission retrieved successfully"
        );
    }
}