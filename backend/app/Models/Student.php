<?php

namespace App\Models;

use App\Models\Subject;
use App\Models\Division;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Institute;

class Student extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'institute_id',
        'division_id',
        'student_name',
        'prn',
        'abcId',
        'id_card_issued',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'id_card_issued' => 'boolean',
    ];
    public function division()
    {
        return $this->belongsTo(Division::class);
    }
    
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    
    public function institute()
    {
        return $this->belongsTo(Institute::class);
    }

    /**
     * Scope a query to filter by division id.
     */
    public function scopeDivision($query, $divisionId)
    {
        if ($divisionId) {
            $query->where('division_id', $divisionId);
        }
        return $query;
    }

}