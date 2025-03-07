<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $fillable = [
        'institute_id',
        'venue',
        'date',
        'time',
        'synopsis'
    ];

    /**
     * Get the images for the event.
     */
    public function images(): HasMany
    {
        return $this->hasMany(EventImage::class);
    }
}
