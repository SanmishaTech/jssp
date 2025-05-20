<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = new UserResource(User::find($this->user_id));

        $user = User::find($this->user_id);
        $role = $user ? $user->getRoleNames()->first() : null;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $user ? $user->name : null,  // Added name from user table
            'institute_id' => $this->institute_id,
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            'role'         => $role,
            'staff_name' =>$this->staff_name,
            'academic_years_id' => $this->academic_years_id,
            'employee_code' => $this->employee_code,
             'date_of_birth' => $this->date_of_birth,
            'address' =>$this->address,
            'gender' => $this->gender,
            'experience' => $this->experience,
            'highest_qualification' => $this->highest_qualification,
            'pan_number' => $this->pan_number,
            'aadhaar_number' => $this->aadhaar_number,
            'appointment_date' => $this->appointment_date,
            'nature_of_appointment' => $this->nature_of_appointment,
            'subject_type' => $this->subject_type,
            'mode_of_payment' => $this->mode_of_payment,
            'bank_name' => $this->bank_name,
            'account_holder_name' => $this->account_holder_name,
            'account_number' => $this->account_number,
            'ifsc_code' => $this->ifsc_code,
            'salary' => $this->salary,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'course_id' => $this->course_id ? json_decode($this->course_id, true) : [],
            'semester_id' => $this->semester_id ? json_decode($this->semester_id, true) : [],
            'subject_id' => $this->subject_id ? json_decode($this->subject_id, true) : [],
            'password' => $this->password,
            'images' => $this->images->map(function($image) {
                return [
                    'id' => $image->id,
                    'url' => asset('storage/' . $image->image_path)
                ];
            }),
            'education' => $this->education->map(function($education) {
                return [
                    'id' => $education->id,
                    'qualification' => $education->qualification,
                    'college_name' => $education->college_name,
                    'board_university' => $education->board_university,
                    'passing_year' => $education->passing_year,
                    'percentage' => $education->percentage,
                ];
            }),
            'papers' => $this->papers->map(function($paper) {
                return [
                    'id' => $paper->id,
                    'paper_title' => $paper->paper_title,
                    'paper_path' => $paper->paper_path,
                    'url' => asset('storage/staff_papers/' . $paper->paper_path)
                ];
            }),
            'medical_history' => $this->medical_history,
            'medical_image_path' => $this->medical_image_path,
            'medical_image_url' => $this->medical_image_path ? asset('storage/staff_medical_images/' . $this->medical_image_path) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // 'user'=> $user,
           


         ];
    }
}