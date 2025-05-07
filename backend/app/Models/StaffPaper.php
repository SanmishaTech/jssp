<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffPaper extends Model
{
    protected $fillable = ['staff_id', 'paper_path', 'paper_title'];
    
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
} 