<?php

namespace App\Models;

use App\Models\Staff;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;

class Commitees extends Model
{
    public function institute(){
        return $this->belongsTo(Institute::class);
    }

    public function staff(){
        return $this->hasMany(Staff::class);
    }
}