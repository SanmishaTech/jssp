<?php

namespace App\Http\Controllers\Api;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\HolidayResource;
use App\Http\Controllers\Api\BaseController;

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
         $holiday->medium_code = $request->input('medium_code');
        $holiday->description = $request->input('description');
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

}
