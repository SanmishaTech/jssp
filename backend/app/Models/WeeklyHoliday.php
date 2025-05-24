<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WeeklyHoliday extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'institute_id',
        'holiday_days',
        'description',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'holiday_days' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the institute that owns the weekly holiday.
     */
    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }
    
    /**
     * Get day names for the holiday days.
     *
     * @return array
     */
    public function getDayNames(): array
    {
        $dayNames = [
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
        ];
        
        $result = [];
        foreach ($this->holiday_days as $day) {
            if (isset($dayNames[$day])) {
                $result[$day] = $dayNames[$day];
            }
        }
        
        return $result;
    }
}
