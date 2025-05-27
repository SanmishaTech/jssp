<?php

namespace App\Http\Controllers\Api;

use App\Models\Memo;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\MemoResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\MemoRequest;
use Illuminate\Support\Facades\Validator;

class MemoController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Memo::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('memo_subject', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $memo = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Memo" => MemoResource::collection($memo),
                'Pagination' => [
                    'current_page' => $memo->currentPage(),
                    'last_page'    => $memo->lastPage(),
                    'per_page'     => $memo->perPage(),
                    'total'        => $memo->total(),
                ]
            ],
            "Memo retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $memo = new Memo();
        $memo->institute_id = Auth::user()->staff->institute_id; 
         $memo->staff_id = $request->input('staff_id');
         $memo->memo_subject = $request->input('memo_subject');
        $memo->memo_description = $request->input('memo_description');
         $memo->save();
        
        return $this->sendResponse([ "Memo" => new MemoResource($memo)], "Memo stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $memo = Memo::find($id);

        if(!$memo){
            return $this->sendError("Memo not found", ['error'=>'Memo not found']);
        }

  
        return $this->sendResponse(["Memo" => new MemoResource($memo) ], "Memo retrived successfully");
    }


    public function update(MemoRequest $request, string $id): JsonResponse
    {
 
        $memo = Memo::find($id);

        if(!$memo){
            return $this->sendError("Memo not found", ['error'=>'Memo not found']);
        }
       
                       
        $memo->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $memo->staff_id = $request->input('staff_id');
        $memo->memo_subject = $request->input('memo_subject');
        $memo->memo_description = $request->input('memo_description');
     
           $memo->save();
       
        return $this->sendResponse([ "Memo" => new MemoResource($memo)], "Memo updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $memo = Memo::find($id);
        if(!$memo){
            return $this->sendError("Memo not found", ['error'=> 'Memo not found']);
        }
         $memo->delete();
         return $this->sendResponse([], "Memo deleted successfully");
    }

    public function allMemos(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $memo = Memo::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Memo" => MemoResource::collection($memo)],
            "Memo retrieved successfully"
        );
    }
}
