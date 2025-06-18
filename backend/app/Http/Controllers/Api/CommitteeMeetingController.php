<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\CommitteeMeetingResource;
use App\Models\CommitteeMeeting;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommitteeMeetingController extends BaseController
{
    /**
     * Display a listing of meetings (paginated, filterable by committee_id).
     */
    public function index(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;

        $query = CommitteeMeeting::with('committee')
            ->where('institute_id', $instituteId);

        if ($request->has('committee_id')) {
            $query->where('committee_id', $request->query('committee_id'));
        }

        $meetings = $query->orderByDesc('date')->paginate(7);

        return $this->sendResponse([
            'meetings'   => CommitteeMeetingResource::collection($meetings),
            'pagination' => [
                'current_page' => $meetings->currentPage(),
                'last_page'    => $meetings->lastPage(),
                'per_page'     => $meetings->perPage(),
                'total'        => $meetings->total(),
            ],
        ], 'Meetings retrieved successfully');
    }

    /**
     * Store a newly created meeting.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'committee_id' => 'required|exists:commitees,id',
            'venue'        => 'required|string|max:255',
            'date'         => 'required|date',
            'time'         => 'required',
            'synopsis'     => 'nullable|string',
        ]);

        $meeting = new CommitteeMeeting();
        $meeting->institute_id = Auth::user()->staff->institute_id;
        $meeting->committee_id = $validated['committee_id'];
        $meeting->venue        = $validated['venue'];
        $meeting->date         = $validated['date'];
        $meeting->time         = $validated['time'];
        $meeting->synopsis     = $validated['synopsis'] ?? null;

        try {
            $meeting->save();
        } catch (QueryException $e) {
            if ($e->getCode() === '22001') {
                return $this->sendError('Text is too long', ['error' => 'Synopsis text exceeds allowed length']);
            }
            throw $e;
        }

        return $this->sendResponse(['meeting' => new CommitteeMeetingResource($meeting)], 'Meeting stored successfully');
    }

    /**
     * Display the specified meeting.
     */
    public function show(string $id): JsonResponse
    {
        $meeting = CommitteeMeeting::with('committee')->find($id);

        if (!$meeting) {
            return $this->sendError('Meeting not found', ['error' => 'Meeting not found']);
        }

        return $this->sendResponse(['meeting' => new CommitteeMeetingResource($meeting)], 'Meeting retrieved successfully');
    }

    /**
     * Update the specified meeting.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $meeting = CommitteeMeeting::find($id);

        if (!$meeting) {
            return $this->sendError('Meeting not found', ['error' => 'Meeting not found']);
        }

        $validated = $request->validate([
            'committee_id' => 'required|exists:commitees,id',
            'venue'        => 'required|string|max:255',
            'date'         => 'required|date',
            'time'         => 'required',
            'synopsis'     => 'nullable|string',
        ]);

        $meeting->committee_id = $validated['committee_id'];
        $meeting->venue        = $validated['venue'];
        $meeting->date         = $validated['date'];
        $meeting->time         = $validated['time'];
        $meeting->synopsis     = $validated['synopsis'] ?? null;

        try {
            $meeting->save();
        } catch (QueryException $e) {
            if ($e->getCode() === '22001') {
                return $this->sendError('Text is too long', ['error' => 'Synopsis text exceeds allowed length']);
            }
            throw $e;
        }

        return $this->sendResponse(['meeting' => new CommitteeMeetingResource($meeting)], 'Meeting updated successfully');
    }

    /**
     * Remove the specified meeting.
     */
    public function destroy(string $id): JsonResponse
    {
        $meeting = CommitteeMeeting::find($id);

        if (!$meeting) {
            return $this->sendError('Meeting not found', ['error' => 'Meeting not found']);
        }

        $meeting->delete();

        return $this->sendResponse([], 'Meeting deleted successfully');
    }

    /**
     * Get all meetings without pagination (filtered by committee if provided).
     */
    public function allMeetings(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;

        $query = CommitteeMeeting::with('committee')->where('institute_id', $instituteId);

        if ($request->has('committee_id')) {
            $query->where('committee_id', $request->query('committee_id'));
        }

        $meetings = $query->get();

        return $this->sendResponse(['meetings' => CommitteeMeetingResource::collection($meetings)], 'Meetings retrieved successfully');
    }
}
