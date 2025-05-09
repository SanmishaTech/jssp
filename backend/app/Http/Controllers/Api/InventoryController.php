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
        $inventory->asset = $request->input('asset');
        $inventory->quantity = $request->input('quantity');
        $inventory->room_id = $request->input('room_id');
        
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
        $inventory->quantity = $request->input('quantity', $inventory->quantity);
        $inventory->room_id = $request->input('room_id', $inventory->room_id);        
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
        $inventory->status = $request->input('status', $inventory->status);
        $inventory->scraped_amount = $request->input('scraped_amount', $inventory->scraped_amount);
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