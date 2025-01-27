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
            'employee_number' => $this->employee_number,
            'first_name' => $this->first_name,
            'middle-name' => $this->middle_name,
            'last_name' => $this->last_name,
            'spouse' => $this->spouse,
            'gender' => $this->gender,
            'maritial_status' => $this->maritial_status,
            'blood_group' => $this->blood_group,
            //address 
            'corresponding_address' =>$this->corresponding_address,
            'permanent_address' => $this->permanent_address,
            //contact details
            'personal_email'=> $this->personal_email,
            'mobile'=> $this->mobile,
            'landline'=> $this->landline,
            //company details
            'state'=> $this->state,
            'branch'=> $this->branch,
            'location' => $this->location,
            'designation' => $this->designation,
            'department' => $this-> department,
            'date_of_birth'=> $this-> date_of_birth,
            'joining_date' => $this->joining_date,
            'probation_date' => $this->probation_date,
            'confirmation_date'=> $this->confirmation_date,
            'registration_date'=> $this-> registration_date,
            'relieving_date'=> $this-> relieving_date,
            'office_mail'=> $this-> office_mail,
            'office_landline' =>$this->office_landline,
            'office_mobile' =>$this->office_mobile,
            //statutory details
            'pf_number' => $this->pf_number,
            'uan_number' => $this-> uan_number,
            'esic_number' => $this->esic_number,
            'pt_number' => $this->pt_number,
            'lwf_number' => $this->lwf_number,
            //qualification number
            'institution_name' => $this->institution_name,
            'degree' => $this->degree,
            'specialization' => $this->specialization,
            'from_year' => $this-> from_year,
            'to_year' => $this-> to_year,
            //previous employer
            'organization_name' => $this-> organization_name,
            'previous_designation' => $this -> previous_designation,
            'previous_department' => $this -> previous_department,
            'previous_from_year' => $this -> previous_from_year,
            'previous_to_year' => $this -> previous_to_year,
            //bank details
            'holder_name' => $this -> holder_name,
            'bank_name' => $this -> bank_name,
            'account_number' => $this -> account_number,
            'ifsc_code' => $this -> ifsc_code,
            'bank_address' => $this -> bank_address, 
            

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'institute'=>$this->institute  ,

            'user'=> $user,

           

        ];
    }
}