<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SemesterResource extends JsonResource
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
            'course_id' => $this->course_id,
            'course_name' => $this->course ? $this->course->faculty_title : null,
            'standard' => $this->standard,
            'semester'=> $this->semester,
            'course' => $this->course,
        ];
    }
}