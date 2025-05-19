<?php

namespace App\Http\Controllers\Api;

use App\Models\Cashier;
use App\Models\Peticash;
use App\Models\PeticashTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        DB::beginTransaction();
        try {
            // Create a new cashier record
            $cashier = new Cashier();
            $cashier->institute_id = Auth::user()->staff->institute_id;  
            $cashier->total_fees = $request->input('total_fees');
            $cashier->cheque = $request->input('cheque');
            $cashier->cash = $request->input('cash');
            $cashier->upi = $request->input('upi');
            $cashier->save();

            // Get or create peticash record for the institute
            $peticash = Peticash::where('institute_id', $cashier->institute_id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$peticash) {
                // Create a new peticash record if it doesn't exist
                $peticash = new Peticash();
                $peticash->institute_id = $cashier->institute_id;
                $peticash->total_amount = $cashier->total_fees;
                $peticash->note = 'Auto-created from cashier transaction';
                $peticash->note_amount = 0;
                $peticash->total_spend = 0;
                $peticash->save();

                // Create initial transaction for the new peticash
                $initialTransaction = new PeticashTransaction();
                $initialTransaction->peticash_id = $peticash->id;
                $initialTransaction->amount = $cashier->total_fees;
                $initialTransaction->description = 'Initial fund from Cashier (' . Auth::user()->name . ')';
                $initialTransaction->type = 'credit';
                $initialTransaction->balance_after = $cashier->total_fees;
                $initialTransaction->created_by = Auth::id();
                $initialTransaction->save();
            } else {
                // Update existing peticash total_amount
                $peticash->total_amount += $cashier->total_fees;
                $peticash->save();

                // Create a transaction record
                $transaction = new PeticashTransaction();
                $transaction->peticash_id = $peticash->id;
                $transaction->amount = $cashier->total_fees;
                $transaction->description = 'Cashier (' . Auth::user()->name . ')';
                $transaction->type = 'credit';
                $transaction->balance_after = $peticash->total_amount;
                $transaction->created_by = Auth::id();
                $transaction->save();
            }
            
            DB::commit();
            return $this->sendResponse(["Cashier" => new CashierResource($cashier)], "Cashier stored successfully");
        } catch (\Exception $e) {
            DB::rollback();
            return $this->sendError("Failed to store cashier", ['error' => $e->getMessage()]);
        }
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
    
    /**
     * Generate a PDF report of cashier data with date range filtering
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function generateReport(Request $request)
    {
        try {
            $instituteId = Auth::user()->staff->institute_id;
            
            $query = Cashier::where('institute_id', $instituteId);
            
            // Apply date range filter if provided
            if ($request->query('from_date') && $request->query('to_date')) {
                $fromDate = $request->query('from_date');
                $toDate = $request->query('to_date');
                
                // Add one day to to_date to include the end date in results (up to 23:59:59)
                $endDate = date('Y-m-d', strtotime($toDate . ' +1 day'));
                
                $query->whereBetween('created_at', [$fromDate, $endDate]);
            } 
            // For backward compatibility - single date filter
            else if ($request->query('date')) {
                $date = $request->query('date');
                $query->whereDate('created_at', $date);
            }
            
            // Apply search filter if provided
            if ($request->query('search')) {
                $searchTerm = $request->query('search');
                $query->where(function ($query) use ($searchTerm) {
                    $query->where('total_fees', 'like', '%' . $searchTerm . '%');
                });
            }
            
            $cashiers = $query->get();
            
            // Calculate total cash
            $totalCash = $cashiers->sum('cash');
            $totalUpi = $cashiers->sum('upi');
            $totalCheque = $cashiers->sum('cheque');
            $totalFees = $cashiers->sum('total_fees');
            
            // Set date range for report title
            $reportDateRange = 'Full Report';
            if ($request->query('from_date') && $request->query('to_date')) {
                $reportDateRange = date('d M Y', strtotime($request->query('from_date'))) . 
                    ' to ' . date('d M Y', strtotime($request->query('to_date')));
            } else if ($request->query('date')) {
                $reportDateRange = date('d M Y', strtotime($request->query('date')));
            }
            
            $data = [
                'cashiers' => $cashiers,
                'totalCash' => $totalCash,
                'totalUpi' => $totalUpi,
                'totalCheque' => $totalCheque,
                'totalFees' => $totalFees,
                'dateRange' => $reportDateRange,
                'date' => now()->format('Y-m-d'),
                'title' => 'Cashier Report',
                'institute' => Auth::user()->staff->institute->institute_name ?? 'N/A'
            ];
            
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.cashier_report', $data);
            $pdf->setPaper('a4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
                'defaultFont' => 'sans-serif'
            ]);
            
            // Generate filename with date range
            $filename = 'cashier_report';
            if ($request->query('from_date') && $request->query('to_date')) {
                $filename .= '_' . $request->query('from_date') . '_to_' . $request->query('to_date');
            } else if ($request->query('date')) {
                $filename .= '_' . $request->query('date');
            } else {
                $filename .= '_' . now()->format('Y-m-d');
            }
            $filename .= '.pdf';
            
            return $pdf->stream($filename, [
                'Attachment' => true,
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"'
            ]);  
        } catch (\Exception $e) {
            // Log the error
            \Log::error('PDF generation error: ' . $e->getMessage());
            return $this->sendError("Failed to generate PDF report", ['error' => $e->getMessage()]);
        }
    }
}