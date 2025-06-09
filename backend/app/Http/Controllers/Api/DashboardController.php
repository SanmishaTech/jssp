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
use Illuminate\Support\Facades\Auth;

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
            $user = Auth::user();

            if (!$user || !$user->staff) {
                return response()->json([
                    'status' => false,
                    'message' => 'User or staff details not found. Unable to load dashboard data.'
                ], 401); 
            }
            $instituteId = $user->staff->institute_id;
            $staffId = $user->staff->id;
            // Assuming model names and relationships. Adjust if necessary.
            // Fetch pending leave applications, try to include staff name
            $pendingLeaves = Leave::where('institute_id', $instituteId)
                                                    ->where('status', 'pending')
                                                    ->with('staff') // Assumes a 'staff' relationship on Leave model
                                                    ->orderBy('created_at', 'desc')
                                                    ->get();

            // Fetch all staff data (or replicate logic from StaffController@allStaffs if more specific)
            $staff = Staff::where('institute_id', $instituteId)->orderBy('created_at', 'desc')->get();

            // Fetch all meetings data (or replicate logic from MeetingController@index if more specific)
            $meetings = Meeting::where('institute_id', $instituteId)->orderBy('date', 'desc')->orderBy('time', 'desc')->get();

            // Fetch all events data, ordered by date (assuming 'date' field exists)
            $events = Event::where('institute_id', $instituteId)->orderBy('date', 'desc')->get();

            // Fetch all tasks, ordered by creation date (assuming 'created_at' field exists)
            $taskQuery = Task::where('institute_id', $instituteId)
                               ->orderBy('created_at', 'desc');

            if ($request->has('assigned_to')) {
                $taskQuery->where('assigned_to', $request->assigned_to);
            } else {
                // Default behavior if no specific 'assigned_to' is in the request
                if (!$user->hasRole(['admin', 'viceprincipal', 'superadmin'])) {
                    $taskQuery->where('assigned_to', $staffId);
                }
                // Admins see all tasks in the institute (no additional 'assigned_to' filter here unless from request)
            }
            $tasks = $taskQuery->get();

            // Fetch all complaints, ordered by creation date (assuming 'created_at' field exists)
            $complaints = Complaint::where('institute_id', $instituteId)->orderBy('created_at', 'desc')->get();

            // Fetch 5 most recent memos
            $memoQuery = Memo::with('staff') // staff relation is likely the creator
                               ->where('institute_id', $instituteId);

            if (!$user->hasRole(['admin', 'viceprincipal', 'superadmin'])) {
                $memoQuery->where('staff_id', $staffId); // Filter by the logged-in user's staff_id (creator)
            }
            $memos = $memoQuery->orderBy('created_at', 'desc')->take(5)->get();

            // Fetch staff with upcoming birthdays (next 30 days)
            $today = Carbon::today();
            $oneMonthLater = Carbon::today()->addMonth();

            $upcomingBirthdays = Staff::where('institute_id', $instituteId)
                ->select(['id', 'staff_name', 'date_of_birth'])
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
