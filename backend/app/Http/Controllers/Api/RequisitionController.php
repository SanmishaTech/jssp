<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use App\Models\Requisition;
use App\Models\User;
use App\Http\Resources\RequisitionResource;

class RequisitionController extends BaseController
{   
    /**
     * Get admin's requisitions (for superadmin only)
     */
    public function getAdminRequisitions(Request $request): JsonResponse
    {
        // Only superadmins can access this endpoint
        if (!Auth::user()->hasRole('superadmin')) {
            return $this->sendError("Unauthorized", ['error'=> 'You are not authorized to view admin requisitions']);
        }
        
        // Get all requisitions created by users with admin role
        $status = $request->query('status', 'pending');
        
        // First, get all users with admin role
        $admins = User::role('admin')->pluck('id');
        
        // Then get requisitions from those users with the specified status
        $query = Requisition::with(['assetMaster', 'requester', 'approver'])
                           ->whereIn('requested_by', $admins)
                           ->where('status', $status)
                           ->orderBy('created_at', 'desc');
        
        $adminRequisitions = $query->paginate(10);
        
        return $this->sendResponse(
            [
                "Requisition" => RequisitionResource::collection($adminRequisitions),
                'Pagination' => [
                    'current_page' => $adminRequisitions->currentPage(),
                    'last_page'    => $adminRequisitions->lastPage(),
                    'per_page'     => $adminRequisitions->perPage(),
                    'total'        => $adminRequisitions->total(),
                ]
            ],
            "Admin requisitions retrieved successfully"
        );
    }
    
    /**
     * Get pending requisitions from admins (for superadmin only)
     */
    public function getAdminPendingRequisitions(): JsonResponse
    {
        // Only superadmins can access this endpoint
        if (!Auth::user()->hasRole('superadmin')) {
            return $this->sendError("Unauthorized", ['error'=> 'You are not authorized to view admin pending requisitions']);
        }
        
        // First, get all users with admin role
        $admins = User::role('admin')->pluck('id');
        
        // Then get pending requisitions from those users
        $query = Requisition::with(['assetMaster', 'requester', 'approver'])
                           ->whereIn('requested_by', $admins)
                           ->where('status', 'pending')
                           ->orderBy('created_at', 'desc');
        
        $adminRequisitions = $query->paginate(10);
        
        return $this->sendResponse(
            [
                "PendingApprovals" => RequisitionResource::collection($adminRequisitions),
                'Pagination' => [
                    'current_page' => $adminRequisitions->currentPage(),
                    'last_page'    => $adminRequisitions->lastPage(),
                    'per_page'     => $adminRequisitions->perPage(),
                    'total'        => $adminRequisitions->total(),
                ]
            ],
            "Admin pending requisitions retrieved successfully"
        );
    }
    
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
        $userId = Auth::id();
        $isAdmin = Auth::user()->hasRole('admin');
    
        // Start the query by filtering requisitions based on the institute_id.
        $query = Requisition::with(['assetMaster', 'requester', 'approver'])
                         ->where('institute_id', $instituteId);
        
        // If not admin, only show requisitions created by the current user
        if (!$isAdmin) {
            $query->where('requested_by', $userId);
        }
        
