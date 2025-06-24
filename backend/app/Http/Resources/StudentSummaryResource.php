<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentSummaryResource extends JsonResource
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
            'student_id' => $this->student_id,
            'student_name' => optional($this->whenLoaded('student', $this->student))->student_name,
            'prn' => optional($this->whenLoaded('student', $this->student))->prn,
            'challan_paid' => (bool) $this->challan_paid,
            'exam_form_filled' => (bool) $this->exam_form_filled,
            'college_fees_paid' => (bool) $this->college_fees_paid,
            'exam_fees_paid' => (bool) $this->exam_fees_paid,
            'hallticket' => (bool) $this->hallticket,
        ];
    }
}
