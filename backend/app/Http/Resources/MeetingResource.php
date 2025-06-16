<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\StaffResource;

class MeetingResource extends JsonResource
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
            'staff' => $this->whenLoaded('staff', function () {
                return $this->staff->map(function ($staff) {
                    return [
                        'id' => $staff->id,
                        'name' => $staff->staff_name,
                        'role' => $staff->user ? $staff->user->getRoleNames()->first() : null,
                    ];
                });
            }),
        ];
    }
}