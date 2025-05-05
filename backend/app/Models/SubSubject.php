<?php

namespace App\Models;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Model;

class SubSubject extends Model
{
    protected $fillable = ['subject_id', 'sub_subject_name'];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
