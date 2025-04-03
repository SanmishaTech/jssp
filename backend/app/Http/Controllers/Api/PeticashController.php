<?php

namespace App\Http\Controllers\Api;

use App\Models\Peticash;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\PeticashResource;
use App\Http\Controllers\Api\BaseController;

class PeticashController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;

        $query = Peticash::where('institute_id', $instituteId);

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('total_amount', 'like', '%' . $searchTerm . '%');
            });
        }

        // Add date filter
        if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

        $peticash = $query->paginate(7);

        return $this->sendResponse(
            [
                "Peticash" => PeticashResource::collection($peticash),
                'Pagination' => [
                    'current_page' => $peticash->currentPage(),
                    'last_page'    => $peticash->lastPage(),
                    'per_page'     => $peticash->perPage(),
                    'total'        => $peticash->total(),
                ]
            ],
            "Peticash retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $peticash = new Peticash();
        $peticash->institute_id = Auth::user()->staff->institute_id;  
        $peticash->total_amount = $request->input('total_amount');
        $peticash->note = $request->input('note');
        $peticash->note_amount = $request->input('note_amount');
        $peticash->total_spend = $request->input('total_spend');
        $peticash->save();
        
        return $this->sendResponse([ "Peticash" => new PeticashResource($peticash)], "Peticash stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $peticash = Peticash::find($id);

        if(!$peticash){
            return $this->sendError("Peticash not found", ['error'=>'Peticash not found']);
        }

  
        return $this->sendResponse(["Peticash" => new PeticashResource($peticash) ], "Peticash retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $peticash = Peticash::find($id);

        if(!$peticash){
            return $this->sendError("Peticash not found", ['error'=>'Peticash not found']);
        }
       
                       
        $peticash->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $peticash->total_amount = $request->input('total_amount');
        $peticash->note = $request->input('note');
        $peticash->note_amount = $request->input('note_amount');
        $peticash->total_spend = $request->input('total_spend');
        $peticash->save();
       
        return $this->sendResponse([ "Peticash" => new PeticashResource($peticash)], "Peticash updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $peticash = Peticash::find($id);
        if(!$peticash){
            return $this->sendError("Peticash not found", ['error'=> 'Peticash not found']);
        }
         $peticash->delete();
         return $this->sendResponse([], "Peticash deleted successfully");
    }

    public function allRooms(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $peticash = Peticash::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Peticash" => PeticashResource::collection($peticash)],
            "Peticash retrieved successfully"
        );
    }
}