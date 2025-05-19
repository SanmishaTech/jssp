<?php

namespace App\Http\Resources;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

class LeaveResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get staff details if staff_id exists
        $staff = null;
        $staffName = null;
        $staffRole = null;
        
        if ($this->staff_id) {
            $staff = Staff::find($this->staff_id);
            $staffName = $staff ? $staff->staff_name : null;
            
            // Get staff role
            if ($staff && $staff->user_id) {
                $role = DB::table('model_has_roles')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->where('model_has_roles.model_id', $staff->user_id)
                    ->select('roles.name')
                    ->first();
                    
                $staffRole = $role ? $role->name : null;
            }
        }
        
        // Get institute name if institute_id exists
        $instituteName = $this->institute ? $this->institute->institute_name : null;
        
        // Get approver details if approved_by exists
        $approverName = null;
        if ($this->approved_by) {
            $approver = User::find($this->approved_by);
            $approverName = $approver ? $approver->name : null;
        }
        
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'institute_name' => $instituteName,
            'staff_id' => $this->staff_id,
            'staff_name' => $staffName,
            'staff_role' => $staffRole,
            'date' => $this->date,
            'from_date' => $this->from_date,
            'to_date' => $this->to_date,
            'leave_type' => $this->leave_type,
            'reason' => $this->reason,
            'status' => $this->status,
            'remarks' => $this->remarks,
            'approved_by' => $this->approved_by,
            'approver_name' => $approverName,
            'approved_at' => $this->approved_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
