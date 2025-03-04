<?php

namespace App\Http\Controllers\Api;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\EventResource;
use App\Http\Controllers\Api\BaseController;

class EventController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Event::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('venue', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $event = $query->paginate(15);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Event" => EventResource::collection($event),
                'Pagination' => [
                    'current_page' => $event->currentPage(),
                    'last_page'    => $event->lastPage(),
                    'per_page'     => $event->perPage(),
                    'total'        => $event->total(),
                ]
            ],
            "Event retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $event = new Event();
        $event->institute_id = Auth::user()->staff->institute_id;  
        $event->venue = $request->input('venue');
        $event->date = $request->input('date');
        $event->time = $request->input('time');
        $event->synopsis = $request->input('synopsis');
        $event->save();
        
        return $this->sendResponse([ "Event" => new EventResource($event)], "Event stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $event = Event::find($id);

        if(!$event){
            return $this->sendError("Event not found", ['error'=>'Event not found']);
        }

  
        return $this->sendResponse(["Event" => new EventResource($event) ], "Event retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $event = Event::find($id);

        if(!$event){
            return $this->sendError("Event not found", ['error'=>'Event not found']);
        }
       
                       
        $event->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $event->venue = $request->input('venue');
        $event->date = $request->input('date');
        $event->time = $request->input('time');
        $event->synopsis = $request->input('synopsis');
           $event->save();
       
        return $this->sendResponse([ "Event" => new EventResource($event)], "Event updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $event = Event::find($id);
        if(!$event){
            return $this->sendError("Event not found", ['error'=> 'Event not found']);
        }
         $event->delete();
         return $this->sendResponse([], "Event deleted successfully");
    }

    public function allEvents(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $event = Event::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Event" => EventResource::collection($event)],
            "Event retrieved successfully"
        );
    }
}