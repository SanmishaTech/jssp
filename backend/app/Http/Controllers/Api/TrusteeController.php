<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Profile;
use App\Models\Trustee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\TrusteeResource;
use App\Http\Controllers\Api\BaseController;

class TrusteeController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Trustee::query();

        if($request->query('search')){
            $searchTerm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('trustee_name', 'like', '%' . $searchTerm . '%');
            });
        }

        $trustees = $query->orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Trustees"=>TrusteeResource::collection($trustees),
        'Pagination' => [
            'current_page' => $trustees->currentPage(),
            'last_page'=> $trustees->lastPage(),
            'per_page'=> $trustees->perPage(),
            'total'=> $trustees->total(),
        ]], "trustees retrived successfully");

        
    }

    public function store(Request $request): JsonResponse
    {
        $active = 1;
        $user = new User();
        $user->name = $request->input('profile_name');
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();
    
        $memberRole = Role::where("name", "superadmin")->first();
        $user->assignRole($memberRole);

           
        $profiles = new Profile();
        $profiles->user_id = $user->id;
        $profiles->profile_name = $request->input('profile_name');
        $profiles->email = $request->input('email');
        $profiles->mobile = $request->input('mobile');
  
        $profiles->save();
    
        $trustees = new Trustee();
        $trustees->trustee_name = $request->input('trustee_name');
        $trustees->designation = $request->input('designation');
         $trustees->contact_mobile = $request->input('contact_mobile');
        $trustees->address = $request->input('address');
        
        $trustees->user_id = $user->id;

     
        if (!$trustees->save()) {
            return response()->json(['error' => 'Trustee creation failed'], 500);
        }
    
        return $this->sendResponse(
            [
                'Trustees' => new TrusteeResource($trustees),
             ],
            'Trustee Created Successfully'
        );
    }

    public function show(string $id): JsonResponse
    {
         $trustees = Trustee::find($id);
        
         if (!$trustees) {
            return $this->sendError("Trustee not found", ['error' => 'Trustee not found']);
        }
    
         return $this->sendResponse(new TrusteeResource($trustees), "Trustee retrieved successfully");
    }



    public function update(Request $request, string $id): JsonResponse
    {
         $trustees = Trustee::find($id);
    
        // If the institute is not found, return an error
        if (!$trustees) {
            return $this->sendError("Trustees not found", ['error' => 'Trustees not found']);
        }
    
        // Find the related User and Profile
        $user = User::find($trustees->user_id);
        $profile = Profile::where('user_id', $trustees->user_id)->first();
    
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
        $trustees->trustee_name = $request->input('trustee_name', $trustees->trustee_name);
        $trustees->designation = $request->input('designation', $trustees->designation);
         $trustees->contact_mobile = $request->input('contact_mobile', $trustees->contact_mobile);
        $trustees->address = $request->input('address', $trustees->address);
         $trustees->save();
    
        // Return the updated Institute data
        return $this->sendResponse(
            [
                "Institute" => new TrusteeResource($trustees),
                "User" => new UserResource($user),
                "Profile" => new ProfileResource($profile),
            ],
            "Institute, User, and Profile Updated Successfully"
        );
    }


    public function destroy(string $id): JsonResponse
    {
       $trustees = Trustee::find($id);
       if(!$trustees){
           return $this->sendError("Trustees not found", ['error'=>'Trustees not found']);
       }
   
       $trustees->delete();
       
       return $this->sendResponse([], "Trustees Deleted Successfully");
   
    }


    
    
   





}