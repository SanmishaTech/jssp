<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeacherTimetableResource;
use App\Http\Resources\TeacherTimetableSlotResource;
use App\Models\TeacherTimetable;
use App\Models\TeacherTimetableSlot;
use App\Models\Staff;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class TeacherTimetableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = TeacherTimetable::with(['staff', 'slots.subject']);
        
        // Filter by staff_id if provided
        if ($request->has('staff_id')) {
            $query->where('staff_id', $request->staff_id);
        }
        
        // Filter by week_start_date if provided
        if ($request->has('week_start_date')) {
            $query->where('week_start_date', $request->week_start_date);
        }
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $timetables = $query->orderBy('week_start_date', 'desc')
                           ->paginate(10);
        
        return TeacherTimetableResource::collection($timetables);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|exists:staff,id',
            'week_start_date' => 'required|date',
            'status' => 'required|in:active,inactive,draft',
            'slots' => 'required|array',
            'slots.*.day' => 'required|string',
            'slots.*.time_slot' => 'required|string',
            'slots.*.slot_id' => 'required|string',
            'slots.*.is_break' => 'boolean',
            'slots.*.subject_id' => 'nullable|exists:subjects,id',
            'slots.*.description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if timetable already exists for this staff and week
        $existingTimetable = TeacherTimetable::where('staff_id', $request->staff_id)
                                          ->where('week_start_date', $request->week_start_date)
                                          ->first();

        if ($existingTimetable) {
            return response()->json([
                'message' => 'A timetable already exists for this staff and week',
                'data' => new TeacherTimetableResource($existingTimetable->load('slots.subject')),
            ], 409);
        }

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Create the timetable
            $timetable = TeacherTimetable::create([
                'staff_id' => $request->staff_id,
                'week_start_date' => $request->week_start_date,
                'status' => $request->status,
            ]);

            // Create the slots
            foreach ($request->slots as $slotData) {
                TeacherTimetableSlot::create([
                    'teacher_timetable_id' => $timetable->id,
                    'day' => $slotData['day'],
                    'time_slot' => $slotData['time_slot'],
                    'slot_id' => $slotData['slot_id'],
                    'is_break' => $slotData['is_break'] ?? false,
                    'subject_id' => $slotData['subject_id'] ?? null,
                    'division_id' => $slotData['division_id'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Timetable created successfully',
                'data' => new TeacherTimetableResource($timetable->load('slots.subject')),
            ], 201);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to create timetable', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $timetable = TeacherTimetable::with(['staff', 'slots.subject'])->find($id);

        if (!$timetable) {
            return response()->json(['message' => 'Timetable not found'], 404);
        }

        return new TeacherTimetableResource($timetable);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'staff_id' => 'exists:staff,id',
            'week_start_date' => 'date',
            'status' => 'in:active,inactive,draft',
            'slots' => 'array',
            'slots.*.id' => 'nullable|exists:teacher_timetable_slots,id',
            'slots.*.day' => 'string',
            'slots.*.time_slot' => 'string',
            'slots.*.slot_id' => 'string',
            'slots.*.is_break' => 'boolean',
            'slots.*.subject_id' => 'nullable|exists:subjects,id',
            'slots.*.description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $timetable = TeacherTimetable::find($id);

        if (!$timetable) {
            return response()->json(['message' => 'Timetable not found'], 404);
        }

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Update the timetable
            if ($request->has('staff_id')) {
                $timetable->staff_id = $request->staff_id;
            }

            if ($request->has('week_start_date')) {
                $timetable->week_start_date = $request->week_start_date;
            }

            if ($request->has('status')) {
                $timetable->status = $request->status;
            }

            $timetable->save();

            // Update the slots if provided
            if ($request->has('slots')) {
                // Delete existing slots if updating slots
                TeacherTimetableSlot::where('teacher_timetable_id', $timetable->id)->delete();
                
                // Create new slots
                foreach ($request->slots as $slotData) {
                    TeacherTimetableSlot::create([
                        'teacher_timetable_id' => $timetable->id,
                        'day' => $slotData['day'],
                        'time_slot' => $slotData['time_slot'],
                        'slot_id' => $slotData['slot_id'],
                        'is_break' => $slotData['is_break'] ?? false,
                        'subject_id' => $slotData['subject_id'] ?? null,
                        'division_id' => $slotData['division_id'] ?? null,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Timetable updated successfully',
                'data' => new TeacherTimetableResource($timetable->load('slots.subject')),
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to update timetable', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $timetable = TeacherTimetable::find($id);

        if (!$timetable) {
            return response()->json(['message' => 'Timetable not found'], 404);
        }

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Delete the slots first (although this should happen automatically due to foreign key constraints)
            TeacherTimetableSlot::where('teacher_timetable_id', $timetable->id)->delete();
            
            // Delete the timetable
            $timetable->delete();

            DB::commit();

            return response()->json(['message' => 'Timetable deleted successfully']);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => 'Failed to delete timetable', 'error' => $e->getMessage()], 500);
        }
    }
    
    /**
     * Get timetable by staff and week
     */
    public function getByStaffAndWeek(Request $request)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|exists:staff,id',
            'week_start_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $timetable = TeacherTimetable::with(['staff', 'slots' => function($query) {
                $query->orderBy('day')->orderBy('slot_id');
            }, 'slots.subject'])
            ->where('staff_id', $request->staff_id)
            ->where('week_start_date', $request->week_start_date)
            ->first();

        if (!$timetable) {
            return response()->json(['message' => 'Timetable not found'], 404);
        }

        return new TeacherTimetableResource($timetable);
    }
    
    /**
     * Update a specific slot in a timetable
     */
    public function updateSlot(Request $request, string $timetableId, string $slotId)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'subject_id' => 'nullable|exists:subjects,id',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $slot = TeacherTimetableSlot::where('teacher_timetable_id', $timetableId)
                                  ->where('id', $slotId)
                                  ->first();

        if (!$slot) {
            return response()->json(['message' => 'Slot not found'], 404);
        }

        // Update the slot
        if ($request->has('subject_id')) {
            $slot->subject_id = $request->subject_id;
        }

        if ($request->has('division_id')) {
            $slot->division_id = $request->division_id;
        }

        $slot->save();

        return response()->json([
            'message' => 'Slot updated successfully',
            'data' => new TeacherTimetableSlotResource($slot->load('subject')),
        ]);
    }
    
    /**
     * Get staff for timetable selector.
     *
     * Default: all staff belonging to the authenticated user's institute.
     * Optional filters:
     *  - role=roleName (single role)
     *  - roles=role1,role2 (comma-separated list of roles)
     */
    public function getTeachingStaff(Request $request)
    {
        // Institute of the authenticated user (if user has a staff record). If none, do not restrict by institute.
        $instituteId = Auth::user()?->staff?->institute_id;

        $query = Staff::query()
            ->with('user')
            ->when($instituteId, function ($q) use ($instituteId) {
                $q->where('institute_id', $instituteId);
            });

        // Optional role filtering via Spatie roles on the related user
        $rolesParam = $request->query('roles');
        $roleParam = $request->query('role');

        if ($rolesParam || $roleParam) {
            $roles = $rolesParam ? array_filter(array_map('trim', explode(',', $rolesParam))) : [$roleParam];
            $query->whereHas('user.roles', function ($qr) use ($roles) {
                $qr->whereIn('name', $roles);
            });
        }

        // Fetch staff for this institute
        $staff = $query->get();

        // Fallback: if no staff found and we filtered by institute, try without institute filter
        if ($staff->isEmpty() && $instituteId) {
            $staff = Staff::with('user')
                ->when($rolesParam || $roleParam, function ($q) use ($rolesParam, $roleParam) {
                    $roles = $rolesParam ? array_filter(array_map('trim', explode(',', $rolesParam))) : [$roleParam];
                    $q->whereHas('user.roles', function ($qr) use ($roles) {
                        $qr->whereIn('name', $roles);
                    });
                })
                ->get();
        }

        return response()->json($staff);
    }
}
