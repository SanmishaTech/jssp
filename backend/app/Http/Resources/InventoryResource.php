<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryResource extends JsonResource
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
            "institute_id" =>$this->institute_id,
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            "asset" => $this->asset,
            "purchase_date" => $this->purchase_date,
            "remarks" => $this->remarks,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
         ];
       
    }
}