<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
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
            'semester_id' => $this->semester_id,
            'subject_code' => $this->subject_code,
            'subject_name' => $this->subject_name,
            'medium_code' => $this->course,
            'semester' => $this->semester,
            'sub_subject' => $this->subSubjects->map(function ($subSubject) {
                return [
                    'id' => $subSubject->id,
                    'sub_subject_name' => $subSubject->sub_subject_name,
                ];
            })->toArray(),
             
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}