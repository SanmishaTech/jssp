<?php

namespace App\Http\Controllers\Api;

use App\Models\Peticash;
use App\Models\PeticashTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\PeticashResource;
use App\Http\Resources\PeticashTransactionResource;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\DB;

class PeticashController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;

        $query = Peticash::where('institute_id', $instituteId);

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('total_amount', 'like', '%' . $searchTerm . '%');
            });
        }

        // Add date filter
        if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

        $peticash = $query->paginate(7);

        return $this->sendResponse(
            [
                "Peticash" => PeticashResource::collection($peticash),
                'Pagination' => [
                    'current_page' => $peticash->currentPage(),
                    'last_page'    => $peticash->lastPage(),
                    'per_page'     => $peticash->perPage(),
                    'total'        => $peticash->total(),
                ]
            ],
            "Peticash retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            // Create a new peticash record and assign the institute_id from the logged-in admin
            $peticash = new Peticash();
            $peticash->institute_id = Auth::user()->staff->institute_id;  
            $peticash->total_amount = $request->input('total_amount');
            $peticash->note = $request->input('note');
            $peticash->note_amount = $request->input('note_amount');
            $peticash->total_spend = 0; // Initially no spending
            $peticash->save();
            
            // Record this as an initial credit transaction
            $transaction = new PeticashTransaction();
            $transaction->peticash_id = $peticash->id;
            $transaction->amount = $request->input('total_amount');
            $transaction->description = 'Initial fund allocation';
            $transaction->type = 'credit';
            $transaction->balance_after = $request->input('total_amount');
            $transaction->created_by = Auth::id();
            $transaction->save();
            
            DB::commit();
            return $this->sendResponse([ "Peticash" => new PeticashResource($peticash)], "Peticash stored successfully");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->sendError("Failed to store peticash", ['error' => $e->getMessage()]);
        }
    }


    public function show(string $id): JsonResponse
    {
        $peticash = Peticash::find($id);

        if(!$peticash){
            return $this->sendError("Peticash not found", ['error'=>'Peticash not found']);
        }

  
        return $this->sendResponse(["Peticash" => new PeticashResource($peticash) ], "Peticash retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $peticash = Peticash::find($id);

            if(!$peticash){
                return $this->sendError("Peticash not found", ['error'=>'Peticash not found']);
            }
            
            $previousAmount = $peticash->total_amount;
            $newAmount = $request->input('total_amount');
            
            $peticash->institute_id = Auth::user()->staff->institute_id;
            $peticash->total_amount = $newAmount;
            $peticash->note = $request->input('note');
            $peticash->note_amount = $request->input('note_amount');
            $peticash->total_spend = $request->input('total_spend');
            $peticash->save();
            
            // If the total amount has changed, record a transaction
            if ($previousAmount != $newAmount) {
                $transaction = new PeticashTransaction();
                $transaction->peticash_id = $peticash->id;
                
                if ($newAmount > $previousAmount) {
                    // This is a credit (adding funds)
                    $transaction->amount = $newAmount - $previousAmount;
                    $transaction->type = 'credit';
                    $transaction->description = 'Fund increase: ' . $request->input('note');
                } else {
                    // This is a debit (removing funds)
                    $transaction->amount = $previousAmount - $newAmount;
                    $transaction->type = 'debit';
                    $transaction->description = 'Fund decrease: ' . $request->input('note');
                }
                
                $transaction->balance_after = $newAmount;
                $transaction->created_by = Auth::id();
                $transaction->save();
            }
            
            DB::commit();
            return $this->sendResponse([ "Peticash" => new PeticashResource($peticash)], "Peticash updated successfully");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->sendError("Failed to update peticash", ['error' => $e->getMessage()]);
        }
    }


    public function destroy(string $id): JsonResponse
    {
        $peticash = Peticash::find($id);
        if(!$peticash){
            return $this->sendError("Peticash not found", ['error'=> 'Peticash not found']);
        }
         $peticash->delete();
         return $this->sendResponse([], "Peticash deleted successfully");
    }

    public function allRooms(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $peticash = Peticash::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Peticash" => PeticashResource::collection($peticash)],
            "Peticash retrieved successfully"
        );
    }
    
    /**
     * Record a new transaction for a peticash account.
     */
    public function recordTransaction(Request $request, string $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $peticash = Peticash::find($id);
            
            if (!$peticash) {
                return $this->sendError("Peticash not found", ['error' => 'Peticash not found']);
            }
            
            $amount = (float) $request->input('amount');
            $description = $request->input('description');
            $type = $request->input('type', 'debit'); // Default to debit
            
            if ($type == 'debit') {
                // Check if there's enough balance
                if ($peticash->total_amount < $amount) {
                    return $this->sendError("Insufficient funds", ['error' => 'Not enough balance in peticash account']);
                }
                
                // Update peticash balance
                $newBalance = $peticash->total_amount - $amount;
                $peticash->total_amount = $newBalance;
                $peticash->total_spend = ($peticash->total_spend ?? 0) + $amount;
            } else {
                // Credit transaction
                $newBalance = $peticash->total_amount + $amount;
                $peticash->total_amount = $newBalance;
            }
            
            // Update note if provided
            if ($request->has('note')) {
                $peticash->note = $request->input('note');
            }
            
            if ($request->has('note_amount')) {
                $peticash->note_amount = $request->input('note_amount');
            }
            
            $peticash->save();
            
            // Create the transaction record
            $transaction = new PeticashTransaction();
            $transaction->peticash_id = $peticash->id;
            $transaction->amount = $amount;
            $transaction->description = $description;
            $transaction->type = $type;
            $transaction->balance_after = $newBalance;
            $transaction->created_by = Auth::id();
            $transaction->save();
            
            DB::commit();
            
            return $this->sendResponse([
                "transaction" => new PeticashTransactionResource($transaction),
                "peticash" => new PeticashResource($peticash)
            ], "Transaction recorded successfully");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->sendError("Failed to record transaction", ['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Get transaction history for a peticash account.
     */
    public function getTransactionHistory(string $id, Request $request): JsonResponse
    {
        $peticash = Peticash::find($id);
        
        if (!$peticash) {
            return $this->sendError("Peticash not found", ['error' => 'Peticash not found']);
        }
        
        $query = PeticashTransaction::where('peticash_id', $id);
        
        // Apply filters if any
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }
        
        // Get transactions with pagination
        $transactions = $query->orderBy('created_at', 'desc')->paginate(10);
        
        return $this->sendResponse([
            "transactions" => PeticashTransactionResource::collection($transactions),
            "pagination" => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
            "peticash" => new PeticashResource($peticash)
        ], "Transaction history retrieved successfully");
    }
}