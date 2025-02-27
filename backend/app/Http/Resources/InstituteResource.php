<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class InstituteResource extends JsonResource
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
            "id" => $this->id,
            
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            "registration_number" => $this->registration_number,
            "affiliated_university" => $this->affiliated_university,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user'=> $user,
        ];
    }
}