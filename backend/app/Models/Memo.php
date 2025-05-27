<?php

namespace App\Models;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Model;

class Memo extends Model
{
    protected $fillable = [
        'institute_id', 
        'staff_id',
        'memo_subject',
        'memo_description',
    ];

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'staff_id');
    }
}
