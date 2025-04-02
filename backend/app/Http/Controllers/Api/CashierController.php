<?php

namespace App\Http\Controllers\Api;

use App\Models\Cashier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CashierResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Api\CashierController;

class CashierController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
         $instituteId = Auth::user()->staff->institute_id;
    
         $query = Cashier::where('institute_id', $instituteId);
    
          if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('total_fees', 'like', '%' . $searchTerm . '%');
            });
        }

           // Add date filter
           if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

    
          $cashier = $query->paginate(7);
    
         return $this->sendResponse(
            [
                "Cashier" => CashierResource::collection($cashier),
                'Pagination' => [
                    'current_page' => $cashier->currentPage(),
                    'last_page'    => $cashier->lastPage(),
                    'per_page'     => $cashier->perPage(),
                    'total'        => $cashier->total(),
                ]
            ],
            "Cashier retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $cashier = new Cashier();
        $cashier->institute_id = Auth::user()->staff->institute_id;  
        $cashier->total_fees = $request->input('total_fees');
        $cashier->cheque = $request->input('cheque');
        $cashier->cash = $request->input('cash');
        $cashier->upi = $request->input('upi');
        $cashier->save();
        
        return $this->sendResponse([ "Cashier" => new CashierResource($cashier)], "Cashier stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $cashier = Cashier::find($id);

        if(!$cashier){
            return $this->sendError("Cashier not found", ['error'=>'Cashier not found']);
        }

  
        return $this->sendResponse(["Cashier" => new CashierResource($cashier) ], "Cashier retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $cashier = Cashier::find($id);

        if(!$cashier){
            return $this->sendError("Cashier not found", ['error'=>'Cashier not found']);
        }
       
                       
        $cashier->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $cashier->total_fees = $request->input('total_fees');
        $cashier->cheque = $request->input('cheque');
        $cashier->cash = $request->input('cash');
        $cashier->upi = $request->input('upi');
        $cashier->save();
       
        return $this->sendResponse([ "Cashier" => new CashierResource($cashier)], "Cashier updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $cashier = Cashier::find($id);
        if(!$cashier){
            return $this->sendError("Cashier not found", ['error'=> 'Cashier not found']);
        }
         $cashier->delete();
         return $this->sendResponse([], "Cashier deleted successfully");
    }

    public function allCashier(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $cashier = Cashier::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Cashier" => CashierResource::collection($cashier)],
            "Cashier retrieved successfully"
        );
    }
}