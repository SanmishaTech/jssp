<?php

namespace App\Models;

use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    public function institute()
    {
        return $this->belongsTo(Institute::class, "institute_id");
    }
}