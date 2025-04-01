<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use App\Http\Resources\AdmissionResource;
use Illuminate\Http\Resources\Json\JsonResource;

class AdmissionResource extends JsonResource
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
            'total_valuation' => $this->total_valuation,
            'university_upload' => $this->university_upload,
            'received_prn' => $this->received_prn,
        ];    }
}