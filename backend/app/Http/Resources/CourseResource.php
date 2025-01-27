<?php

namespace App\Http\Resources;

use App\Models\Institute;
use Illuminate\Http\Request;
use App\Http\Resources\InstituteResource;
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

        $institutes = new InstituteResource(Institute::find($this->institute_id));

        return [
            "id" => $this -> id,
            "medium_code" => $this -> medium_code,
            "medium_title" => $this -> medium_title,
            "organization" => $this -> organization,
            "institute_id" => $this -> institute_id,
            "institute" => $this -> institute,
            

        ];
    }
}