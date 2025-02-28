<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommitteeResource extends JsonResource
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
            'commitee_name' => $this->commitee_name,
            'institute_id'  => $this->institute_id,
            'institute_name' => $this->institute ? $this->institute->institute_name : null,
            'staff'         => $this->commiteeStaff->map(function ($staff) {
                return [
                    'staff_id'    => $staff->staff_id,
                    'designation' => $staff->designation,
                ];
            })->toArray(),
        ];
    }
}