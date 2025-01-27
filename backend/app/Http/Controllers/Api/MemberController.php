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
        
        // $memberRole = $request->input("role");
        $memberRole = Role::where("name","member")->first();
       
        $user->assignRole($memberRole);
        
        $profiles = new Profile();
        $profiles->user_id = $user->id;
        $profiles->profile_name = $request->input('profile_name');
        $profiles->institute_id = $request->input('institute_id');
        $profiles->email = $request->input('email');
        $profiles->mobile = $request->input('mobile');
        //additional details of member
        //employee details
        $profiles->employee_number = $request->input('employee_number');
        $profiles->first_name = $request->input('first_name');
        $profiles->middle_name  = $request->input('middle_name');
        $profiles->last_name = $request->input('last_name');
        $profiles->spouse = $request->input('spouse');
        $profiles->gender = $request->input('gender');
        $profiles->maritial_status = $request->input('maritial_status');
        $profiles->blood_group = $request->input('blood_group');
        //address
        $profiles->corresponding_address = $request-> input('corresponding_address');
        $profiles->permanent_address = $request-> input('permanent_address');
        //contact details
        $profiles->personal_email = $request-> input('personal_email');
        $profiles->mobile = $request-> input('mobile');
        $profiles->landline = $request-> input('landline');
        //company details
        $profiles->state = $request-> input('state');
        $profiles->branch = $request-> input('branch');
        $profiles->location = $request-> input('location');
        $profiles->designation = $request-> input('designation');
        $profiles->department = $request-> input('department');
        $profiles->date_of_birth = $request-> input('date_of_birth');
        $profiles->joining_date = $request-> input('joining_date');
        $profiles->probation_date = $request-> input('probation_date');
        $profiles->confirmation_date = $request-> input('confirmation_date');
        $profiles->registration_date = $request-> input('registration_date');
        $profiles->relieving_date = $request-> input('relieving_date');
        $profiles->office_mail = $request-> input('office_mail');
        $profiles->office_landline = $request-> input('office_landline');
        $profiles->office_mobile = $request-> input('office_mobile');
        //statutory details
        $profiles->pf_number = $request-> input('pf_number');
        $profiles->uan_number = $request-> input('uan_number');
        $profiles->esic_number = $request-> input('esic_number');
        $profiles->pt_number = $request-> input('pt_number');
        $profiles->lwf_number = $request-> input('lwf_number');
        //qualification number
        $profiles->institution_name = $request-> input('institution_name');
        $profiles->degree = $request-> input('degree');
        $profiles->specialization = $request-> input('specialization');
        $profiles->from_year = $request-> input('from_year');
        $profiles->to_year = $request-> input('to_year');
        //previous employer
        $profiles->organization_name = $request-> input('organization_name');
        $profiles->previous_designation = $request-> input('previous_designation');
        $profiles->previous_department = $request-> input('previous_department');
        $profiles->previous_from_year = $request-> input('previous_from_year');
        $profiles->previous_to_year = $request-> input('previous_to_year');
        //bank details
        $profiles->holder_name = $request-> input('holder_name');
        $profiles->bank_name = $request-> input('bank_name');
        $profiles->account_number = $request-> input('account_number');
        $profiles->ifsc_code = $request-> input('ifsc_code');
        $profiles->bank_address = $request-> input('bank_address');

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
        $profiles->mobile = $request->input('mobile');
        $profiles->joining_date = $request->input('joining_date');
        // $profiles->resignation_date = $request->input('resignation_date');
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

    /**
     * resignation.
     */
    // public function resignation(Request $request, string $id): JsonResponse
    // {
    //     $employee = Employee::find($id);
    //     if(!$employee){
    //         return $this->sendError("employee not found", ['error'=>'employee not found']);
    //     }
    //     $activeVal = 1;
    //     $inactiveVal = 0;
        
    //     $user = User::find($employee->user_id);
    //     if(!empty($request->input('resignation_date'))){
    //         $employee->resignation_date = $request->input('resignation_date');
    //         $employee->save();
    //         $user->active = $inactiveVal;
    //         $user->save();
    //     }
    //     else{
    //         $user->active = $inactiveVal;
    //         $user->save();
    //     }
      
       
    //     return $this->sendResponse(['User'=> new UserResource($user), 'Employee'=>new EmployeeResource($employee)], "employee data updated successfully");
    // }
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