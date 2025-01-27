<?php

namespace App\Http\Controllers\Api;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Api\RoomController;

class RoomController extends BaseController
{
    public function index(Request $request):JsonResponse
    {
        $query = Room::query();

        if($request->query('search')){
            $searchTearm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('semester', 'like', '%' . $searchTerm. '%');
            });
        }

        $rooms = $query->orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Rooms"=>RoomResource::collection($rooms),
        'Pagination'=>[
            'current_page' => $rooms->currentPage(),
            'last_page' => $rooms->lastPage(),
            'per_page' => $rooms->perPage(),
            'total' => $rooms->total(),
    ]], "Rooms retrived successfully");
}

public function store(Request $request):JsonResponse
{
    $rooms = new Room();
    $rooms->institute_id = $request->input('institute_id');
    $rooms->room_number = $request->input('room_number');
    $rooms->room_name = $request->input('room_name');

    if(!$rooms -> save()){
        return response()->json(['error'=> 'Room creation failed'],500);
    }

    return $this->sendResponse(
        [
            'Rooms' => new RoomResource($rooms),
        ],
        'Room Created Successfully'
    );
}

public function show(string $id):JsonResponse
{
    $rooms = Room::find($id);
    if(!$rooms){
        return $this->sendError("Rooms not found", ['error' => 'Room not found']);
    }
    return $this ->sendResponse(new RoomResource($rooms), "Room Retrived Successfully");
}

public function update(Request $request, string $id):JsonResponse
{
    $rooms = Room::find($id);

    if(!$rooms){
        return $this-> sendError("Rooms not found", ['error' => 'Rooms not found']);
    }


    $rooms->institute_id = $request->input('institute_id');
    $rooms->room_number = $request-> input('room_number');
    $rooms->room_name = $request->input('room_name');

    $rooms -> save();

    return $this->sendResponse(
        [
            "Rooms" => new RoomResource($rooms)
        ],
        "Room Updated Successfully"
    );

}

public function destroy(string $id):JsonResponse
{
    $rooms = Room::find($id);
    if(!$rooms){
        return $this->sendError("Room not found", ['error' => 'Room not found']);
    }
    $rooms->delete();
    return $this->sendResponse([], "Rooms Deleted Successfully");
}

public function allRooms():JsonResponse
{
    $rooms = Room::all();
    return $this->sendResponse(["Rooms"=> Room::collection($rooms)], "Room retrieved successfully");
}




}