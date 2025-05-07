<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffEducation extends Model
{
    use HasFactory;

    protected $fillable = [
        'staff_id',
        'qualification',
        'college_name',
        'board_university',
        'passing_year',
        'percentage'
    ];

    /**
     * Get the staff that owns the education record
     */
    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }
} 