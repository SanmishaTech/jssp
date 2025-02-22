<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
 use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\BaseController;
 
class SuperAdminController extends BaseController
{
    /**
     * Display all Super Admin Staffs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Staff::whereHas('user', function ($q) {
            $q->whereHas('roles', function ($rq) {
                $rq->where('name', 'superadmin');
            });
        });

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where('staff_name', 'like', "%$searchTerm%");
        }
        
        $staff = $query->paginate(15);

        return $this->sendResponse([
            'Staff' => StaffResource::collection($staff),
            'pagination' => [
                'current_page' => $staff->currentPage(),
                'last_page' => $staff->lastPage(),
                'per_page' => $staff->perPage(),
                'total' => $staff->total(),
            ]
        ], "Staff retrieved successfully");
    }

    /**
     * Store a new Super Admin Staff.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'contact_number' => 'required|string|max:15',
        ]);

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'active' => 1,
        ]);

        $role = Role::where('name', 'superadmin')->firstOrFail();
        $user->assignRole($role);

        $staff = Staff::create([
            'user_id' => $user->id,
             'email' => $request->email,
            'contact_number' => $request->contact_number,
        ]);

        return $this->sendResponse(['Staff' => new StaffResource($staff)], "Staff stored successfully");
    }

    /**
     * Show a Super Admin Staff.
     */
    public function show(string $id): JsonResponse
    {
        $staff = Staff::findOrFail($id);
        return $this->sendResponse(['Staff' => new StaffResource($staff)], "Staff retrieved successfully");
    }

    /**
     * Update a Super Admin Staff.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
             'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'contact_number' => 'sometimes|string|max:15',
        ]);

        $staff = Staff::findOrFail($id);
        $user = User::findOrFail($staff->user_id);
        
        $user->update([
             'email' => $request->email ?? $user->email,
            'password' => $request->filled('password') ? Hash::make($request->password) : $user->password,
        ]);

        $staff->update([
             'email' => $request->email ?? $staff->email,
            'contact_number' => $request->contact_number ?? $staff->contact_number,
        ]);

        return $this->sendResponse(['Staff' => new StaffResource($staff)], "Staff updated successfully");
    }

    /**
     * Delete a Super Admin Staff.
     */
    public function destroy(string $id): JsonResponse
    {
        $staff = Staff::findOrFail($id);
        $user = User::findOrFail($staff->user_id);
        
        $staff->delete();
        $user->delete();
        
        return $this->sendResponse([], "Staff deleted successfully");
    }
}