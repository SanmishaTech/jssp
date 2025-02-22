<?php

namespace App\Models;

use App\Models\User;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    public function institute()
    {
        return $this->belongsTo(Institute::class, "institute_id");
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}