<?php

namespace App\Http\Controllers;

use App\Models\Leave;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Api\BaseController;

class LeaveController extends BaseController
{
    /**
     * Store a newly created leave application in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'required|string|min:10',
         ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user is authenticated
        if (!Auth::check()) {
            return response()->json([
                'status' => false,
                'message' => 'You are not authenticated',
            ], 401);
        }

        // Get institute_id from request or from authenticated user
        $instituteId = $request->institute_id ?? Auth::user()->institute_id;
        
        if (!$instituteId) {
            return response()->json([
                'status' => false,
                'message' => 'User does not have an associated institute',
                'suggestion' => 'Please provide an institute_id in your request or ask an administrator to update your profile.'
            ], 400);
        }

        try {
            $leave = new Leave();
            $leave->institute_id = Auth::user()->staff->institute_id;  
            $leave->date = $request->date ?? now()->format('Y-m-d');
            $leave->from_date = $request->from_date;
            $leave->to_date = $request->to_date;
            $leave->reason = $request->reason;
            $leave->status = 'pending';
            $leave->remarks = '';
            $leave->approved_by = '';
            $leave->approved_at = '';
            $leave->save();

            return response()->json([
                'status' => true,
                'message' => 'Leave application submitted successfully',
                'data' => $leave
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to submit leave application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get leave applications for the authenticated member.
     *
     * @return \Illuminate\Http\Response
     */
    public function getByMember()
    {
        try {
            // Get the institute ID the same way we set it when creating a leave
            $instituteId = Auth::user()->staff->institute_id;
            
            if (!$instituteId) {
                return $this->sendError('User does not have an associated institute');
            }
            
            $leaves = Leave::where('institute_id', $instituteId)
                ->orderBy('created_at', 'desc')
                ->get();
                
            // Log number of records found for debugging
            Log::info("Found " . count($leaves) . " leave records for institute ID: " . $instituteId);

            return $this->sendResponse($leaves, 'Leave applications retrieved successfully');
        } catch (\Exception $e) {
            Log::error('Error fetching leave applications: ' . $e->getMessage());
            return $this->sendError('Failed to fetch leave applications', $e->getMessage());
        }
    }

    /**
     * Get leave applications by status.
     *
     * @param  string  $status
     * @return \Illuminate\Http\Response
     */
    public function getByStatus($status)
    {
        if (!in_array($status, ['pending', 'approved', 'rejected'])) {
            return $this->sendError('Invalid status value');
        }

        try {
            // Get the institute ID the same way we set it when creating a leave
            $instituteId = Auth::user()->staff->institute_id;
            
            if (!$instituteId) {
                return $this->sendError('User does not have an associated institute');
            }
            
            $leaves = Leave::where('status', $status)
                ->where('institute_id', $instituteId)
                ->orderBy('created_at', 'desc')
                ->get();
                
            Log::info("Found " . count($leaves) . " leave records with status '{$status}' for institute ID: " . $instituteId);

            return $this->sendResponse($leaves, 'Leave applications retrieved successfully');
        } catch (\Exception $e) {
            Log::error('Error fetching leave applications by status: ' . $e->getMessage());
            return $this->sendError('Failed to fetch leave applications', $e->getMessage());
        }
    }

    /**
     * Update the specified leave application in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'remarks' => 'nullable|string',
            'approved_by' => 'required|string',
            'approved_at' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $leave = Leave::findOrFail($id);
            $leave->status = $request->status;
            $leave->remarks = $request->remarks ?? '';
            $leave->approved_by = $request->approved_by;
            $leave->approved_at = $request->approved_at;
            $leave->save();

            return response()->json([
                'status' => true,
                'message' => 'Leave application updated successfully',
                'data' => $leave
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update leave application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 