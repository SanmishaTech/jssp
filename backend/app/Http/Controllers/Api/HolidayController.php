<?php

namespace App\Http\Controllers\Api;

use App\Models\Holiday;
use App\Models\WeeklyHoliday;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\HolidayResource;
use App\Http\Resources\WeeklyHolidayResource;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Carbon;

class HolidayController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Holiday::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('title', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $holiday = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Holiday" => HolidayResource::collection($holiday),
                'Pagination' => [
                    'current_page' => $holiday->currentPage(),
                    'last_page'    => $holiday->lastPage(),
                    'per_page'     => $holiday->perPage(),
                    'total'        => $holiday->total(),
                ]
            ],
            "Holiday retrieved successfully"
        );
    }
    
    /**
     * Get weekly holidays for the logged-in user's institute.
     */
    public function weeklyHolidays(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
        
        // Get or create weekly holiday settings for the institute
        $weeklyHoliday = WeeklyHoliday::firstOrCreate(
            ['institute_id' => $instituteId],
            ['holiday_days' => [], 'description' => 'Weekly Holiday']
        );
        
        return $this->sendResponse(
            ["WeeklyHoliday" => new WeeklyHolidayResource($weeklyHoliday)],
            "Weekly holidays retrieved successfully"
        );
    }
    
    /**
     * Update weekly holidays for the institute.
     */
    public function updateWeeklyHolidays(Request $request): JsonResponse
    {
        // Validate request
        $request->validate([
            'holiday_days' => 'required|array',
            'holiday_days.*' => 'required|integer|between:0,6',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);
        
        $instituteId = Auth::user()->staff->institute_id;
        $holidayDays = $request->input('holiday_days');
        $description = $request->input('description', 'Weekly Holiday');
        $isActive = $request->input('is_active', true);
        
        // Get or create weekly holiday settings for the institute
        $weeklyHoliday = WeeklyHoliday::firstOrCreate(
            ['institute_id' => $instituteId],
            ['holiday_days' => [], 'description' => 'Weekly Holiday']
        );
        
        // Update the settings
        $weeklyHoliday->holiday_days = $holidayDays;
        $weeklyHoliday->description = $description;
        $weeklyHoliday->is_active = $isActive;
        $weeklyHoliday->save();
        
        return $this->sendResponse(
            ["WeeklyHoliday" => new WeeklyHolidayResource($weeklyHoliday)],
            "Weekly holidays updated successfully"
        );
    }
    
    /**
     * Toggle weekly holiday status (active/inactive).
     */
    public function toggleWeeklyHoliday(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;
        
        // Get or create weekly holiday settings for the institute
        $weeklyHoliday = WeeklyHoliday::firstOrCreate(
            ['institute_id' => $instituteId],
            ['holiday_days' => [], 'description' => 'Weekly Holiday']
        );
        
        // Toggle the active status
        $weeklyHoliday->is_active = !$weeklyHoliday->is_active;
        $weeklyHoliday->save();
        
        $status = $weeklyHoliday->is_active ? 'enabled' : 'disabled';
        
        return $this->sendResponse(
            ["WeeklyHoliday" => new WeeklyHolidayResource($weeklyHoliday)],
            "Weekly holidays {$status} successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $holiday = new Holiday();
        $holiday->institute_id = Auth::user()->staff->institute_id;  
        $holiday->title = $request->input('title');
        $holiday->description = $request->input('description');
        $holiday->from_date = $request->input('from_date');
        $holiday->to_date = $request->input('to_date');
        $holiday->save();
        
        return $this->sendResponse([ "Holiday" => new HolidayResource($holiday)], "Holiday stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $holiday = Holiday::find($id);

        if(!$holiday){
            return $this->sendError("Holiday not found", ['error'=>'Holiday not found']);
        }

  
        return $this->sendResponse([ "Holiday" => new HolidayResource($holiday) ], "Holiday retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $holiday = Holiday::find($id);

        if(!$holiday){
            return $this->sendError("Holiday not found", ['error'=>'Holiday not found']);
        }
       
                       
        $holiday->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $holiday->title = $request->input('title');
        $holiday->description = $request->input('description');
        $holiday->from_date = $request->input('from_date');
        $holiday->to_date = $request->input('to_date');
           $holiday->save();
       
        return $this->sendResponse([ "Holiday" => new HolidayResource($holiday)], "Holiday updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $holiday = Holiday::find($id);
        if(!$holiday){
            return $this->sendError("Holiday not found", ['error'=> 'Holiday not found']);
        }
         $holiday->delete();
         return $this->sendResponse([], "Holiday deleted successfully");
    }

    public function allHoliday(): JsonResponse
    {
        $holiday = Holiday::all();

        return $this->sendResponse(["Holiday"=>HolidayResource::collection($holiday),
        ], "Holiday retrived successfully");
    }
    
    /**
     * Get all holidays (both regular and weekly) for the calendar view.
     */
    public function calendarHolidays(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;
        
        // Get regular holidays
        $regularHolidays = Holiday::where('institute_id', $instituteId)->get();
        
        // Get or create weekly holiday settings
        $weeklyHoliday = WeeklyHoliday::firstOrCreate(
            ['institute_id' => $instituteId],
            ['holiday_days' => [], 'description' => 'Weekly Holiday']
        );
        
        // Get date range from request (optional)
        $startDate = $request->input('start_date') ? Carbon::parse($request->input('start_date')) : Carbon::now()->startOfMonth();
        $endDate = $request->input('end_date') ? Carbon::parse($request->input('end_date')) : Carbon::now()->endOfMonth();
        
        // Generate dates for weekly holidays within the date range
        $weeklyHolidayDates = [];
        $currentDate = $startDate->copy();
        
        // Only process if weekly holidays are active
        if ($weeklyHoliday->is_active) {
            $dayNames = [
                0 => 'Sunday',
                1 => 'Monday',
                2 => 'Tuesday',
                3 => 'Wednesday',
                4 => 'Thursday',
                5 => 'Friday',
                6 => 'Saturday',
            ];
            
            while ($currentDate->lte($endDate)) {
                $dayOfWeek = $currentDate->dayOfWeek;
                
                // Check if this day of week is in the holiday_days array
                if (in_array($dayOfWeek, $weeklyHoliday->holiday_days)) {
                    $weeklyHolidayDates[] = [
                        'date' => $currentDate->format('Y-m-d'),
                        'title' => $dayNames[$dayOfWeek] . ' Holiday',
                        'description' => $weeklyHoliday->description,
                        'type' => 'weekly'
                    ];
                }
                
                $currentDate->addDay();
            }
        }
        
        // Format regular holidays
        $formattedRegularHolidays = $regularHolidays->map(function ($holiday) {
            $fromDate = Carbon::parse($holiday->from_date);
            $toDate = Carbon::parse($holiday->to_date);
            
            return [
                'from_date' => $fromDate->format('Y-m-d'),
                'to_date' => $toDate->format('Y-m-d'),
                'title' => $holiday->title,
                'description' => $holiday->description,
                'type' => 'regular'
            ];
        });
        
        return $this->sendResponse([
            'regular_holidays' => $formattedRegularHolidays,
            'weekly_holidays' => $weeklyHolidayDates
        ], 'All holidays retrieved successfully');
    }

}
