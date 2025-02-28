<?php

namespace App\Models;

use App\Models\Staff;
use App\Models\Commitees;
use App\Models\CommiteeStaff;
use Illuminate\Database\Eloquent\Model;

class CommiteeStaff extends Model
{
    protected $fillable = [
        'staff_id', 'institute_id', 'designation'  
    ];

    public function committee()
    {
        return $this->belongsTo(Commitees::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}