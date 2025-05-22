<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubjectHours extends Model
{
    protected $fillable = [
        'staff_id',
        'academic_year_id',
        'course_id',
        'semester_id',
        'subject_id',
        'sub_subject_id',
        'hours'
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYears::class, 'academic_year_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function subSubject()
    {
        return $this->belongsTo(SubSubject::class, 'sub_subject_id');
    }
}
