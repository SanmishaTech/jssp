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
            'institute_id' => $this->institute_id,
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            'role'         => $role,
            'staff_name' =>$this->staff_name,
            'is_teaching' => $this->is_teaching,
            'date_of_birth' => $this->date_of_birth,
            'address' =>$this->address,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'password' => $this->password,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // 'user'=> $user,
           


         ];
    }
}