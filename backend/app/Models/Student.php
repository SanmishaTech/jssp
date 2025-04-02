<?php

namespace App\Models;

use App\Models\Subject;
use App\Models\Division;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
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

}