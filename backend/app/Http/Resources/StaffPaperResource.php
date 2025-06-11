<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffPaperResource extends JsonResource
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
            'staff_id' => $this->staff_id,
            'journal_title' => $this->journal_title,
            'research_topic' => $this->research_topic,
            'publication_identifier' => $this->publication_identifier,
            'volume' => $this->volume,
            'issue' => $this->issue,
            'year_of_publication' => $this->year_of_publication,
            'peer_reviewed' => $this->peer_reviewed,
            'coauthor' => $this->coauthor,
            'certificate_path' => $this->certificate_path,
            'certificate_url' => $this->certificate_path ? asset('storage/staff_papers/' . $this->certificate_path) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
