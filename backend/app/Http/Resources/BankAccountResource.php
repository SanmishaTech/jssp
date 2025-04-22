<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BankAccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
             'institute_id' => $this->institute_id,
             'name' => $this->name,
             'bank_name' => $this->bank_name,
             'account_number' => $this->account_number,
             'ifsc_code' => $this->ifsc_code,
             'branch' => $this->branch,
             'address' => $this->address,
             'email' => $this->email,
             'phone' => $this->phone,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        
         ];    }
}