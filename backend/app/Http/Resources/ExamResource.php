<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExamResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'institute_id' => $this->institute_id,
            'exam_title'   => $this->exam_title,
            'from_date'    => $this->from_date->toDateString(),
            'to_date'      => $this->to_date->toDateString(),
            'description'  => $this->description,
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}
