<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Profile;
use App\Models\Institute;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\InstituteResource;
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
        ]], "Department retrived successfully");

        
    }

    /**
     * Store Institute
     * @bodyParam institute_name string The Name of the Institute.
     * @bodyParam contact_name string The Contact Name of the Institute.
     * @bodyParam contact_mobile string The Contact Mobile of the Institute.
     * @bodyParam address string The Address of the Institute.
     * @bodyParam registration_number string  The Registration Number of the Institute.
     * @bodyParam affiliated_university  string The Affiliated University of the Institute.
     * @bodyParam profile_name string The Name of the Profile.
     * @bodyParam email string The Email of the Profile.
     * @bodyParam password string The Password of the Profile.
     */

    public function store(StoreInstituteRequest $request): JsonResponse
    {
        $active = 1;
        $user = new User();
        $user->name = $request->input('profile_name');
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();
    
        $memberRole = Role::where("name", "admin")->first();
        $user->assignRole($memberRole);

           
        $profiles = new Profile();
        $profiles->user_id = $user->id;
        $profiles->profile_name = $request->input('profile_name');
         $profiles->email = $request->input('email');
        $profiles->mobile = $request->input('mobile');
  
        $profiles->save();
    
        $institutes = new Institute();
        $institutes->institute_name = $request->input('institute_name');
        $institutes->contact_name = $request->input('contact_name');
        $institutes->contact_mobile = $request->input('contact_mobile');
        $institutes->address = $request->input('address');
        $institutes->registration_number = $request->input('registration_number');
        $institutes->affiliated_university = $request->input('affiliated_university');
       
        $institutes->user_id = $user->id;

     
        if (!$institutes->save()) {
            return response()->json(['error' => 'Institute creation failed'], 500);
        }
    
        return $this->sendResponse(
            [
                'Institutes' => new InstituteResource($institutes),
                // 'Users' => new UserResource($user),
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
   * @boadyParam contact_name string The Contact Name of the Institute.
   * @bodyParam contact_mobile string The Contact Mobile of the Institute.
   * @bodyParam address string The Address of the Institute.
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
   
       // Find the related User and Profile
       $user = User::find($institute->user_id);
       $profile = Profile::where('user_id', $institute->user_id)->first();
   
       if (!$user || !$profile) {
           return $this->sendError("Associated User or Profile not found", ['error' => 'User or Profile not found']);
       }
   
       // Update the User data
       $user->name = $request->input('profile_name', $user->name);
       $user->email = $request->input('email', $user->email);
       
       if ($request->filled('password')) {
           $user->password = Hash::make($request->input('password'));
       }
       $user->save();
   
       // Update the Profile data
       $profile->profile_name = $request->input('profile_name', $profile->profile_name);
       $profile->email = $request->input('email', $profile->email);
       $profile->mobile = $request->input('contact_mobile', $profile->mobile);
       $profile->save();
   
       // Update the Institute data
       $institute->institute_name = $request->input('institute_name', $institute->institute_name);
       $institute->contact_name = $request->input('contact_name', $institute->contact_name);
       $institute->contact_mobile = $request->input('contact_mobile', $institute->contact_mobile);
       $institute->address = $request->input('address', $institute->address);
       $institute->registration_number = $request->input('registration_number', $institute->registration_number);
       $institute->affiliated_university = $request->input('affiliated_university', $institute->affiliated_university);
       $institute->save();
   
       // Return the updated Institute data
       return $this->sendResponse(
           [
               "Institute" => new InstituteResource($institute),
               "User" => new UserResource($user),
               "Profile" => new ProfileResource($profile),
           ],
           "Institute, User, and Profile Updated Successfully"
       );
   }
   
 

public function destroy(string $id): JsonResponse
{
    $institute = Institute::find($id);
    if (!$institute) {
        return $this->sendError("Institute not found", ['error' => 'Institute not found']);
    }

    // Delete the associated profile if it exists
    $profile = Profile::where('user_id', $institute->user_id)->first();
    if ($profile) {
        $profile->delete();
    }

    $institute->delete();
    
    return $this->sendResponse([], "Institute and associated Profile deleted successfully");
}


 public function allInstitutes(string $id): JsonResponse
 {
    $institutes = Institute::all();

    return $this->sendResponse(["Institutes"=>InstitutesResource::collection($institutes),], "Institutes retrieved successfully");

 }

}