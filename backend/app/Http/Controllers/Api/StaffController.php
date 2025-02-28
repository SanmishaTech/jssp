<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\StaffResource;
use App\Http\Controllers\Api\BaseController;
 
 
class StaffController extends BaseController
{

public function index(Request $request): JsonResponse
{
    // Get the institute ID from the logged-in user's staff details.
    $instituteId = Auth::user()->staff->institute_id;

    // Start the query by filtering staff based on the institute_id.
    $query = Staff::where('institute_id', $instituteId);

    // If there's a search term, apply additional filtering.
    if ($request->query('search')) {
        $searchTerm = $request->query('search');
        $query->where(function ($query) use ($searchTerm) {
            $query->where('staff_name', 'like', '%' . $searchTerm . '%');
        });
    }

    // Paginate the results.
    $staff = $query->paginate(15);

    // Return the paginated response with staff resources.
    return $this->sendResponse(
        [
            "Staff" => StaffResource::collection($staff),
            'Pagination' => [
                'current_page' => $staff->currentPage(),
                'last_page'    => $staff->lastPage(),
                'per_page'     => $staff->perPage(),
                'total'        => $staff->total(),
            ]
        ],
        "Staff retrieved successfully"
    );
}


    public function store(Request $request): JsonResponse
    {
        // Create a new user
        $active = 1;
        $user = new User();
        $user->name = $request->input('name'); // Ensure 'name' is passed in the request
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();
        
        // Assign the 'member' role
        $memberRole = Role::where("name", "member")->first();
        $user->assignRole($memberRole);
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $staff = new Staff();
        $staff->user_id = $user->id;
        $staff->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $staff->staff_name = $request->input('staff_name');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
        $staff->save();
        
        return $this->sendResponse([ "Staff" => new StaffResource($staff)], "Staff stored successfully");
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
 
        return $this->sendResponse([ "Staff" => new StaffResource($staff) ], "Staff retrived successfully");
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
        $user->name = $request->input('name', $user->name); // Use the existing name if not provided
        $user->email = $request->input('email');
        $user->active = $request->input('active', 1);
        $user->password = Hash::make($request->input('password'));
        $user->save();

         $memberRole = Role::where("name","member")->first();
        $user->assignRole($memberRole);
                       
        $staff->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $staff->staff_name = $request->input('staff_name');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
          $staff->save();
       
        return $this->sendResponse([ "Staff" => new StaffResource($staff)], "Staff updated successfully");

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


    public function allStaff(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $staff = Staff::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Staff" => StaffResource::collection($staff)],
            "Staff retrieved successfully"
        );
    }
    
    
    

}