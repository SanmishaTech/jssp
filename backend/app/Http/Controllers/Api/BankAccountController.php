<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\BaseController;
use App\Models\BankAccount;
use App\Http\Resources\BankAccountResource;

class BankAccountController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering bank accounts based on the institute_id.
        $query = BankAccount::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('name', 'like', '%' . $searchTerm . '%')
                    ->orWhere('bank_name', 'like', '%' . $searchTerm . '%')
                    ->orWhere('account_number', 'like', '%' . $searchTerm . '%')
                    ->orWhere('ifsc_code', 'like', '%' . $searchTerm . '%')
                    ->orWhere('branch', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $bankaccount = $query->paginate(7);
    
        // Return the paginated response with bank account resources.
        return $this->sendResponse(
            [
                "BankAccount" => BankAccountResource::collection($bankaccount),
                'Pagination' => [
                    'current_page' => $bankaccount->currentPage(),
                    'last_page'    => $bankaccount->lastPage(),
                    'per_page'     => $bankaccount->perPage(),
                    'total'        => $bankaccount->total(),
                ]
            ],
            "BankAccount retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        // Create a new bank account record and assign the institute_id from the logged-in admin
        $bankaccount = new BankAccount();
        $bankaccount->institute_id = Auth::user()->staff->institute_id;  
        $bankaccount->name = $request->input('name');
        $bankaccount->bank_name = $request->input('bank_name');
        $bankaccount->account_number = $request->input('account_number');
        $bankaccount->ifsc_code = $request->input('ifsc_code');
        $bankaccount->branch = $request->input('branch');
        $bankaccount->address = $request->input('address');
        $bankaccount->email = $request->input('email');
        $bankaccount->phone = $request->input('phone');
        $bankaccount->save();
        
        return $this->sendResponse([new BankAccountResource($bankaccount)], "BankAccount stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $bankaccount = BankAccount::find($id);

        if(!$bankaccount){
            return $this->sendError("BankAccount not found", ['error'=>'BankAccount not found']);
        }

  
        return $this->sendResponse([ "BankAccount" => new BankAccountResource($bankaccount) ], "BankAccount retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $bankaccount = BankAccount::find($id);

        if(!$bankaccount){
            return $this->sendError("BankAccount not found", ['error'=>'BankAccount not found']);
        }
       
                       
        $bankaccount->institute_id = Auth::user()->staff->institute_id;  
        $bankaccount->name = $request->input('name');
        $bankaccount->bank_name = $request->input('bank_name');
        $bankaccount->account_number = $request->input('account_number');
        $bankaccount->ifsc_code = $request->input('ifsc_code');
        $bankaccount->branch = $request->input('branch');
        $bankaccount->address = $request->input('address');
        $bankaccount->email = $request->input('email');
        $bankaccount->phone = $request->input('phone');
        $bankaccount->save();
       
        return $this->sendResponse([ new BankAccountResource($bankaccount)], "BankAccount updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $bankaccount = BankAccount::find($id);
        if(!$bankaccount){
            return $this->sendError("BankAccount not found", ['error'=> 'BankAccount not found']);
        }
         $bankaccount->delete();
         return $this->sendResponse([], "BankAccount deleted successfully");
    }


    public function allBankAccounts(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter bank accounts based on the institute_id.
        $bankaccount = BankAccount::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["BankAccount" => BankAccountResource::collection($bankaccount)],
            "BankAccount retrieved successfully"
        );
    }
}