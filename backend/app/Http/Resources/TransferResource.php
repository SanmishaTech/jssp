<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'inventory_id'      => $this->inventory_id,
            'from_room_id'      => $this->from_room_id,
            'from_institute_id' => $this->from_institute_id,
            'to_room_id'        => $this->to_room_id,
            'to_institute_id'   => $this->to_institute_id,
            'quantity'          => $this->quantity,
            'status'            => $this->status,
            'requested_by'      => $this->requested_by,
            'approved_by'       => $this->approved_by,
            'approved_at'       => $this->approved_at,
            'created_at'        => $this->created_at,
        ];
    }
}
