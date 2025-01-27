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
            "id" =>$this-> id,
            "institute_id"=>$this->institute_id,
            "course_id"=>$this->course_id,
            "semester_id"=>$this->semester_id,
            "room_id"=> $this->room_id,
            "division_name" => $this->division_name,
            // "room" => $this->room,
            


        ];
    }
}