<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Http\Resources\ProfileResource;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = new UserResource(User::find($this->user_id));

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'institute_id' => $this->institute_id,
            'contact_name' =>$this->contact_name,
            'email' => $this->email,
            'mobile' => $this->mobile,
            //additional details of members
            //employee details
            'staff_number' => $this->staff_number,
            'first_name' => $this->first_name,
            'middle-name' => $this->middle_name,
            'last_name' => $this->last_name,
            'gender' => $this->gender,
            'maritial_status' => $this->maritial_status,
            'blood_group' => $this->blood_group,
            'date_of_birth' => $this->date_of_birth,
            //address 
            'corresponding_address' =>$this->corresponding_address,
            'permanent_address' => $this->permanent_address,
            //contact details
            'personal_email'=> $this->personal_email,
            'mobile'=> $this->mobile,
            'alternate_mobile' => $this->alternate_mobile,
            'landline'=> $this->landline,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'institute'=>$this->institute,
            'user'=> $user,
        ];
    }
}