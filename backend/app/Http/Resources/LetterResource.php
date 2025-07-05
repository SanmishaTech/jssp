<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LetterResource extends JsonResource
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
            'letter_number' => $this->letter_number,
            'letter_title' => $this->letter_title,
            'type' => $this->type,
            'letter_description' => $this->letter_description,
            'letter_path' => $this->letter_path,
            'letter_url' => $this->letter_path ? asset('storage/letter_attachments/' . $this->letter_path) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
