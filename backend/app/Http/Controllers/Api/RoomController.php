<?php

namespace App\Http\Controllers\Api;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\RoomRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CourseResource;
use App\Http\Controllers\Api\BaseController;

class RoomController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Room::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('room_name', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $room = $query->paginate(15);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Room" => RoomResource::collection($room),
                'Pagination' => [
                    'current_page' => $room->currentPage(),
                    'last_page'    => $room->lastPage(),
                    'per_page'     => $room->perPage(),
                    'total'        => $room->total(),
                ]
            ],
            "Room retrieved successfully"
        );
    }


    public function store(RoomRequest $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $room = new Room();
        $room->institute_id = Auth::user()->staff->institute_id;  
        $room->room_number = $request->input('room_number');
        $room->room_name = $request->input('room_name');
        $room->save();
        
        return $this->sendResponse([ "Room" => new RoomResource($room)], "Room stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $room = Room::find($id);

        if(!$room){
            return $this->sendError("Room not found", ['error'=>'Room not found']);
        }

  
        return $this->sendResponse(["Room" => new RoomResource($room) ], "Room retrived successfully");
    }


    public function update(RoomRequest $request, string $id): JsonResponse
    {
 
        $room = Room::find($id);

        if(!$room){
            return $this->sendError("Room not found", ['error'=>'Room not found']);
        }
       
                       
        $room->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $room->room_number = $request->input('room_number');
        $room->room_name = $request->input('room_name');
           $room->save();
       
        return $this->sendResponse([ "Room" => new RoomResource($room)], "Room updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $room = Room::find($id);
        if(!$room){
            return $this->sendError("Room not found", ['error'=> 'Room not found']);
        }
         $room->delete();
         return $this->sendResponse([], "Room deleted successfully");
    }

    public function allRooms(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $room = Room::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Room" => RoomResource::collection($room)],
            "Room retrieved successfully"
        );
    }
}