<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommitteeMeetingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'institute_id'  => $this->institute_id,
            'committee_id'  => $this->committee_id,
            'committee_name'=> $this->committee?->commitee_name,
            'venue'         => $this->venue,
            'date'          => $this->date,
            'time'          => $this->time,
            'synopsis'      => $this->synopsis,
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}
