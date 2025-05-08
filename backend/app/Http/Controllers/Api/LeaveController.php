<?php

namespace App\Http\Controllers\Api;

use App\Models\Leave;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\LeaveResource;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\BaseController;

class LeaveController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;
        
        $query = Leave::where('institute_id', $instituteId);
        
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('reason', 'like', '%' . $searchTerm . '%')
                      ->orWhere('status', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Add date filter
        if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }
        
        // Add status filter
        if ($request->query('status')) {
            $status = $request->query('status');
            $query->where('status', $status);
        }
        
        $leaves = $query->paginate(7);
        
        return $this->sendResponse(
            [
                "Leave" => LeaveResource::collection($leaves),
                'Pagination' => [
                    'current_page' => $leaves->currentPage(),
                    'last_page'    => $leaves->lastPage(),
                    'per_page'     => $leaves->perPage(),
                    'total'        => $leaves->total(),
                ]
            ],
            "Leave applications retrieved successfully"
        );
    }
    
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'required|string|min:10',
            'leave_type' => 'required|string',
         ]);

        if ($validator->fails()) {
            return $this->sendError('Validation error', $validator->errors());
        }

        $leave = new Leave();
        $leave->institute_id = Auth::user()->staff->institute_id;
        $leave->staff_id = Auth::user()->staff->id;
        $leave->date = now()->format('Y-m-d');
        $leave->from_date = $request->input('from_date');
        $leave->leave_type = $request->input('leave_type');
        $leave->to_date = $request->input('to_date');
        $leave->reason = $request->input('reason');
        $leave->status = 'pending';
        $leave->remarks = '';
        $leave->approved_by = '';
        $leave->approved_at = '';
        $leave->save();
        
        return $this->sendResponse(["Leave" => new LeaveResource($leave)], "Leave application submitted successfully");
    }

    public function show(string $id): JsonResponse
    {
        $leave = Leave::find($id);

        if(!$leave){
            return $this->sendError("Leave not found", ['error'=>'Leave not found']);
        }

        return $this->sendResponse(["Leave" => new LeaveResource($leave)], "Leave application retrieved successfully");
    }
    
    public function getByMember(): JsonResponse
    {
        $staff = Auth::user()->staff;
        
        if (!$staff) {
            return $this->sendError('User does not have an associated staff record');
        }
        
        $staffId = $staff->id;
        $instituteId = $staff->institute_id;
        
        if (!$instituteId) {
            return $this->sendError('User does not have an associated institute');
        }
        
        // Filter leaves by both institute_id and staff_id
        $leaves = Leave::where('institute_id', $instituteId)
            ->where('staff_id', $staffId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return $this->sendResponse(["Leave" => LeaveResource::collection($leaves)], "Leave applications retrieved successfully");
    }

    public function getByStatus(string $status): JsonResponse
    {
        if (!in_array($status, ['pending', 'approved', 'rejected'])) {
            return $this->sendError('Invalid status value');
        }

        $instituteId = Auth::user()->staff->institute_id;
        
        if (!$instituteId) {
            return $this->sendError('User does not have an associated institute');
        }
        
        $leaves = Leave::where('status', $status)
            ->where('institute_id', $instituteId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return $this->sendResponse(["Leave" => LeaveResource::collection($leaves)], "Leave applications retrieved successfully");
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'remarks' => 'nullable|string',
            'approved_by' => 'required|string',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation error', $validator->errors());
        }

        $leave = Leave::find($id);

        if(!$leave){
            return $this->sendError("Leave not found", ['error'=>'Leave not found']);
        }
        
        $leave->status = $request->input('status');
        $leave->remarks = $request->input('remarks') ?? '';
        $leave->approved_by = $request->input('approved_by');
        $leave->approved_at = now();
        $leave->save();

        return $this->sendResponse(["Leave" => new LeaveResource($leave)], "Leave application updated successfully");
    }
    
    public function destroy(string $id): JsonResponse
    {
        $leave = Leave::find($id);
        
        if(!$leave){
            return $this->sendError("Leave not found", ['error'=> 'Leave not found']);
        }
        
        $leave->delete();
        return $this->sendResponse([], "Leave application deleted successfully");
    }
    
    public function allLeaves(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter leaves based on the institute_id.
        $leaves = Leave::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Leave" => LeaveResource::collection($leaves)],
            "Leave applications retrieved successfully"
        );
    }
} 