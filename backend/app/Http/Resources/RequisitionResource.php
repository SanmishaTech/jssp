<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string)$this->id,
            'institute_id' => $this->institute_id,
            'asset_master_id' => (string)$this->asset_master_id,
            'asset_name' => $this->assetMaster->asset_type ?? null,
            'description' => $this->description,
            'status' => $this->status ?? 'pending',
            'requested_by' => (string)($this->requested_by ?? ''),
            'requester_name' => $this->requester->name ?? null,
            'created_at' => $this->created_at,
            'approved_by' => $this->approved_by ? (string)$this->approved_by : null,
            'approver_name' => $this->approver->name ?? null,
            'approval_date' => $this->approval_date,
            'comments' => $this->comments,
            'updated_at' => $this->updated_at,
        ];
    }
}
