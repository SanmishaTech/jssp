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
            
            'subject_name' => $this->subject_name,
             
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}