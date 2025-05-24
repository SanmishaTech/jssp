<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherTimetableSlotResource extends JsonResource
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
            'teacher_timetable_id' => $this->teacher_timetable_id,
            'day' => $this->day,
            'time_slot' => $this->time_slot,
            'slot_id' => $this->slot_id,
            'is_break' => $this->is_break,
            'subject_id' => $this->subject_id,
            'subject' => $this->whenLoaded('subject', function () {
                return [
                    'id' => $this->subject->id,
                    'name' => $this->subject->subject_name ?? 'Unknown',
                ];
            }),
            'division_id' => $this->division_id,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
