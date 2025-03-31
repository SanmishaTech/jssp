<?php

namespace App\Http\Controllers\Api;

 use Illuminate\Http\Request;
use App\Models\Meeting;
 use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\MeetingResource;
use App\Http\Controllers\Api\BaseController;

class MeetingController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Meeting::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('venue', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $meeting = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Meeting" => MeetingResource::collection($meeting),
                'Pagination' => [
                    'current_page' => $meeting->currentPage(),
                    'last_page'    => $meeting->lastPage(),
                    'per_page'     => $meeting->perPage(),
                    'total'        => $meeting->total(),
                ]
            ],
            "Meeting retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $meeting = new Meeting();
        $meeting->institute_id = Auth::user()->staff->institute_id;  
        $meeting->venue = $request->input('venue');
        $meeting->date = $request->input('date');
        $meeting->time = $request->input('time');
        $meeting->synopsis = $request->input('synopsis');
        $meeting->save();
        
        return $this->sendResponse([ "Meeting" => new MeetingResource($meeting)], "Meeting stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $meeting = Meeting::find($id);

        if(!$meeting){
            return $this->sendError("Meeting not found", ['error'=>'Meeting not found']);
        }

  
        return $this->sendResponse(["Meeting" => new MeetingResource($meeting) ], "Meeting retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $meeting = Meeting::find($id);

        if(!$meeting){
            return $this->sendError("Meeting not found", ['error'=>'Meeting not found']);
        }
       
                       
        $meeting->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $meeting->venue = $request->input('venue');
        $meeting->date = $request->input('date');
        $meeting->time = $request->input('time');
        $meeting->synopsis = $request->input('synopsis');
           $meeting->save();
       
        return $this->sendResponse([ "Meeting" => new MeetingResource($meeting)], "Meeting updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $meeting = Meeting::find($id);
        if(!$meeting){
            return $this->sendError("Meeting not found", ['error'=> 'Meeting not found']);
        }
         $meeting->delete();
         return $this->sendResponse([], "Meeting deleted successfully");
    }

    public function allMeetings(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $meeting = Meeting::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Meeting" => MeetingResource::collection($meeting)],
            "Meeting retrieved successfully"
        );
    }
}