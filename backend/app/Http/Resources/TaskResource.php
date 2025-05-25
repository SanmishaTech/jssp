<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => $this->due_date,
            'priority' => $this->priority,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'assigned_to' => $this->assigned_to,
            'assigned_to_name' => $this->assignedTo && $this->assignedTo->user ? $this->assignedTo->user->name : null,
            'created_by' => $this->created_by,
            'creator_name' => $this->creator && $this->creator->user ? $this->creator->user->name : null,
            'assignee' => $this->whenLoaded('assignedTo', function() {
                return [
                    'id' => $this->assignedTo->id,
                    'name' => $this->assignedTo->user ? $this->assignedTo->user->name : null,
                ];
            }),
            'creator' => $this->whenLoaded('creator', function() {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->user ? $this->creator->user->name : null,
                ];
            }),
        ];
    }
}
