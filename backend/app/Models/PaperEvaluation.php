<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaperEvaluation extends Model
{
    protected $fillable = [
        'exam_calendar_id',
        'subject_id',
        'staff_id',
        'due_date',
        'total_papers',
        'completed_papers',
        'status',
    ];

    /**
     * Get the exam calendar that owns the paper evaluation.
     */
    public function examCalendar(): BelongsTo
    {
        return $this->belongsTo(ExamCalendar::class);
    }

    /**
     * Get the subject that owns the paper evaluation.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Get the staff that owns the paper evaluation.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class);
    }
}
