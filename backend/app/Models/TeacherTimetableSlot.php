<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TeacherTimetableSlot extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'teacher_timetable_id',
        'day',
        'time_slot',
        'slot_id',
        'is_break',
        'subject_id',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_break' => 'boolean',
    ];

    /**
     * Get the timetable that owns the slot.
     */
    public function timetable(): BelongsTo
    {
        return $this->belongsTo(TeacherTimetable::class, 'teacher_timetable_id');
    }

    /**
     * Get the subject associated with the slot.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }
}
