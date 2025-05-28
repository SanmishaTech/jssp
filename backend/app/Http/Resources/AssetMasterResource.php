<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetMasterResource extends JsonResource
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
            'asset_category_ids' => $this->asset_category_ids ?? [],
            'asset_type' => $this->asset_type,
            'service_required' => $this->service_required,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
