<?php

namespace App\Models;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    
    public function profiles(){
        return $this->hasMany(Profile::class, "department_id");
    }
    
}