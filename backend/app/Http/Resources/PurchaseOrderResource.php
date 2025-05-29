<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
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
            'vendor_id' => $this->vendor_id,
            'vendor_name' => $this->vendor ? $this->vendor->vendor_name : null,
            'asset_master_id' => $this->asset_master_id,
            'asset_master_name' => $this->assetMaster ? $this->assetMaster->asset_type : null,
            'asset_category_ids' => $this->asset_category_ids,
            'quantity' => $this->quantity,
            'price' => $this->price,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
