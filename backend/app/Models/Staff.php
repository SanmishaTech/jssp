<?php

namespace App\Models;

use App\Models\User;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Staff extends Model
{
    use LogsActivity;
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'course_id' => 'array',
        'semester_id' => 'array',
        'subject_id' => 'array',
    ];
    
    public function institute()
    {
        return $this->belongsTo(Institute::class, "institute_id");
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(StaffImage::class);
    }

    public function education(): HasMany
    {
        return $this->hasMany(StaffEducation::class);
    }

    public function papers(): HasMany
    {
        return $this->hasMany(StaffPaper::class);
    }

    public function educationCertificates(): HasMany
    {
        return $this->hasMany(StaffEducationCertificate::class);
    }

    /**
     * Meetings associated with the staff member.
     */
    public function meetings(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Meeting::class, 'meeting_staff');
    }

    /**
     * Get the activity log options for this model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logExcept(['updated_at'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Staff {$eventName}");
    }
}
