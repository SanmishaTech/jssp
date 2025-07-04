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
use App\Models\Notification;

class LeaveController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        $role = $user->roles->first()->name ?? null;
        
        // Initialize query
        $query = Leave::query();
        
        if ($role === 'superadmin') {
            // For superadmin, only show admin's leave applications
            $query->whereHas('staff.user.roles', function($q) {
                $q->where('name', 'admin');
            });
        } else {
            // For other roles, filter by institute
            $instituteId = $user->staff->institute_id;
            $query->where('institute_id', $instituteId);
        }
        
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

        // Notify relevant approvers
        $user = Auth::user();
        $roles = $user->roles->pluck('name');
        $instituteId = $user->staff->institute_id;
        $title = 'New Leave Application';
        $description = $user->name . ' has applied for leave from ' . $leave->from_date . ' to ' . $leave->to_date . '.';
        $link = '/leaveapproval';

        if ($roles->contains('admin')) {
            // Admin leave requests go to superadmin
            Notification::sendToRoles(['superadmin'], $title, $description, $link, $user);
        } else {
            // Other staff leave requests go to admin & viceprincipal of same institute
            Notification::sendToInstituteRoles($instituteId, ['admin', 'viceprincipal'], $title, $description, $link, $user);
        }
        
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
        $user = Auth::user();
        $staff = $user->staff;
        $role = $user->roles->first()->name ?? null;
        
        if (!$staff) {
            return $this->sendError('User does not have an associated staff record');
        }
        
        $staffId = $staff->id;
        $instituteId = $staff->institute_id;
        
        if (!$instituteId && $role !== 'superadmin') {
            return $this->sendError('User does not have an associated institute');
        }
        
        // For superadmin, get only admin's leave applications
        if ($role === 'superadmin') {
            $query = Leave::whereHas('staff.user.roles', function($q) {
                $q->where('name', 'admin');
            });
        } else {
            // For others, get their own applications
            $query = Leave::where('staff_id', $staffId);
            $query->where('institute_id', $instituteId);
        }
        
        $leaves = $query->orderBy('created_at', 'desc')->get();
            
        return $this->sendResponse(["Leave" => LeaveResource::collection($leaves)], "Leave applications retrieved successfully");
    }

    public function getByStatus(string $status): JsonResponse
    {
        if (!in_array($status, ['pending', 'approved', 'rejected'])) {
            return $this->sendError('Invalid status value');
        }

        $user = Auth::user();
        $role = $user->roles->first()->name ?? null;
        $staff = $user->staff;
        $instituteId = $staff ? $staff->institute_id : null;
        $staffId = $staff ? $staff->id : null;
        
        if (!$instituteId && $role !== 'superadmin') {
            return $this->sendError('User does not have an associated institute');
        }
        
        // Initialize query with status filter
        $query = Leave::where('status', $status);
        
        if ($role === 'superadmin') {
            // For superadmin, only show admin's leave applications
            $query->whereHas('staff.user.roles', function($q) {
                $q->where('name', 'admin');
            });
        } else if ($role === 'admin') {
            // For admin, show all institute applications except their own
            $query->where('institute_id', $instituteId)
                  ->where(function($q) use ($staffId) {
                      // Exclude admin's own applications from approval page
                      $q->where('staff_id', '!=', $staffId);
                  });
        } else {
            // For other roles, filter by institute
            $query->where('institute_id', $instituteId);
        }
        
        $leaves = $query->orderBy('created_at', 'desc')->get();
            
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

        if ($leave->status === 'approved') {
            Notification::sendToAdmins(
                'Leave Application Approved',
                'A leave application for ' . $leave->staff->user->name . ' has been approved.',
                '/leaves/' . $leave->id, // Note: You may need to adjust this link to match your frontend routes
                Auth::user()
            );
        }

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
        $user = Auth::user();
        $role = $user->roles->first()->name ?? null;
        
        // Initialize query
        $query = Leave::query();
        
        if ($role === 'superadmin') {
            // For superadmin, only show admin's leave applications
            $query->whereHas('staff.user.roles', function($q) {
                $q->where('name', 'admin');
            });
        } else {
            // For other roles, filter by institute
            $instituteId = $user->staff->institute_id;
            $query->where('institute_id', $instituteId);
        }
        
        $leaves = $query->get();
    
        return $this->sendResponse(
            ["Leave" => LeaveResource::collection($leaves)],
            "Leave applications retrieved successfully"
        );
    }
} 