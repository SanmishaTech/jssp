<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return 
        [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'venue' => $this->venue,
            'date' => $this->date,
            'time' => $this->time,
            'synopsis' => $this->synopsis,
            'images' => $this->images->map(function($image) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path
                ];
            })
        ];
    }
}