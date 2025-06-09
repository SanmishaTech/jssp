<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NoticeRead extends Model
{
    protected $fillable = [
        'notice_id',
        'staff_id',
        'read_at',
    ];

    protected $dates = ['read_at'];

    public function notice(): BelongsTo
    {
        return $this->belongsTo(Notice::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
}
