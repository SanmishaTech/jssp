<?php

namespace App\Http\Controllers\Api;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\InventoryResource;
use App\Http\Controllers\Api\BaseController;

class InventoryController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Inventory::query();

        if($request->query('search')){
            $searchTerm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('asset', 'like', '%' . $searchTerm . '%');
            });
        }

        $inventory = $query->orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Inventory"=>InventoryResource::collection($inventory),
        'Pagination' => [
            'current_page' => $inventory->currentPage(),
            'last_page'=> $inventory->lastPage(),
            'per_page'=> $inventory->perPage(),
            'total'=> $inventory->total(),
        ]], "Inventory retrived successfully");

        
    }

    public function store(Request $request): JsonResponse
    {
     
        
        $inventory = new Inventory();
        $inventory->asset = $request->input('asset');
        $inventory->institute_id = $request->input('institute_id');
         $inventory->purchase_date = $request->input('purchase_date');
        $inventory->remarks = $request->input('remarks');
     
        if (!$inventory->save()) {
            return response()->json(['error' => 'Inventory creation failed'], 500);
        }

        return $this->sendResponse(
            [
                'Inventory' => new InventoryResource($inventory),
             ],
            'Inventory Created Successfully'
        );
    }

    public function show(string $id): JsonResponse
    {
         $inventory = Inventory::find($id);
        
         if (!$inventory) {
            return $this->sendError("Inventory not found", ['error' => 'Inventory not found']);
        }
    
         return $this->sendResponse(   new InventoryResource($inventory), "Inventory retrieved successfully");
    }



    public function update(Request $request, string $id): JsonResponse
    {
         $inventory = Inventory::find($id);
    
        // If the institute is not found, return an error
        if (!$inventory) {
            return $this->sendError("Inventory not found", ['error' => 'Inventory not found']);
        }
    
       
    
        
    
       
        // Update the Institute data
        $inventory->asset = $request->input('asset', $inventory->asset);
        $inventory->institute_id = $request->input('institute_id', $inventory->institute_id);
         $inventory->purchase_date = $request->input('purchase_date', $inventory->purchase_date);
        $inventory->remarks = $request->input('remarks', $inventory->remarks);
         $inventory->save();
    
        // Return the updated Institute data
        return $this->sendResponse(
            [
                "Inventory" => new InventoryResource($inventory),
              
            ],
            "Inventory Updated Successfully"
        );
    }


    public function destroy(string $id): JsonResponse
{
    $inventory = Inventory::find($id);
    if (!$inventory) {
        return $this->sendError("Inventory not found", ['error' => 'Inventory not found']);
    }
    $inventory->delete();

   

    return $this->sendResponse([], "Inventory Deleted Successfully");
}
}