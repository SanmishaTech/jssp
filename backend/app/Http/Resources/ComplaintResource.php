<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComplaintResource extends JsonResource
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
            'institute_name' => $this->institute->institute_name,
            'complaint_date' => $this->complaint_date,
            'complainant_name' => $this -> complainant_name,
            'nature_of_complaint' => $this -> nature_of_complaint,
            'description' => $this -> description,
        ];
    }
}