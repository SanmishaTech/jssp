<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WeeklyHolidayResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
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
        
        // Create a mapping of day values to their names
        $holidayDaysWithNames = [];
        foreach ($this->holiday_days as $dayValue) {
            $holidayDaysWithNames[$dayValue] = $dayNames[$dayValue] ?? 'Unknown';
        }
        
        return [
            'id' => $this->id,
            'institute_id' => $this->institute_id,
            'holiday_days' => $this->holiday_days,
            'holiday_days_names' => $holidayDaysWithNames,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
