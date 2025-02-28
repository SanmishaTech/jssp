<?php

namespace App\Models;

use App\Models\Staff;
use App\Models\Commitees;
use App\Models\Institute;
use App\Models\CommiteeStaff;
use Illuminate\Database\Eloquent\Model;

class Commitees extends Model
{

    protected $table = 'commitees';  

    
    public function institute(){
        return $this->belongsTo(Institute::class);
    }

    public function commiteeStaff(){
        return $this->hasMany(CommiteeStaff::class);
    }
    
}