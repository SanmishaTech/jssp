<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
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
             'faculty_code' => $this->faculty_code,
            'faculty_title' => $this->faculty_title,
            'organization' => $this->organization,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        
         ];
    }
}