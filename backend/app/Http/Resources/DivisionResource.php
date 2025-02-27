<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DivisionResource extends JsonResource
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
            'institute_id' =>$this->institute_id,
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            'courses_id' => $this -> course_id,
            'course_name' => $this -> course->medium_title,
            'semester_id' => $this -> semester_id,
            'semester_name'=> $this -> semester->semester,
            'room_id' => $this -> room_id,
            'room_name' => isset($this->room) ? $this->room->room_name : null,
            'division' => $this -> division,
             
            
        ];
    }
}