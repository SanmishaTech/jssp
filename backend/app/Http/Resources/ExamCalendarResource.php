<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExamCalendarResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'institute_id'     => $this->institute_id,
            'exam_id'          => $this->exam_id,
            'exam_name'        => $this->exam_name,
            'exam_code'        => $this->exam_code,
            'date'             => $this->date?->toDateString(),
            'exam_time'        => $this->exam_time?->format('H:i:s'),
            'duration_minutes' => $this->duration_minutes,
            'course_id'        => $this->course_id,
            'subject_id'       => $this->subject_id,
            'subject_name'     => $this->subject?->subject_name,
            'description'      => $this->description,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
            'staff_id'         => $this->staff_id,
        ];
    }
}
