<?php

namespace App\Models;

use App\Models\SubSubject;
use App\Models\Course;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['institute_id', 'subject_name'];
    
    public function subSubjects()
    {
        return $this->hasMany(SubSubject::class);
    }
    public function course()
    {
        return $this->belongsTo(Course::class);
    }
    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
}
