<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SyllabusResource extends JsonResource
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
            'subject_id' => $this->subject_id,
            'subject_name' => $this->subject->subject_name ?? null,
            'course_id' => $this->course_id,
            'semester_id' => $this->semester_id,
            'academic_year_id' => $this->academic_year_id,
            'completed_percentage' => $this->completed_percentage,
            'remarks' => $this->remarks,
            'updated_at' => $this->updated_at,
        ];
    }
}
