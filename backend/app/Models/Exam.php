<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'exam_title',
        'from_date',
        'to_date',
        'description',
    ];

    protected $casts = [
        'from_date' => 'date',
        'to_date' => 'date',
    ];

    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }
}
