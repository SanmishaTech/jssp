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
            "quantity" => $this->quantity,
            "room_id" => $this->room_id,
            'room_name' => $this->room ? $this->room->room_name : null,
            "purchase_date" => $this->purchase_date,
            "purchase_price" => $this->purchase_price,
            "status" => $this->status,
            "scraped_amount" => $this->scraped_amount,
             "remarks" => $this->remarks,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
         ];
    }
}