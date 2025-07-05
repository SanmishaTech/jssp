<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Letter extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'letter_number',
        'letter_title',
        'type',
        'letter_description',
        'letter_path',
    ];
}
