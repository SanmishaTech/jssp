<?php

namespace App\Http\Controllers\Api;

use App\Models\Bank;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\BankResource;
use App\Http\Resources\BankTransactionResource;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\DB;

class BankController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;
        $query = Bank::where('institute_id', $instituteId);

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('total_amount', 'like', '%' . $searchTerm . '%');
            });
        }

        if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

        $banks = $query->paginate(7);

        return $this->sendResponse(
            [
                "banks" => BankResource::collection($banks),
                'pagination' => [
                    'current_page' => $banks->currentPage(),
                    'last_page'    => $banks->lastPage(),
                    'per_page'     => $banks->perPage(),
                    'total'        => $banks->total(),
                ]
            ],
            "Banks retrieved successfully"
        );
    }

    public function store(Request $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $bank = new Bank();
            $bank->institute_id = Auth::user()->staff->institute_id;
            $bank->total_amount = $request->input('total_amount');
            $bank->note         = $request->input('note');
            $bank->note_amount  = $request->input('note_amount');
            $bank->total_spend  = 0;
            $bank->save();

            $transaction = new BankTransaction();
            $transaction->bank_id        = $bank->id;
            $transaction->amount         = $request->input('total_amount');
            $transaction->description    = 'Initial fund allocation';
            $transaction->type           = 'credit';
            $transaction->balance_after  = $request->input('total_amount');
            $transaction->created_by     = Auth::id();
            $transaction->save();

            DB::commit();
            return $this->sendResponse(["bank" => new BankResource($bank)], "Bank stored successfully");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->sendError("Failed to store bank", ['error' => $e->getMessage()]);
        }
    }

    public function show(string $id): JsonResponse
    {
        $bank = Bank::find($id);
        if (!$bank) {
            return $this->sendError("Bank not found", ['error' => 'Bank not found']);
        }
        return $this->sendResponse(["bank" => new BankResource($bank)], "Bank retrieved successfully");
    }

    public function update(Request $request, string $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $bank = Bank::find($id);
            if (!$bank) {
                return $this->sendError("Bank not found", ['error' => 'Bank not found']);
            }

            $previousAmount = $bank->total_amount;
            $newAmount      = $request->input('total_amount');

            $bank->institute_id = Auth::user()->staff->institute_id;
            $bank->total_amount = $newAmount;
            $bank->note         = $request->input('note');
            $bank->note_amount  = $request->input('note_amount');
            $bank->total_spend  = $request->input('total_spend', $bank->total_spend);
            $bank->save();

            if ($previousAmount != $newAmount) {
                $transaction = new BankTransaction();
                $transaction->bank_id = $bank->id;
                if ($newAmount > $previousAmount) {
                    $transaction->amount      = $newAmount - $previousAmount;
                    $transaction->type        = 'credit';
                    $transaction->description = 'Fund increase: ' . $request->input('note');
                } else {
                    $transaction->amount      = $previousAmount - $newAmount;
                    $transaction->type        = 'debit';
                    $transaction->description = 'Fund decrease: ' . $request->input('note');
                }
                $transaction->balance_after = $newAmount;
                $transaction->created_by    = Auth::id();
                $transaction->save();
            }

            DB::commit();
            return $this->sendResponse(["bank" => new BankResource($bank)], "Bank updated successfully");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->sendError("Failed to update bank", ['error' => $e->getMessage()]);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $bank = Bank::find($id);
        if (!$bank) {
            return $this->sendError("Bank not found", ['error' => 'Bank not found']);
        }
        $bank->delete();
        return $this->sendResponse([], "Bank deleted successfully");
    }

    /**
     * Get all banks for the institute.
     */
    public function allBanks(): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;
        $banks = Bank::where('institute_id', $instituteId)->get();

        return $this->sendResponse(
            ["banks" => BankResource::collection($banks)],
            "Banks retrieved successfully"
        );
    }

    /**
     * Record a new transaction for a bank account.
     */
    public function recordTransaction(Request $request, string $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $bank = Bank::find($id);
            if (!$bank) {
                return $this->sendError("Bank not found", ['error' => 'Bank not found']);
            }

            $amount      = (float) $request->input('amount');
            $description = $request->input('description');
            $type        = $request->input('type', 'debit');

            if ($type == 'debit') {
                if ($bank->total_amount < $amount) {
                    return $this->sendError("Insufficient funds", ['error' => 'Not enough balance']);
                }
                $newBalance = $bank->total_amount - $amount;
                $bank->total_amount   = $newBalance;
                $bank->total_spend    = ($bank->total_spend ?? 0) + $amount;
            } else {
                $newBalance = $bank->total_amount + $amount;
                $bank->total_amount = $newBalance;
            }

            if ($request->has('note')) {
                $bank->note = $request->input('note');
            }
            if ($request->has('note_amount')) {
                $bank->note_amount = $request->input('note_amount');
            }

            $bank->save();

            $transaction = new BankTransaction();
            $transaction->bank_id        = $bank->id;
            $transaction->amount         = $amount;
            $transaction->description    = $description;
            $transaction->type           = $type;
            $transaction->balance_after  = $newBalance;
            $transaction->payment_method     = $request->input('payment_method', 'cash');
            $transaction->payer_name         = $request->input('payer_name');
            $transaction->reference_number   = $request->input('reference_number');
            $transaction->created_by     = Auth::id();
            $transaction->bank_account_id = $request->input('bank_account_id');
            $transaction->save();

            DB::commit();
            return $this->sendResponse([
                "transaction" => new BankTransactionResource($transaction),
                "bank" => new BankResource($bank)
            ], "Transaction recorded successfully");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->sendError("Failed to record transaction", ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get transaction history for a bank account.
     */
    public function getTransactionHistory(string $id, Request $request): JsonResponse
    {
        $bank = Bank::find($id);
        if (!$bank) {
            return $this->sendError("Bank not found", ['error' => 'Bank not found']);
        }

        $query = BankTransaction::where('bank_id', $id);

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        if ($request->has('bank_account_name')) {
            $query->whereHas('bankAccount', function($q) use ($request) {
                $q->where('bank_name', 'like', '%' . $request->input('bank_account_name') . '%');
            });
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(5);

        return $this->sendResponse([
            "transactions" => BankTransactionResource::collection($transactions),
            "pagination" => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ],
            "bank" => new BankResource($bank)
        ], "Transaction history retrieved successfully");
    }
}
