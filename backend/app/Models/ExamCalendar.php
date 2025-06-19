<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamCalendar extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'exam_id',
        'exam_name',
        'exam_code',
        'date',
        'exam_time',
        'duration_minutes',
        'course_id',
        'subject_id',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'exam_time' => 'datetime:H:i:s',
    ];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Supervisors (staff) assigned to this exam calendar entry.
     */
    public function supervisors()
    {
        return $this->belongsToMany(Staff::class, 'exam_calendar_staff');
    }
}
