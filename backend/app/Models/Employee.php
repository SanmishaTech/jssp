<?php

namespace App\Models;

use App\Models\Lead;
use App\Models\Department;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    
    protected $casts = [
        'resignation_date' => 'date:Y-m-d',
        "joining_date" => "date:Y-m-d",
    ];

    public function leads(){
        return $this->hasMany(Lead::class, 'employee_id');
    }

    public function department(){
        return $this->belongsTo(Department::class, 'department_id');
    }

    
    
}