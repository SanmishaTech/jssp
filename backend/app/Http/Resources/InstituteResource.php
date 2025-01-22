<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
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
        return [
            "id" => $this->id,
            "institute_name" =>$this->institute_name,
            "contact_name" => $this->contact_name,
            "contact_mobile" => $this->contact_mobile,
            "street_address" => $this->street_address,
            "area" => $this->area,
            "city" => $this->city,
            "state" => $this->state,
            "pincode"=>$this->pincode,
            "country"=>$this->country,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}