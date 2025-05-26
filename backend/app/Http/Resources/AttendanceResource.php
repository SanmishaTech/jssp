<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
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
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            'student_id' => $this->student_id,
            'student_name' => $this->student ? $this->student->student_name : null,
            'student_prn' => $this->student ? $this->student->prn : null,
            'division_id' => $this->division_id,
            'division_name' => $this->division ? $this->division->division : null,
            'attendance_date' => $this->attendance_date,
            'time_slot' => $this->time_slot,
            'subject_id' => $this->subject_id,
            'subject_name' => $this->subject ? $this->subject->subject_name : null,
            'slot_id' => $this->slot_id,
            'is_present' => $this->is_present,
            'remarks' => $this->remarks,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
