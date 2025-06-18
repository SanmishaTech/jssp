<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Commitees;

class CommitteeMeeting extends Model
{
    protected $table = 'committee_meetings';

    protected $fillable = [
        'institute_id',
        'committee_id',
        'venue',
        'date',
        'time',
        'synopsis',
    ];

    /**
     * Get the committee this meeting belongs to.
     */
    public function committee(): BelongsTo
    {
        return $this->belongsTo(Commitees::class, 'committee_id');
    }

    /**
     * Institute relation.
     */
    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }
}
