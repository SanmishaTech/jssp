<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\StaffResource;

class NoticeResource extends JsonResource
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
            'sender_staff_id' => $this->sender_staff_id,
            'sender_role' => $this->sender_role,
            'recipient_staff_id' => $this->recipient_staff_id,
            'recipient_role' => $this->recipient_role,
            'recipient_institute_id' => $this->recipient_institute_id,
            'message' => $this->message,
            'read_at' => $this->read_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'sender' => new StaffResource($this->whenLoaded('sender')),
            'recipient' => new StaffResource($this->whenLoaded('recipient')),
            'seen_by' => $this->reads->map(fn($r) => $r->staff->staff_name ?? $r->staff->user->name ?? null),
        ];
    }
}
