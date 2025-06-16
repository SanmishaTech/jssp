<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    /**
     * The staff members associated with the meeting.
     */
    public function staff()
    {
        return $this->belongsToMany(Staff::class, 'meeting_staff');
    }

    //
}
