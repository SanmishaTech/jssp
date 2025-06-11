<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffEducationResource extends JsonResource
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
            'staff_id' => $this->staff_id,
            'qualification' => $this->qualification,
            'college_name' => $this->college_name,
            'board_university' => $this->board_university,
            'passing_year' => $this->passing_year,
            'percentage' => $this->percentage,
            'certificate_path' => $this->certificate_path,
            'certificate_url' => $this->certificate_path ? asset('storage/staff_education_certificates/'.$this->certificate_path) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
