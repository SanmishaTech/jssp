<?php

namespace App\Models;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Model;

class StaffEducation extends Model
{
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
}
