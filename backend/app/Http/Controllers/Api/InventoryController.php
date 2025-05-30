<?php

namespace App\Http\Controllers\Api;

use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\InventoryResource;
use App\Http\Controllers\Api\BaseController;

class InventoryController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Inventory::query();

        // Get authenticated user
        $user = Auth::user();
        
        // If user is not superadmin, filter by their institute_id
        if ($user && $user->roles && $user->roles->first() && $user->roles->first()->name !== 'superadmin') {
            // Get the institute ID from the logged-in user's staff details.
            $instituteId = $user->staff->institute_id;
            // Filter inventory based on the institute_id
            $query->where('institute_id', $instituteId);
        }

        // Filter by institute_id if provided in the request
        if ($request->query('institute_id')) {
            $instituteId = $request->query('institute_id');
            $query->where('institute_id', $instituteId);
        }

        if($request->query('search')){
            $searchTerm = $request->query('search');

            $query->whereHas('institute', function($query) use ($searchTerm){
                $query->where('institute_name', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Filter by room name or ID
        if($request->query('room')){
            $roomSearch = $request->query('room');
            
            // If it's a numeric value, treat it as a room_id
            if(is_numeric($roomSearch)) {
                $query->where('room_id', $roomSearch);
            } else {
                // Get room IDs that match the search term
                $roomIds = \App\Models\Room::where('room_name', 'like', '%' . $roomSearch . '%')
                                           ->orWhere('room_number', 'like', '%' . $roomSearch . '%')
                                           ->pluck('id')
                                           ->toArray();
                
                // Filter inventory by those room IDs
                if(!empty($roomIds)) {
                    $query->whereIn('room_id', $roomIds);
                }
            }
        }
        
        // Filter by status if provided
        if($request->query('status')) {
            $status = $request->query('status');
            if($status === 'active') {
                // Check for any active-like status (active, available, in use, etc.)
                $query->where(function($q) {
                    $q->where('status', 'active stock')
                      ->orWhere('status', 'available')
                      ->orWhere('status', 'in use')
                      ->orWhereNull('status');
                });
            } else if($status === 'discarded') {
                // Check for any discarded-like status (discarded, disposed, damaged, etc.)
                $query->where(function($q) {
                    $q->where('status', 'discarded')
                      ->orWhere('status', 'disposed')
                      ->orWhere('status', 'damaged')
                      ->orWhere('status', 'inactive');
                });
            } else if($status === 'scraped') {
                // Check for any scraped-like status
                $query->where(function($q) {
                    $q->where('status', 'scraped')
                      ->orWhere('status', 'scrapped')
                      ->orWhere('status', 'scrap');
                });
            }
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
        $inventory->asset_master_id = $request->input('asset_master_id');
        $inventory->quantity = $request->input('quantity');
        $inventory->room_id = $request->input('room_id');
        
        // Handle asset categories
        if ($request->has('asset_category_ids')) {
            // Convert to JSON if array, or store directly if already JSON string
            $inventory->asset_category_ids = is_array($request->input('asset_category_ids')) 
                ? json_encode($request->input('asset_category_ids')) 
                : $request->input('asset_category_ids');
        }
        
        // Get authenticated user
        $user = Auth::user();
        
        // If role is superadmin, institute_id comes from input
        // If role is admin, use the admin's institute_id
        if ($user && $user->roles && $user->roles->first() && $user->roles->first()->name === 'superadmin') {
            $inventory->institute_id = $request->input('institute_id');
        } else {
            $inventory->institute_id = $user->staff->institute_id;
        }
        
        $inventory->purchase_date = $request->input('purchase_date');
        $inventory->purchase_price = $request->input('purchase_price');
        $inventory->status = $request->input('status');
        $inventory->scraped_amount = $request->input('scraped_amount');
        $inventory->scraped_quantity = $request->input('scraped_quantity');
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
    
        // If the inventory is not found, return an error
        if (!$inventory) {
            return $this->sendError("Inventory not found", ['error' => 'Inventory not found']);
        }
        
        // Check if we are scraping some quantity from this inventory
        $newStatus = $request->input('status', $inventory->status);
        $scrapedQuantity = $request->input('scraped_quantity');
        $originalQuantity = $inventory->quantity;
        
        // If status is set to Scraped and a specific quantity is being scraped
        if ($newStatus === 'Scraped' && !empty($scrapedQuantity) && $scrapedQuantity > 0 && $scrapedQuantity < $originalQuantity) {
            // Create a new record for the scraped inventory
            $scrapedInventory = new Inventory();
            $scrapedInventory->asset_master_id = $inventory->asset_master_id;
            $scrapedInventory->quantity = $scrapedQuantity;
            $scrapedInventory->room_id = $inventory->room_id;
            $scrapedInventory->institute_id = $inventory->institute_id;
            $scrapedInventory->purchase_date = $inventory->purchase_date;
            $scrapedInventory->purchase_price = $inventory->purchase_price;
            $scrapedInventory->asset_category_ids = $inventory->asset_category_ids; // Copy asset categories
            $scrapedInventory->status = 'Scraped';
            $scrapedInventory->scraped_amount = $request->input('scraped_amount');
            $scrapedInventory->scraped_quantity = $scrapedQuantity;
            $scrapedInventory->remarks = $request->input('remarks', $inventory->remarks) . ' (Scraped from inventory ID: ' . $inventory->id . ')';
            $scrapedInventory->save();
            
            // Update the original inventory with reduced quantity and keep it as active
            $inventory->quantity = $originalQuantity - $scrapedQuantity;
            $inventory->status = 'Active Stock'; // Reset to active since the scraped part is now in a separate record
            $inventory->scraped_amount = null; // Clear scraped amount as it's moved to the new record
            $inventory->scraped_quantity = null; // Clear scraped quantity as it's moved to the new record
            $inventory->remarks = $request->input('remarks', $inventory->remarks) . ' (Quantity reduced by ' . $scrapedQuantity . ' units that were scraped)';
            $inventory->save();
            
            // Return both records
            return $this->sendResponse(
                [
                    "Inventory" => new InventoryResource($inventory),
                    "ScrapedInventory" => new InventoryResource($scrapedInventory)
                ],
                "Inventory updated and scraped inventory created successfully"
            );
        } else {
            // Regular update without creating a new scraped record
            $inventory->asset_master_id = $request->input('asset', $inventory->asset_master_id);
            $inventory->quantity = $request->input('quantity', $inventory->quantity);
            $inventory->room_id = $request->input('room_id', $inventory->room_id);        
            
            // Handle asset categories update
            if ($request->has('asset_category_ids')) {
                // Convert to JSON if array, or store directly if already JSON string
                $inventory->asset_category_ids = is_array($request->input('asset_category_ids')) 
                    ? json_encode($request->input('asset_category_ids')) 
                    : $request->input('asset_category_ids');
            }
            
            // Get authenticated user
            $user = Auth::user();
            
            // If role is superadmin, institute_id comes from input
            // If role is admin, use the admin's institute_id
            if ($user && $user->roles && $user->roles->first() && $user->roles->first()->name === 'superadmin') {
                $inventory->institute_id = $request->input('institute_id', $inventory->institute_id);
            } else {
                $inventory->institute_id = $user->staff->institute_id;
            }
            
            $inventory->purchase_date = $request->input('purchase_date', $inventory->purchase_date);
            $inventory->purchase_price = $request->input('purchase_price', $inventory->purchase_price);
            $inventory->status = $newStatus;
            $inventory->scraped_amount = $request->input('scraped_amount', $inventory->scraped_amount);
            $inventory->scraped_quantity = $request->input('scraped_quantity', $inventory->scraped_quantity);
            $inventory->remarks = $request->input('remarks', $inventory->remarks);
            $inventory->save();
        
            // Return the updated inventory data
            return $this->sendResponse(
                [
                    "Inventory" => new InventoryResource($inventory),
                ],
                "Inventory Updated Successfully"
            );
        }
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