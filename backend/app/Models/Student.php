<?php

namespace App\Models;

use App\Models\Subject;
use App\Models\Division;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Institute;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Student extends Model
{
    use HasFactory, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'institute_id',
        'division_id',
        'student_name',
        'prn',
        'abcId',
        'id_card_issued',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id_card_issued' => 'boolean',
    ];
    public function division()
    {
        return $this->belongsTo(Division::class);
    }
    
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    
    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    /**
     * Scope a query to filter by division id.
     */
    public function scopeDivision($query, $divisionId)
    {
        if ($divisionId) {
            $query->where('division_id', $divisionId);
        }
        return $query;
    }

    /**
     * Get the activity log options for this model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_name', 'prn', 'abcId', 'division_id', 'institute_id', 'id_card_issued'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Student {$eventName}");
    }
}
