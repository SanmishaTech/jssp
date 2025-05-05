<?php

namespace App\Models;

use App\Models\SubSubject;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['institute_id', 'subject_name'];
    
    public function subSubjects()
    {
        return $this->hasMany(SubSubject::class);
    }
}
