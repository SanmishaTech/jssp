<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Institute;
use App\Models\Staff;
use App\Models\NoticeRead;

class Notice extends Model
{
    protected $fillable = [
        'institute_id',
        'sender_staff_id',
        'sender_role',
        'recipient_staff_id',
        'recipient_role',
        'recipient_institute_id',
        'message',
        'read_at',
    ];

    protected $dates = ['read_at'];

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'sender_staff_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'recipient_staff_id');
    }

    /**
     * Staff who have read this notice.
     */
    public function reads(): HasMany
    {
        return $this->hasMany(NoticeRead::class);
    }
}
