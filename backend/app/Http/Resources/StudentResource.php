<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
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
            'student_name' => $this -> student_name,
            'prn' => $this -> prn,
            'abcId' => $this -> abcId,
            'subject_id' => $this -> subject_id,
            'subject_name' => $this-> subject ? $this->subject->subject_name : null,
            'division_id' => $this -> division_id,
            'division_name' => $this-> division ? $this->division->division : null,

        ];
    }
}