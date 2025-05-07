<?php

namespace App\Models;

use App\Models\User;
use App\Models\Institute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function images(): HasMany
    {
        return $this->hasMany(StaffImage::class);
    }

    public function education(): HasMany
    {
        return $this->hasMany(StaffEducation::class);
    }
}