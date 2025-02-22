<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\StaffResource;
 use App\Http\Controllers\Api\BaseController;

class StaffController extends BaseController
{
     public function index(Request $request): JsonResponse
    {
        $query = Staff::query();

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
    
            $query->where(function ($query) use ($searchTerm) {
                $query->where('staff_name', 'like', '%' . $searchTerm . '%');
            });
        }
        $staff = $query->paginate(15);

        return $this->sendResponse(["Staff"=>StaffResource::collection($staff),
        'pagination' => [
            'current_page' => $staff->currentPage(),
            'last_page' => $staff->lastPage(),
            'per_page' => $staff->perPage(),
            'total' => $staff->total(),
        ]], "Staff retrieved successfully");
    }


    public function store(Request $request): JsonResponse
    {
 
      
        //P
        $active = 1;
        $user = new User();
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();
        
        $memberRole = Role::where("name","member")->first();
        $user->assignRole($memberRole);
        
        $staff = new Staff();
        $staff->user_id = $user->id;
        $staff->institute_id = $institutes->id;
        $staff->staff_name = $request->input('staff_name');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
        $staff->save();
       
        return $this->sendResponse([ new StaffResource($staff)], "Staff stored successfully");
    }

    /**
     * Show Staff.
     */
    public function show(string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if(!$staff){
            return $this->sendError("Staff not found", ['error'=>'Staff not found']);
        }

        $user = User::find($staff->user_id);
 
        return $this->sendResponse([ new StaffResource($staff) ], "Staff retrived successfully");
    }

    /**
     * Update Staff.
     */
    public function update(Request $request, string $id): JsonResponse
    {
 
        $staff = Staff::find($id);

        if(!$staff){
            return $this->sendError("Staff not found", ['error'=>'Staff not found']);
        }
        $user = User::find($staff->user_id);
        $user->email = $request->input('email');
        $user->active = $request->input('active', 1);
        $user->password = Hash::make($request->input('password'));
        $user->save();

         $memberRole = Role::where("name","member")->first();
        $user->assignRole($memberRole);
                       
        $staff->institute_id = $institutes->id;
        $staff->staff_name = $request->input('staff_name');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
          $staff->save();
       
        return $this->sendResponse([ new StaffResource($staff)], "Staff updated successfully");

    }

    /**
     * Remove Staff.
     */
    public function destroy(string $id): JsonResponse
    {
        $staff = Staff::find($id);
        if(!$staff){
            return $this->sendError("Staff not found", ['error'=> 'Staff not found']);
        }
        $user = User::find($staff->user_id);
        $staff->delete();
        $user->delete();
        return $this->sendResponse([], "Staff deleted successfully");
    }

    
    

}