<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\BaseController;
use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\PurchaseOrderResource;

class PurchaseOrderController extends BaseController
{
    /**
     * Get asset categories by asset ID
     *
     * @param string $assetId
     * @return JsonResponse
     */
    public function getAssetCategoriesByAsset(string $assetId): JsonResponse
    {
        try {
            // Get the asset master record
            $assetMaster = \App\Models\AssetMaster::find($assetId);
            
            if (!$assetMaster) {
                return $this->sendError("Asset not found", ['error' => 'Asset not found'], 404);
            }
            
            // Get the asset categories linked to this asset
            $categoriesJson = $assetMaster->asset_category_ids;
            
            // If no categories found, return empty array
            if (empty($categoriesJson)) {
                return $this->sendResponse(["AssetCategories" => []], "No categories found for this asset");
            }
            
            // Parse the JSON string to get category IDs
            $categoryIds = json_decode($categoriesJson, true);
            
            // Extract just the values if it's an array of objects with 'value' property
            $categoryIdValues = [];
            foreach ($categoryIds as $category) {
                if (is_array($category) && isset($category['value'])) {
                    $categoryIdValues[] = $category['value'];
                } else {
                    $categoryIdValues[] = $category;
                }
            }
            
            // Query to get the actual category records
            $assetCategories = \App\Models\AssetCategory::whereIn('id', $categoryIdValues)->get();
            
            return $this->sendResponse(["AssetCategories" => $assetCategories], "Asset categories retrieved successfully");
        } catch (\Exception $e) {
            return $this->sendError("Error retrieving asset categories", ['error' => $e->getMessage()]);
        }
    }
    
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $instituteId = $user->staff->institute_id;
    
        // Base query: PurchaseOrders related to the institute
        $query = PurchaseOrder::with('staff')->where('institute_id', $instituteId);
    
        // // If the user is not admin or viceprincipal, limit to their own purchase orders
        // if (!$user->hasRole(['admin', 'viceprincipal'])) {
        //     $query->where('staff_id', $user->staff->id);
        // }
    
        // Apply search filtering if present    
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('vendor_id', 'like', '%' . $searchTerm . '%')
                      ->orWhere('asset_master_id', 'like', '%' . $searchTerm . '%')
                      ->orWhereHas('staff', function ($q) use ($searchTerm) {
                          $q->where('staff_name', 'like', '%' . $searchTerm . '%');
                      });
            });
        }
    
        // Filter by specific staff if provided
        if ($request->query('staff_id')) {
            $query->where('staff_id', $request->query('staff_id'));
        }
    
        // Pagination parameters
        $perPage = $request->query('per_page', 9);
        $purchaseOrders = $query->paginate($perPage, ['*'], 'page', $request->query('page', 1));
    
        return $this->sendResponse(
            [
                "PurchaseOrder" => PurchaseOrderResource::collection($purchaseOrders),
                'Pagination' => [
                    'current_page' => $purchaseOrders->currentPage(),
                    'last_page'    => $purchaseOrders->lastPage(),
                    'per_page'     => $purchaseOrders->perPage(),
                    'total'        => $purchaseOrders->total(),
                ]
            ],
            "PurchaseOrder retrieved successfully"
        );
    }
    


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $purchaseOrder = new PurchaseOrder();
        $purchaseOrder->institute_id = Auth::user()->staff->institute_id; 
         $purchaseOrder->vendor_id = $request->input('vendor_id');
         $purchaseOrder->asset_master_id = $request->input('asset_master_id');
        $purchaseOrder->asset_category_ids = $request->input('asset_category_ids');
        $purchaseOrder->quantity = $request->input('quantity');
        $purchaseOrder->price = $request->input('price');
        $purchaseOrder->description = $request->input('description');
         $purchaseOrder->save();
        
        return $this->sendResponse([ "PurchaseOrder" => new PurchaseOrderResource($purchaseOrder)], "PurchaseOrder stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::with('staff')->find($id);

        if(!$purchaseOrder){
            return $this->sendError("PurchaseOrder not found", ['error'=>'PurchaseOrder not found']);
        }

  
        return $this->sendResponse(["PurchaseOrder" => new PurchaseOrderResource($purchaseOrder) ], "PurchaseOrder retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $purchaseOrder = PurchaseOrder::with('staff')->find($id);

        if(!$purchaseOrder){
            return $this->sendError("PurchaseOrder not found", ['error'=>'PurchaseOrder not found']);
        }
       
                       
        $purchaseOrder->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $purchaseOrder->vendor_id = $request->input('vendor_id');
        $purchaseOrder->asset_master_id = $request->input('asset_master_id');
        $purchaseOrder->asset_category_ids = $request->input('asset_category_ids');
        $purchaseOrder->quantity = $request->input('quantity');
        $purchaseOrder->price = $request->input('price');
        $purchaseOrder->description = $request->input('description');
     
           $purchaseOrder->save();
       
        return $this->sendResponse([ "PurchaseOrder" => new PurchaseOrderResource($purchaseOrder)], "PurchaseOrder updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::with('staff')->find($id);
        if(!$purchaseOrder){
            return $this->sendError("PurchaseOrder not found", ['error'=> 'PurchaseOrder not found']);
        }
         $purchaseOrder->delete();
         return $this->sendResponse([], "PurchaseOrder deleted successfully");
    }

    public function allPurchaseOrders(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $purchaseOrder = PurchaseOrder::with('staff')->where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["PurchaseOrder" => PurchaseOrderResource::collection($purchaseOrder)],
            "PurchaseOrder retrieved successfully"
        );
    }
}
