<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\Auth;
use App\Models\Requisition;
use App\Http\Resources\RequisitionResource;

class RequisitionController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering requisitions based on the institute_id.
        $query = Requisition::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('description', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $requisition = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Requisition" => RequisitionResource::collection($requisition),
                'Pagination' => [
                    'current_page' => $requisition->currentPage(),
                    'last_page'    => $requisition->lastPage(),
                    'per_page'     => $requisition->perPage(),
                    'total'        => $requisition->total(),
                ]
            ],
            "Requisition retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $requisition = new Requisition();
        $requisition->institute_id = Auth::user()->staff->institute_id;  
        $requisition->asset_master_id = $request->input('asset_master_id');
        $requisition->description = $request->input('description');
        $requisition->save();
        
        return $this->sendResponse([ "Requisition" => new RequisitionResource($requisition)], "Requisition stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $requisition = Requisition::find($id);

        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=>'Requisition not found']);
        }

  
        return $this->sendResponse(["Requisition" => new RequisitionResource($requisition) ], "Requisition retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $requisition = Requisition::find($id);

        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=>'Requisition not found']);
        }
       
                       
        $requisition->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $requisition->asset_master_id = $request->input('asset_master_id');
        $requisition->description = $request->input('description');
        $requisition->save();
       
        return $this->sendResponse([ "Requisition" => new RequisitionResource($requisition)], "Requisition updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $requisition = Requisition::find($id);
        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=> 'Requisition not found']);
        }
         $requisition->delete();
         return $this->sendResponse([], "Requisition deleted successfully");
    }

    public function allRequisitions(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter requisition based on the institute_id.
        $requisition = Requisition::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Requisition" => RequisitionResource::collection($requisition)],
            "Requisition retrieved successfully"
        );
    }
}
