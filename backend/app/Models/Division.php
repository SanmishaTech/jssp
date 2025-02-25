<?php

namespace App\Models;

use App\Models\Room;
use App\Models\Course;
use App\Models\Semester;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    public function institute()
    {
        return $this->belongsTo(Institute::class, "institute_id");
    }

    public function course()
    {
        return $this->belongsTo(Course::class, "course_id");
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, "semester_id");
    }

    public function room()
    {
        return $this->belongsTo(Room::class, "room_id");
    }
   
}