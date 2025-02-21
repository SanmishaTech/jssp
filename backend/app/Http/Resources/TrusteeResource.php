<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class TrusteeResource extends JsonResource
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
            
            "trustee_name" =>$this->trustee_name,
            "designation" =>$this->designation,
             "contact_mobile" => $this->contact_mobile,
            "address" => $this->address,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user'=> $user,
        ];
    }
}