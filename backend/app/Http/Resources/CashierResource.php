<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CashierResource extends JsonResource
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
            'total_fees' => $this->total_fees,
            'cheque' => $this->cheque,
            'cash' => $this->cash,
            'upi' => $this->upi,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

        ];   
        }
}