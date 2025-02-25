<?php

namespace App\Models;

use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
   public function institute()
   {
    return $this->belongsTo(Institute::class, "institute_id");
   }

   public function course()
   {
    return $this->belongsTo(Course::class, "course_id");
   }
}