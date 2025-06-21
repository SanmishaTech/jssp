<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentSummary extends Model
{
    use HasFactory;

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    protected $fillable = [
        'student_id',
        'challan_paid',
        'exam_form_filled',
        'college_fees_paid',
        'exam_fees_paid',
        'hallticket',
    ];
}