        // If there's a status filter, apply it
        if ($request->has('status') && in_array($request->status, ['pending', 'approved', 'rejected'])) {
            $query->where('status', $request->status);
        }
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('description', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Apply sorting (default to latest first)
        $query->orderBy('created_at', 'desc');
    
        // Paginate the results.
        $requisition = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Requisition" => RequisitionResource::collection($requisition),
                'Pagination' => [
                    'current_page' => $requisition->currentPage(),
                    'last_page'    => $requisition->lastPage(),
                    'per_page'     => $requisition->perPage(),
                    'total'        => $requisition->total(),
                ]
            ],
            "Requisition retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'asset_master_id' => 'required|exists:asset_masters,id',
            'description' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors());
        }
        
        // Create a new requisition and assign the institute_id from the logged-in user
        $requisition = new Requisition();
        $requisition->institute_id = Auth::user()->staff->institute_id;  
        $requisition->asset_master_id = $request->input('asset_master_id');
        $requisition->description = $request->input('description');
        $requisition->requested_by = Auth::id(); // Set the current user as requester
        $requisition->status = 'pending'; // Default status
        $requisition->save();
        
        return $this->sendResponse([ "Requisition" => new RequisitionResource($requisition)], "Requisition request submitted successfully");
    }


    public function show(string $id): JsonResponse
    {
        $requisition = Requisition::find($id);

        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=>'Requisition not found']);
        }

  
        return $this->sendResponse(["Requisition" => new RequisitionResource($requisition) ], "Requisition retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
        $requisition = Requisition::find($id);

        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=>'Requisition not found']);
        }

        // Only allow updates if the requisition is still pending or if user is admin
        if ($requisition->status !== 'pending' && !Auth::user()->hasRole('admin')) {
            return $this->sendError("Cannot update processed requisition", ['error'=>'This requisition has already been processed']);
        }
        
        // If user is the requester and status is pending, they can update details
        if (Auth::id() === $requisition->requested_by && $requisition->status === 'pending') {
            // Validate input for regular update
            $validator = Validator::make($request->all(), [
                'asset_master_id' => 'required|exists:asset_masters,id',
                'description' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error.', $validator->errors());
            }
            
            $requisition->asset_master_id = $request->input('asset_master_id');
            $requisition->description = $request->input('description');
        }
        // If user is admin, they can approve/reject
        elseif (Auth::user()->hasRole('admin')) {
            // Validate input for admin approval/rejection
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:approved,rejected',
                'comments' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return $this->sendError('Validation Error.', $validator->errors());
            }
            
            $requisition->status = $request->input('status');
            $requisition->comments = $request->input('comments');
            $requisition->approved_by = Auth::id();
            $requisition->approval_date = Carbon::now();
        } else {
            return $this->sendError("Unauthorized", ['error'=>'You are not authorized to update this requisition']);
        }
        
        $requisition->save();
       
        return $this->sendResponse([ "Requisition" => new RequisitionResource($requisition)], "Requisition updated successfully");
    }


    public function destroy(string $id): JsonResponse
    {
        $requisition = Requisition::find($id);
        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=> 'Requisition not found']);
        }
        
        // Only allow deletion if the requisition is pending and user is the requester or admin
        if ($requisition->status !== 'pending' && !Auth::user()->hasRole('admin')) {
            return $this->sendError("Cannot delete processed requisition", ['error'=> 'This requisition has already been processed']);
        }
        
        if (Auth::id() !== $requisition->requested_by && !Auth::user()->hasRole('admin')) {
            return $this->sendError("Unauthorized", ['error'=> 'You are not authorized to delete this requisition']);
        }
        
        $requisition->delete();
        return $this->sendResponse([], "Requisition deleted successfully");
    }

    public function allRequisitions(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
        $userId = Auth::id();
        $isAdmin = Auth::user()->hasRole('admin');
    
        // Filter requisitions based on the institute_id
        $query = Requisition::where('institute_id', $instituteId);
        
        // If not admin, only show requisitions created by the current user
        if (!$isAdmin) {
            $query->where('requested_by', $userId);
        }
        
        // Order by created_at (newest first)
        $query->orderBy('created_at', 'desc');
        
        $requisition = $query->get();
    
        return $this->sendResponse(
            ["Requisition" => RequisitionResource::collection($requisition)],
            "Requisition retrieved successfully"
        );
    }
    
    /**
     * Get requisition history for the current user or all users (admin only)
     */
    public function history(Request $request): JsonResponse
    {
        try {
            // Get the institute ID from the logged-in user's staff details.
            $user = Auth::user();
            if (!$user || !$user->staff) {
                return $this->sendError("User or staff details not found", ['error' => 'Authentication issue']);
            }

            $instituteId = $user->staff->institute_id;
            $userId = Auth::id();
            $isAdmin = $user->hasRole('admin');
            
            // Build the query based on user role
            $query = Requisition::with(['assetMaster', 'requester', 'approver'])
                    ->where('institute_id', $instituteId);
            
            // If not admin, only show the current user's requisitions
            if (!$isAdmin) {
                $query->where('requested_by', $userId);
            }
            
            // For history, include all requisitions or filter by status
            // If empty result set is an issue, we can include pending status as well
            if ($request->has('include_all') && $request->include_all) {
                // Include all statuses if specifically requested
            } else {
                $query->whereIn('status', ['approved', 'rejected', 'pending']);
            }
            
            // Apply date filters if provided
            if ($request->has('from_date') && $request->has('to_date')) {
                $query->whereBetween('created_at', [$request->from_date, $request->to_date]);
            }
            
            // Apply sorting (default to latest first)
            $query->orderBy('created_at', 'desc'); // Changed from approval_date to created_at
            
            // Log the generated SQL query for debugging
            \Log::info('History query: ' . $query->toSql(), $query->getBindings());
            
            // Execute query and check if we got results
            $history = $query->paginate(10);
            
            if ($history->isEmpty()) {
                \Log::info('No history records found for user: ' . $userId . ', institute: ' . $instituteId);
                // Instead of an error, return an empty collection
                return $this->sendResponse(
                    [
                        "History" => [],
                        'Pagination' => [
                            'current_page' => 1,
                            'last_page'    => 1,
                            'per_page'     => 10,
                            'total'        => 0,
                        ]
                    ],
                    "No requisition history found"
                );
            }
            
            return $this->sendResponse(
                [
                    "History" => RequisitionResource::collection($history),
                    'Pagination' => [
                        'current_page' => $history->currentPage(),
                        'last_page'    => $history->lastPage(),
                        'per_page'     => $history->perPage(),
                        'total'        => $history->total(),
                    ]
                ],
                "Requisition history retrieved successfully"
            );
        } catch (\Exception $e) {
            \Log::error('Error in history method: ' . $e->getMessage());
            return $this->sendError("Error retrieving history", ['error' => $e->getMessage()]);
        }
    }
    
    /**
     * Get pending requisitions for admin approval
     */
    public function pendingApprovals(): JsonResponse
    {
        // Only admins or superadmins can access this endpoint
        if (!Auth::user()->hasRole('admin') && !Auth::user()->hasRole('superadmin')) {
            return $this->sendError("Unauthorized", ['error'=> 'You are not authorized to view pending approvals']);
        }
        
        // Get the institute ID from the logged-in admin's staff details.
        $instituteId = Auth::user()->staff->institute_id;
        $userId = Auth::id();
        
        // Get all pending requisitions for this institute EXCEPT the admin's own requisitions
        // This prevents conflict of interest - admins shouldn't approve their own requests
        $query = Requisition::with(['assetMaster', 'requester', 'approver'])
                           ->where('institute_id', $instituteId)
                           ->where('status', 'pending')
                           ->where('requested_by', '!=', $userId) // Exclude admin's own requisitions
                           ->orderBy('created_at', 'asc'); // Oldest first, FIFO
        
        $pendingRequisitions = $query->paginate(10);
        
        return $this->sendResponse(
            [
                "PendingApprovals" => RequisitionResource::collection($pendingRequisitions),
                'Pagination' => [
                    'current_page' => $pendingRequisitions->currentPage(),
                    'last_page'    => $pendingRequisitions->lastPage(),
                    'per_page'     => $pendingRequisitions->perPage(),
                    'total'        => $pendingRequisitions->total(),
                ]
            ],
            "Pending requisition approvals retrieved successfully"
        );
    }
    
    /**
     * Get admin's own pending requisitions
     */
    public function adminOwnRequisitions(): JsonResponse
    {
        // Only admins can access this endpoint
        if (!Auth::user()->hasRole('admin')) {
            return $this->sendError("Unauthorized", ['error'=> 'You are not authorized to view admin requisitions']);
        }
        
        // Get the institute ID and user ID from the logged-in admin
        $instituteId = Auth::user()->staff->institute_id;
        $userId = Auth::id();
        
        // Get admin's own pending requisitions
        $query = Requisition::with(['assetMaster', 'requester', 'approver'])
                           ->where('institute_id', $instituteId)
                           ->where('requested_by', $userId)
                           ->where('status', 'pending')
                           ->orderBy('created_at', 'desc'); // Newest first
        
        $adminRequisitions = $query->paginate(10);
        
        return $this->sendResponse(
            [
                "AdminRequisitions" => RequisitionResource::collection($adminRequisitions),
                'Pagination' => [
                    'current_page' => $adminRequisitions->currentPage(),
                    'last_page'    => $adminRequisitions->lastPage(),
                    'per_page'     => $adminRequisitions->perPage(),
                    'total'        => $adminRequisitions->total(),
                ]
            ],
            "Admin's own requisitions retrieved successfully"
        );
    }
    
    /**
     * Approve a requisition (admin only)
     */
    public function approve(Request $request, string $id): JsonResponse
    {
        // Only admins can approve requisitions
        if (!Auth::user()->hasRole('admin')) {
            return $this->sendError("Unauthorized", ['error'=> 'You are not authorized to approve requisitions']);
        }
        
        $requisition = Requisition::find($id);
        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=> 'Requisition not found']);
        }
        
        // Only pending requisitions can be approved
        if ($requisition->status !== 'pending') {
            return $this->sendError("Cannot approve", ['error'=> 'This requisition has already been processed']);
        }
        
        // Update the requisition status
        $requisition->status = 'approved';
        $requisition->approved_by = Auth::id();
        $requisition->approval_date = Carbon::now();
        $requisition->comments = $request->input('comments');
        $requisition->save();
        
        return $this->sendResponse([ "Requisition" => new RequisitionResource($requisition)], "Requisition approved successfully");
    }
    
    /**
     * Reject a requisition (admin only)
     */
    public function reject(Request $request, string $id): JsonResponse
    {
        // Only admins can reject requisitions
        if (!Auth::user()->hasRole('admin')) {
            return $this->sendError("Unauthorized", ['error'=> 'You are not authorized to reject requisitions']);
        }
        
        // Validate that comments are provided for rejection
        $validator = Validator::make($request->all(), [
            'comments' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error.', $validator->errors());
        }
        
        $requisition = Requisition::find($id);
        if(!$requisition){
            return $this->sendError("Requisition not found", ['error'=> 'Requisition not found']);
        }
        
        // Only pending requisitions can be rejected
        if ($requisition->status !== 'pending') {
            return $this->sendError("Cannot reject", ['error'=> 'This requisition has already been processed']);
        }
        
        // Update the requisition status
        $requisition->status = 'rejected';
        $requisition->approved_by = Auth::id(); // Still uses approved_by for record keeping
        $requisition->approval_date = Carbon::now();
        $requisition->comments = $request->input('comments'); // Reason for rejection
        $requisition->save();
        
        return $this->sendResponse([ "Requisition" => new RequisitionResource($requisition)], "Requisition rejected successfully");
    }
}
