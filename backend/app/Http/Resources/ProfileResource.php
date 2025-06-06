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
            'is_teaching' => $this->is_teaching,
            'name' => $this->name,
             'mobile'=> $this->mobile,
            'alternate_mobile' => $this->alternate_mobile,
            'date_of_birth' => $this->date_of_birth,
            'address' =>$this->address,
             'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'institute'=>$this->institute,
            'user'=> $user,
        ];
    }
}