<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $casts = [
        'resignation_date' => 'date:Y-m-d',
        "joining_date" => "date:Y-m-d",
    ];

    // public function leads(){
    //     return $this->hasMany(Lead::class, 'employee_id');
    // }

    // public function department(){
    //     return $this->belongsTo(Department::class, 'department_id');
    // }
}