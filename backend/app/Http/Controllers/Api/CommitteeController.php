<?php

namespace App\Http\Controllers\Api;

use App\Models\Commitees;
use Illuminate\Http\Request;
use App\Models\CommiteeStaff;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\CommitteeResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Controllers\Api\CommitteeController;

class CommitteeController extends BaseController
{
   

    public function index(Request $request): JsonResponse
    {
        $user = new UserResource(Auth::user()->load('staff'));
        // dd($user);
        $query = Commitees::query();

        if($request->query('search')){
            $searchTerm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('committees_name', 'like', '%' . $searchTerm . '%');
            });
        }

        $commitee = $query->orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Commitees"=>CommitteeResource::collection($commitee),
        'Pagination' => [
            'current_page' => $commitee->currentPage(),
            'last_page'=> $commitee->lastPage(),
            'per_page'=> $commitee->perPage(),
            'total'=> $commitee->total(),
        ]], "Commitees retrived successfully");

        
    }

    
 
    public function store(Request $request): JsonResponse
    {
        $staff = $request->input('staff');
        if (!$staff) {
            return $this->sendError("Staff not found", ['error' => ['Staff not found']]);
        }
    
        // Create a new committee record and assign institute_id from the authenticated user's staff
        $committee = new Commitees();
        $committee->commitee_name = $request->input("commitee_name");
        $committee->institute_id = Auth::user()->staff->institute_id; // This takes the institute_id from the logged-in admin's staff record
        $committee->save();
    
        // Prepare the committee staff details (only staff_id and designation)
        $committeeStaffDetails = [];
        foreach ($staff as $staffItem) {
            $committeeStaffDetails[] = new CommiteeStaff([
                'staff_id'    => $staffItem['staff_id'],
                'designation' => $staffItem['designation'],
            ]);
        }
    
        // Save the one-to-many relationship
        $committee->commiteeStaff()->saveMany($committeeStaffDetails);
    
        // Reload the relationship so that it can be included in the response
        $committee->load('commiteeStaff');
    
        // Build a custom response array with the exact fields you want
        $responseData = [
            "commitee_name" => $committee->commitee_name,
            "institute_id"  => $committee->institute_id,
            "staff"         => $committee->commiteeStaff->map(function ($item) {
                return [
                    "staff_id"    => $item->staff_id,
                    "designation" => $item->designation,
                ];
            })->toArray(),
        ];
    
         return $this->sendResponse([ "Committee" => new CommitteeResource($committee)], "Committee stored successfully");

    }


    public function show(string $id): JsonResponse
    {
      $committee = Commitees::find($id);
  //   $committee = Lead::with(['leadProducts', 'employee', 'followUp', 'contact'])->find($id);
      if(!$committee){
          return $this->sendError("Committee not found", ['error'=>['Committee not found']]);
      }
      return $this->sendResponse(["Committee"=>new CommitteeResource($committee)], "Committee retrieved successfully");
      // return $this->sendResponse(["lead"=> $lead, 'contact'=>new ContactResource($lead->contact)], "Lead retrieved successfully");
    }
 

    public function update(Request $request, string $id): JsonResponse
    {
        // Find the committee by ID
        $committee = Commitees::find($id);
        if (!$committee) {
            return $this->sendError("Committee not found", ['error' => ['Committee not found']]);
        }
    
        // Update the committee name if provided
        if ($request->has('commitee_name')) {
            $committee->commitee_name = $request->input('commitee_name');
        }
        
        // Optionally, you can update the institute_id from the authenticated user's staff, if needed.
        // Uncomment the following line if you want to enforce that the institute_id always comes from the logged in user.
        // $committee->institute_id = Auth::user()->staff->institute_id;
    
        $committee->save();
    
        // Update committee staff details if provided
        $staff = $request->input('staff');
        if ($staff) {
            // Delete previous staff details
            $committee->commiteeStaff()->delete();
    
            // Prepare new staff details
            $committeeStaffDetails = [];
            foreach ($staff as $staffItem) {
                $committeeStaffDetails[] = new CommiteeStaff([
                    'staff_id'    => $staffItem['staff_id'],
                    'designation' => $staffItem['designation'],
                ]);
            }
            // Save the new staff details
            $committee->commiteeStaff()->saveMany($committeeStaffDetails);
        }
    
        // Reload the relationship to include updated staff details
        $committee->load('commiteeStaff');
    
        return $this->sendResponse(
            ["Committee" => new CommitteeResource($committee)],
            "Committee updated successfully"
        );
    }
    



    

  

    public function destroy(string $id): JsonResponse
    {
        $committee = Commitees::find($id);
        if(!$committee){
            return $this->sendError("Commitees not found", ['error'=>'Commitees not found']);
        }
        $committee->delete();
        return $this->sendResponse([], "Commitees deleted successfully");
    }
 
    public function allCommitees(): JsonResponse
    {
        $committee = Commitees::all();

        return $this->sendResponse(["Commitees"=>CommitteeResource::collection($committee),
        ], "Commitees retrieved successfully");

    }

 
}