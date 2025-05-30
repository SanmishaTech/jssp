<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\AssetMaster;
use App\Http\Resources\AssetMasterResource;
use App\Http\Requests\AssetMasterRequest;

class AssetMasterController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
         $instituteId = Auth::user()->staff->institute_id;
    
         $query = AssetMaster::where('institute_id', $instituteId);
    
          if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('asset_type', 'like', '%' . $searchTerm . '%');
            });
        }

           // Add date filter
           if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

    
          $assetmaster = $query->paginate(7);
    
         return $this->sendResponse(
            [
                "AssetMaster" => AssetMasterResource::collection($assetmaster),
                'Pagination' => [
                    'current_page' => $assetmaster->currentPage(),
                    'last_page'    => $assetmaster->lastPage(),
                    'per_page'     => $assetmaster->perPage(),
                    'total'        => $assetmaster->total(),
                ]
            ],
            "AssetMaster retrieved successfully"
        );
    }


    public function store(AssetMasterRequest $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $assetmaster = new AssetMaster();
        $assetmaster->institute_id = Auth::user()->staff->institute_id;  
        $assetmaster->asset_category_ids = json_encode($request->input('asset_category_ids', []));
        $assetmaster->asset_type = $request->input('asset_type');
        $assetmaster->unit = $request->input('unit');
        $assetmaster->service_required = $request->input('service_required');
        $assetmaster->save();
        
        return $this->sendResponse([ "AssetMaster" => new AssetMasterResource($assetmaster)], "AssetMaster stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $assetmaster = AssetMaster::find($id);

        if(!$assetmaster){
            return $this->sendError("AssetMaster not found", ['error'=>'AssetMaster not found']);
        }

  
        return $this->sendResponse(["AssetMaster" => new AssetMasterResource($assetmaster) ], "AssetMaster retrived successfully");
    }


    public function update(AssetMasterRequest $request, string $id): JsonResponse
    {
 
        $assetmaster = AssetMaster::find($id);

        if(!$assetmaster){
            return $this->sendError("AssetMaster not found", ['error'=>'AssetMaster not found']);
        }
       
                       
        $assetmaster->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $assetmaster->asset_category_ids = json_encode($request->input('asset_category_ids', []));
        $assetmaster->asset_type = $request->input('asset_type');
        $assetmaster->unit = $request->input('unit');
        $assetmaster->service_required = $request->input('service_required');
        $assetmaster->save();
       
        return $this->sendResponse([ "AssetMaster" => new AssetMasterResource($assetmaster)], "AssetMaster updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $assetmaster = AssetMaster::find($id);
        if(!$assetmaster){
            return $this->sendError("AssetMaster not found", ['error'=> 'AssetMaster not found']);
        }
         $assetmaster->delete();
         return $this->sendResponse([], "AssetMaster deleted successfully");
    }

    public function allAssetMaster(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $assetmaster = AssetMaster::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["AssetMaster" => AssetMasterResource::collection($assetmaster)],
            "AssetMaster retrieved successfully"
        );
    }
}
