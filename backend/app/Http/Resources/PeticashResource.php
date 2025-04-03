<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeticashResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'total_amount' => $this->total_amount,
            'note'           => $this->note,
            'note_amount'    => $this->note_amount,
            'total_spend'      => $this->total_spend,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];    }
}