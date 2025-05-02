<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BankTransactionResource extends JsonResource
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
            'bank_id' => $this->bank_id,
            'bank_account_id' => $this->bank_account_id,
            'bank_account_name' => optional($this->bankAccount)->bank_name,
            'amount' => $this->amount,
            'description' => $this->description,
            'type' => $this->type,
            'balance_after' => $this->balance_after,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'payment_method' => $this->payment_method,
            'payer_name' => $this->payer_name,
            'reference_number' => $this->reference_number,
            'creator' => $this->whenLoaded('creator', function() {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name
                ];
            }),
        ];
    }
}
