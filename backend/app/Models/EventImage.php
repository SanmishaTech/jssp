<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventImage extends Model
{
    protected $fillable = [
        'event_id',
        'image_path'
    ];

    /**
     * Get the event that owns the image.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
