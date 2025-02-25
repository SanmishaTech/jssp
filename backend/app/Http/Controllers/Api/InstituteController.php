<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Staff;
 use App\Models\Institute;
 use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Auth;
 use App\Http\Resources\InstituteResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\StaffResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\StoreInstituteRequest;
use App\Http\Requests\UpdateInstituteRequest;
use App\Http\Controllers\Api\InstituteController;

/**
 * @group Institutes
 */

class InstituteController extends BaseController
{
    /**
     * Show Paginate Institutes.
     */
    public function index(Request $request): JsonResponse
    {
        $user = new UserResource(Auth::user()->load('staff'));
        // dd($user);
        $query = Institute::query();

        if($request->query('search')){
            $searchTerm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('institute_name', 'like', '%' . $searchTerm . '%');
            });
        }

        $institutes = $query->orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Institutes"=>InstituteResource::collection($institutes),
        'Pagination' => [
            'current_page' => $institutes->currentPage(),
            'last_page'=> $institutes->lastPage(),
            'per_page'=> $institutes->perPage(),
            'total'=> $institutes->total(),
        ]], "Institutes retrived successfully");

        
    }

    /**
     * Store Institute
     * @bodyParam institute_name string The Name of the Institute.
      * @bodyParam registration_number string  The Registration Number of the Institute.
     * @bodyParam affiliated_university  string The Affiliated University of the Institute.
      * @bodyParam email string The Email of the Staff.
     * @bodyParam password string The Password of the Staff.
     */

     public function store(StoreInstituteRequest $request): JsonResponse
     {
         $active = 1;
         
         // Create User
         $user = new User();
         $user->name = $request->input('name'); // Ensure name is provided
         $user->email = $request->input('email');
         $user->active = $active;
         $user->password = Hash::make($request->input('password'));
         $user->save();
         
         $memberRole = Role::where("name", "admin")->first();
         $user->assignRole($memberRole);
         
         // Create Institute record using the user_id
         $institute = new Institute();
         $institute->institute_name = $request->input('institute_name');
         $institute->registration_number = $request->input('registration_number');
         $institute->affiliated_university = $request->input('affiliated_university');
         $institute->user_id = $user->id;
         
         if (!$institute->save()) {
             return response()->json(['error' => 'Institute creation failed'], 500);
         }
         
         // Now create Staff record with institute_id available
         $staff = new Staff();
         $staff->user_id = $user->id;
         $staff->institute_id = $institute->id; // Now the institute exists
         $staff->email = $request->input('email');
         $staff->save();
         
         return $this->sendResponse(
             [
                 'Institutes' => new InstituteResource($institute),
             ],
             'Institute Created Successfully'
         );
     }
     
    /**
     * Show Institutes
     */

 public function show(string $id): JsonResponse
 {
      $institutes = Institute::find($id);
     
      if (!$institutes) {
         return $this->sendError("Institute not found", ['error' => 'Institute not found']);
     }
 
      return $this->sendResponse(new InstituteResource($institutes), "Institute retrieved successfully");
 }

 
  /**
   * Update Institute
   * @bodyParam institute_name string The Name of the Institute.
 
    * @bodyParam registration_number string The Registration Number 
   */

   public function update(UpdateInstituteRequest $request, string $id): JsonResponse
   {
       // Find the Institute by ID
       $institute = Institute::find($id);
   
       // If the institute is not found, return an error
       if (!$institute) {
           return $this->sendError("Institute not found", ['error' => 'Institute not found']);
       }
   
       // Find the related User and Staff
       $user = User::find($institute->user_id);
       $staff = Staff::where('user_id', $institute->user_id)->first();
   
       if (!$user || !$staff) {
           return $this->sendError("Associated User or Staff not found", ['error' => 'User or Staff not found']);
       }
   
       // Update the User data
       $user->name = $request->input('name', $user->name);
        $user->email = $request->input('email', $user->email);
       
       if ($request->filled('password')) {
           $user->password = Hash::make($request->input('password'));
       }
       $user->save();
   
       // Update the Staff data
        $staff->email = $request->input('email', $staff->email);
        $staff->save();
   
       // Update the Institute data
       $institute->institute_name = $request->input('institute_name', $institute->institute_name);
        $institute->registration_number = $request->input('registration_number', $institute->registration_number);
       $institute->affiliated_university = $request->input('affiliated_university', $institute->affiliated_university);
       $institute->save();
   
       // Return the updated Institute data
       return $this->sendResponse(
           [
               "Institute" => new InstituteResource($institute),
               "User" => new UserResource($user),
               "Staff" => new StaffResource($staff),
           ],
           "Institute, User, and Staff Updated Successfully"
       );
   }
   
 

public function destroy(string $id): JsonResponse
{
    $institute = Institute::find($id);
    if (!$institute) {
        return $this->sendError("Institute not found", ['error' => 'Institute not found']);
    }

    // Delete the associated staff if it exists
    $staff = Staff::where('user_id', $institute->user_id)->first();
    if ($staff) {
        $staff->delete();
    }

    $institute->delete();
    
    return $this->sendResponse( "Institute and associated Staff deleted successfully");
}


 public function allInstitutes(string $id): JsonResponse
 {
    $institutes = Institute::all();

    return $this->sendResponse(["Institutes"=>InstitutesResource::collection($institutes),], "Institutes retrieved successfully");

 }

}