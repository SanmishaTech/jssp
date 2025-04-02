<?php

namespace App\Http\Controllers\Api;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\SubjectResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Api\SubjectController;

class SubjectController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
         $instituteId = Auth::user()->staff->institute_id;
    
         $query = Subject::where('institute_id', $instituteId);
    
          if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('total_fees', 'like', '%' . $searchTerm . '%');
            });
        }

           // Add date filter
           if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

    
          $subject = $query->paginate(7);
    
         return $this->sendResponse(
            [
                "Subject" => SubjectResource::collection($subject),
                'Pagination' => [
                    'current_page' => $subject->currentPage(),
                    'last_page'    => $subject->lastPage(),
                    'per_page'     => $subject->perPage(),
                    'total'        => $subject->total(),
                ]
            ],
            "Subject retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $subject = new Subject();
        $subject->institute_id = Auth::user()->staff->institute_id;  
        $subject->subject_name = $request->input('subject_name');
        $subject->save();
        
        return $this->sendResponse([ "Subject" => new SubjectResource($subject)], "Subject stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $subject = Subject::find($id);

        if(!$subject){
            return $this->sendError("Subject not found", ['error'=>'Subject not found']);
        }

  
        return $this->sendResponse(["Subject" => new SubjectResource($subject) ], "Subject retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $subject = Subject::find($id);

        if(!$subject){
            return $this->sendError("Subject not found", ['error'=>'Subject not found']);
        }
       
                       
        $subject->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $subject->subject_name = $request->input('subject_name');
        $subject->save();
       
        return $this->sendResponse([ "Subject" => new SubjectResource($subject)], "Subject updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $subject = Subject::find($id);
        if(!$subject){
            return $this->sendError("Subject not found", ['error'=> 'Subject not found']);
        }
         $subject->delete();
         return $this->sendResponse([], "Subject deleted successfully");
    }

    public function allSubject(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $subject = Subject::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Subject" => SubjectResource::collection($subject)],
            "Subject retrieved successfully"
        );
    }
}