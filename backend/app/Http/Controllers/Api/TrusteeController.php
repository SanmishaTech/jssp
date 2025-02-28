<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
 use App\Models\Trustee;
use App\Models\Staff;
 use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
 use App\Http\Resources\TrusteeResource;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\TrusteeRequest;
use App\Http\Resources\StaffResource;
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

    public function store(TrusteeRequest $request): JsonResponse
    {
        $active = 1;
        $user = new User();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();
    
        $memberRole = Role::where("name", "superadmin")->first();
        $user->assignRole($memberRole);
        
        $trustees = new Trustee();
        $trustees->trustee_name = $request->input('trustee_name');
        $trustees->designation = $request->input('designation');
         $trustees->contact_mobile = $request->input('contact_mobile');
        $trustees->address = $request->input('address');
        
        $trustees->user_id = $user->id;

     
        if (!$trustees->save()) {
            return response()->json(['error' => 'Trustee creation failed'], 500);
        }

        $staff = new Staff();
        $staff->user_id = $user->id;
         $staff->email = $request->input('email');
         
        $staff->save();
  
        $staff->save();
    
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



    public function update(TrusteeRequest $request, string $id): JsonResponse
    {
         $trustees = Trustee::find($id);
    
        // If the institute is not found, return an error
        if (!$trustees) {
            return $this->sendError("Trustees not found", ['error' => 'Trustees not found']);
        }
    
        // Find the related User and Staff
        $user = User::find($trustees->user_id);
        $staff = Staff::where('user_id', $trustees->user_id)->first();
    
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
        $trustees->trustee_name = $request->input('trustee_name', $trustees->trustee_name);
        $trustees->designation = $request->input('designation', $trustees->designation);
         $trustees->contact_mobile = $request->input('contact_mobile', $trustees->contact_mobile);
        $trustees->address = $request->input('address', $trustees->address);
         $trustees->save();
    
        // Return the updated Institute data
        return $this->sendResponse(
            [
                "Trustee" => new TrusteeResource($trustees),
                "User" => new UserResource($user),
                "Staff" => new StaffResource($staff),
            ],
            "Trustee, User, and Staff Updated Successfully"
        );
    }


    public function destroy(string $id): JsonResponse
{
    $trustee = Trustee::find($id);
    if (!$trustee) {
        return $this->sendError("Trustee not found", ['error' => 'Trustee not found']);
    }

    // Retrieve associated User and Staff records
    $user = User::find($trustee->user_id);
    $staff = Staff::where('user_id', $trustee->user_id)->first();

    // Delete the Trustee record
    $trustee->delete();

    // Delete the associated User and Staff records if they exist
    if ($user) {
        $user->delete();
    }
    if ($staff) {
        $staff->delete();
    }

    return $this->sendResponse([], "Trustee, User, and Staff Deleted Successfully");
}


}