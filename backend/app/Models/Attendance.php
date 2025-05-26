<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'institute_id',
        'student_id',
        'division_id',
        'attendance_date',
        'is_present',
        'remarks',
        'time_slot',
        'subject_id',
        'slot_id'
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'is_present' => 'boolean'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}
