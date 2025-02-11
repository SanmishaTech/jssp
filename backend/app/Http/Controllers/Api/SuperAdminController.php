<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\Profile;
use Spatie\Permission\Models\Role;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\UserResource;

class SuperAdminController extends BaseController
{
    /**
     * Display all Super Admin Profiles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Profile::whereHas('user', function ($q) {
            $q->whereHas('roles', function ($rq) {
                $rq->where('name', 'superadmin');
            });
        });

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where('profile_name', 'like', "%$searchTerm%");
        }
        
        $profiles = $query->paginate(15);

        return $this->sendResponse([
            'Profiles' => ProfileResource::collection($profiles),
            'pagination' => [
                'current_page' => $profiles->currentPage(),
                'last_page' => $profiles->lastPage(),
                'per_page' => $profiles->perPage(),
                'total' => $profiles->total(),
            ]
        ], "Profiles retrieved successfully");
    }

    /**
     * Store a new Super Admin Profile.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'profile_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'contact_number' => 'required|string|max:15',
        ]);

        $user = User::create([
            'name' => $request->profile_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'active' => 1,
        ]);

        $role = Role::where('name', 'superadmin')->firstOrFail();
        $user->assignRole($role);

        $profile = Profile::create([
            'user_id' => $user->id,
            'profile_name' => $request->profile_name,
            'email' => $request->email,
            'contact_number' => $request->contact_number,
        ]);

        return $this->sendResponse(['Profile' => new ProfileResource($profile)], "Profile stored successfully");
    }

    /**
     * Show a Super Admin Profile.
     */
    public function show(string $id): JsonResponse
    {
        $profile = Profile::findOrFail($id);
        return $this->sendResponse(['Profile' => new ProfileResource($profile)], "Profile retrieved successfully");
    }

    /**
     * Update a Super Admin Profile.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'profile_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:6',
            'contact_number' => 'sometimes|string|max:15',
        ]);

        $profile = Profile::findOrFail($id);
        $user = User::findOrFail($profile->user_id);
        
        $user->update([
            'name' => $request->profile_name ?? $user->name,
            'email' => $request->email ?? $user->email,
            'password' => $request->filled('password') ? Hash::make($request->password) : $user->password,
        ]);

        $profile->update([
            'profile_name' => $request->profile_name ?? $profile->profile_name,
            'email' => $request->email ?? $profile->email,
            'contact_number' => $request->contact_number ?? $profile->contact_number,
        ]);

        return $this->sendResponse(['Profile' => new ProfileResource($profile)], "Profile updated successfully");
    }

    /**
     * Delete a Super Admin Profile.
     */
    public function destroy(string $id): JsonResponse
    {
        $profile = Profile::findOrFail($id);
        $user = User::findOrFail($profile->user_id);
        
        $profile->delete();
        $user->delete();
        
        return $this->sendResponse([], "Profile deleted successfully");
    }
}