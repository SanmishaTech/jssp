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
        'staff_id',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'exam_time' => 'datetime:H:i:s',
        'staff_id' => 'array',
    ];

    protected $appends = ['exam_id_name'];

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

    public function getExamIdNameAttribute()
    {
        return $this->exam?->exam_title;
    }


}
