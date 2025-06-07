<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Leave;
use App\Models\Staff;
use App\Models\Meeting;
use App\Models\Event;
use App\Models\Task;
use App\Models\Complaint;
use App\Models\Memo; // Assuming Memo model exists
use Carbon\Carbon;    // For date calculations

class DashboardController extends Controller
{
    /**
     * Fetch consolidated data for the dashboard.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            // Assuming model names and relationships. Adjust if necessary.
            // Fetch pending leave applications, try to include staff name
            $pendingLeaves = Leave::where('status', 'pending')
                                                    ->with('staff') // Assumes a 'staff' relationship on Leave model
                                                    ->orderBy('created_at', 'desc')
                                                    ->get();

            // Fetch all staff data (or replicate logic from StaffController@allStaffs if more specific)
            $staff = Staff::orderBy('created_at', 'desc')->get();

            // Fetch all meetings data (or replicate logic from MeetingController@index if more specific)
            $meetings = Meeting::orderBy('date', 'desc')->orderBy('time', 'desc')->get();

            // Fetch all events data, ordered by date (assuming 'date' field exists)
            $events = Event::orderBy('date', 'desc')->get();

            // Fetch all tasks, ordered by creation date (assuming 'created_at' field exists)
            $tasks = Task::orderBy('created_at', 'desc')->get();

            // Fetch all complaints, ordered by creation date (assuming 'created_at' field exists)
            $complaints = Complaint::orderBy('created_at', 'desc')->get();

            // Fetch 5 most recent memos
            $memos = Memo::orderBy('created_at', 'desc')->take(5)->get();

            // Fetch staff with upcoming birthdays (next 30 days)
            $today = Carbon::today();
            $oneMonthLater = Carbon::today()->addMonth();

            $upcomingBirthdays = Staff::select(['id', 'staff_name', 'date_of_birth'])
                ->whereNotNull('date_of_birth')
                ->get()
                ->filter(function ($staffMember) use ($today, $oneMonthLater) {
                    if (empty($staffMember->date_of_birth)) {
                        return false;
                    }
                    try {
                        $dob = Carbon::parse($staffMember->date_of_birth);
                        $dobThisYear = $dob->copy()->year($today->year);

                        if ($dobThisYear->lt($today)) {
                            $dobThisYear->addYear();
                        }
                        return $dobThisYear->between($today, $oneMonthLater);
                    } catch (\Exception $e) {
                        return false; // Invalid date format
                    }
                })
                ->map(function ($staffMember) {
                    return [
                        'id' => $staffMember->id,
                        'name' => $staffMember->staff_name, // Use staff_name from DB, map to name for API
                        'date_of_birth' => Carbon::parse($staffMember->date_of_birth)->format('M d') // Format as 'Mon DD'
                    ];
                })->values();

            return response()->json([
                'status' => true,
                'data' => [
                    'pending_leaves' => $pendingLeaves,
                    'staff_summary' => [
                        'total_staff' => $staff->count(),
                        'open_leads' => $staff->where('lead_status', 'Open')->count(), // Example, adjust field name if needed
                        'follow_up_leads' => $staff->where('follow_up_type', 'Call')->count(), // Example, adjust field name if needed
                    ],
                    'meetings' => $meetings,
                    'events' => $events,
                    'tasks' => $tasks,
                    'complaints' => $complaints,
                    'memos' => $memos,
                    'upcoming_birthdays' => $upcomingBirthdays,
                ]
            ], 200);

        } catch (\Exception $e) {
            
            return response()->json([
                'status' => false,
                'message' => 'Error fetching dashboard data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
