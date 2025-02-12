<?php

namespace App\Http\Controllers\Api;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\ProfileResource;
use App\Http\Controllers\Api\BaseController;

class MemberController extends BaseController
{
     /**
     * Display All Profiles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Profile::query()
            ->whereHas('user', function($q) {
                $q->whereDoesntHave('roles', function($rq) {
                    $rq->where('name', 'superadmin');
                });
            });

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
    
            $query->where(function ($query) use ($searchTerm) {
                $query->where('profile_name', 'like', '%' . $searchTerm . '%');
            });
        }
        $profiles = $query->paginate(15);

        return $this->sendResponse(["Profiles"=>ProfileResource::collection($profiles),
        'pagination' => [
            'current_page' => $profiles->currentPage(),
            'last_page' => $profiles->lastPage(),
            'per_page' => $profiles->perPage(),
            'total' => $profiles->total(),
        ]], "Profiles retrieved successfully");
    }

    /**
     * Store Profiles.
     */
    public function store(Request $request): JsonResponse
    {

        $active = 1;
        $user = new User();
        
        $user->name = $request->input('profile_name');
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();

        dd($user->id);        
        // $memberRole = $request->input("role");
        $memberRole = Role::where("name","member")->first();
       
        $user->assignRole($memberRole);
        
        $profiles = new Profile();
        $profiles->user_id = $user->id;
        $profiles->profile_name = $request->input('profile_name');
        $profiles->institute_id = $request->input('institute_id');
        $profiles->email = $request->input('email');
        //additional details of member
        //employee details
        $profiles->staff_number = $request->input('staff_number');
        $profiles->first_name = $request->input('first_name');
        $profiles->middle_name  = $request->input('middle_name');
        $profiles->last_name = $request->input('last_name');
        $profiles->gender = $request->input('gender');
        $profiles->maritial_status = $request->input('maritial_status');
        $profiles->blood_group = $request->input('blood_group');
        $profiles->date_of_birth = $request->input('date_of_birth');
        //address
        $profiles->corresponding_address = $request-> input('corresponding_address');
        $profiles->permanent_address = $request-> input('permanent_address');
        //contact details
        $profiles->personal_email = $request-> input('personal_email');
        $profiles->mobile = $request-> input('mobile');
        $profiles->alternate_mobile = $request-> input('alternate_mobile');
        $profiles->landline = $request-> input('landline');
     

        $profiles->save();
       
        return $this->sendResponse([
            // 'User'=> new UserResource($user), 
            'Profile'=>new ProfileResource($profiles)], "Profile stored successfully");
    }

    /**
     * Show Profile.
     */
    public function show(string $id): JsonResponse
    {
        $profiles = Profile::find($id);

        if(!$profiles){
            return $this->sendError("Profile not found", ['error'=>'Profile not found']);
        }
        $user = User::find($profiles->user_id);
        return $this->sendResponse(['User'=> new UserResource($user), 'Profile'=>new ProfileResource($profiles)], "Profile retrived successfully");
    }

    /**
     * Update Profile.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $profiles = Profile::find($id);

        if(!$profiles){
            return $this->sendError("Profile not found", ['error'=>'Profile not found']);
        }
        $user = User::find($profiles->user_id);
        $user->name = $request->input('profile_name');
        $user->email = $request->input('email');
        $user->active = $request->input('active', 1);
        $user->password = Hash::make($request->input('password'));
        $user->save();

        // $memberRole = $request->input("role");
        $memberRole = Role::where("name","member")->first();
        $user->assignRole($memberRole);
                       
        $profiles->profile_name = $request->input('profile_name');
         $profiles->email = $request->input('email');
         $profiles->joining_date = $request->input('joining_date');
        // $profiles->resignation_date = $request->input('resignation_date');
        //additional details of member
        //employee details
        $profiles->staff_number = $request->input('staff_number');
        $profiles->first_name = $request->input('first_name');
        $profiles->middle_name  = $request->input('middle_name');
        $profiles->last_name = $request->input('last_name');
        $profiles->gender = $request->input('gender');
        $profiles->maritial_status = $request->input('maritial_status');
        $profiles->blood_group = $request->input('blood_group');
        $profiles->date_of_birth = $request->input('date_of_birth');
        //address
        $profiles->corresponding_address = $request-> input('corresponding_address');
        $profiles->permanent_address = $request-> input('permanent_address');
        //contact details
        $profiles->personal_email = $request-> input('personal_email');
        $profiles->mobile = $request-> input('mobile');
        $profiles->alternate_mobile = $request-> input('alternate_mobile');
        $profiles->landline = $request-> input('landline');
        $profiles->save();
       
        return $this->sendResponse(['User'=> new UserResource($user), 'Profile'=>new ProfileResource($profiles)], "Profile updated successfully");

    }

    /**
     * Remove Profile.
     */
    public function destroy(string $id): JsonResponse
    {
        $profiles = Profile::find($id);
        if(!$profiles){
            return $this->sendError("Profile not found", ['error'=> 'Profile not found']);
        }
        $user = User::find($profiles->user_id);
        $profiles->delete();
        $user->delete();
        return $this->sendResponse([], "Profile deleted successfully");
    }

    
    public function resignation(ResignationRequest $request, string $id): JsonResponse
    {
        $profiles = Profile::find($id);
        if (!$profiles) {
            return $this->sendError("Profile not found", ['error' => 'Profile not found']);
        }
    
        $activeVal = 1;
        $inactiveVal = 0;
    
        $user = User::find($profiles->user_id);
    
        // Check if resignation_date is null or an empty string
        $resignationDate = $request->input('resignation_date');
        if ($resignationDate !== null && $resignationDate !== "") {
            $carbonDate = Carbon::parse($resignationDate);
            $today = Carbon::today();
    
            // If the resignation date is in the future, return a validation error
            if ($carbonDate->gt($today)) {
                return $this->sendError('Validation Error', ['error' => 'Resignation date cannot be in the future']);
            }
            
            $profiles->resignation_date = $resignationDate;
            $profiles->save();
            $user->active = $inactiveVal;
            $user->save();
            // dd("if working");
        } else {
            // If resignation_date is empty or null, set the user status to inactive
            $profiles->resignation_date = $resignationDate;
            $profiles->save();
            $user->active = $activeVal;
            $user->save();
            // dd("else working");
        }
    
        return $this->sendResponse(['User' => new UserResource($user), 'Profile' => new ProfileResource($profiles)], "Profile data updated successfully");
    }
    
    
}