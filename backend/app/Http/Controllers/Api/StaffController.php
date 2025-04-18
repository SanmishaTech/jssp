<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Staff;
use App\Models\StaffImage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;
use App\Http\Requests\StaffRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\StaffResource;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Api\BaseController;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

 
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
    $staff = $query->paginate(7);

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


    public function store(StaffRequest $request): JsonResponse
    {
        // Create a new user
        $active = 1;
        $user = new User();
        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->active = $active;
        $user->password = Hash::make($request->input('password'));
        $user->save();
        
        // Assign the 'member' role
        $memberRole = Role::where("name", "member")->first();
        $user->assignRole($memberRole);
        
        // Create a new staff record
        $staff = new Staff();
        $staff->user_id = $user->id;
        $staff->institute_id = Auth::user()->staff->institute_id;
        $staff->staff_name = $request->input('staff_name');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
        $staff->save();

        // Handle multiple image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Get original filename
                $originalName = $image->getClientOriginalName();
                
                // Store the image in the staff_images directory
                $path = $image->storeAs('staff_images', $originalName, 'public');
                
                // Store only the filename in the database, not the full path
                StaffImage::create([
                    'staff_id' => $staff->id,
                    'image_path' => $originalName
                ]);
            }
        }
        
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
    public function update(StaffRequest $request, string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if(!$staff){
            return $this->sendError("Staff not found", ['error'=>'Staff not found']);
        }

        $user = User::find($staff->user_id);
        $user->name = $request->input('name', $user->name);
        $user->email = $request->input('email');
        $user->active = $request->input('active', 1);
        if ($request->has('password')) {
            $user->password = Hash::make($request->input('password'));
        }
        $user->save();

        $memberRole = Role::where("name","member")->first();
        $user->assignRole($memberRole);
                       
        $staff->institute_id = Auth::user()->staff->institute_id;
        $staff->staff_name = $request->input('staff_name');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
        $staff->save();

        // Handle image uploads and deletions
        // Case 1: Delete all existing images if requested
        if ($request->input('delete_existing_images') === 'true') {
            foreach ($staff->images as $image) {
                // Delete the file from storage using the correct path
                Storage::disk('public')->delete('staff_images/'.$image->image_path);
                $image->delete();
            }
        } 
        // Case 2: Delete only specific images by ID
        elseif ($request->has('deleted_image_ids')) {
            $deletedImageIds = json_decode($request->input('deleted_image_ids'), true);
            if (is_array($deletedImageIds) && count($deletedImageIds) > 0) {
                foreach ($staff->images as $image) {
                    if (in_array($image->id, $deletedImageIds)) {
                        // Delete the file from storage using the correct path
                        Storage::disk('public')->delete('staff_images/'.$image->image_path);
                        $image->delete();
                    }
                }
            }
        }

        // Add new images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Get original filename
                $originalName = $image->getClientOriginalName();
                
                // Store the image in the staff_images directory
                $path = $image->storeAs('staff_images', $originalName, 'public');
                
                // Store only the filename in the database, not the full path
                StaffImage::create([
                    'staff_id' => $staff->id,
                    'image_path' => $originalName
                ]);
            }
        }
       
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

        // Delete associated images
        foreach ($staff->images as $image) {
            // Delete the file from storage using the correct path
            Storage::disk('public')->delete('staff_images/'.$image->image_path);
            $image->delete();
        }

        $user = User::find($staff->user_id);
        $staff->delete();
        $user->delete();
        return $this->sendResponse([], "Staff deleted successfully");
    }

    public function displayDocuments(string $document){
        // Generate the full path to the file in the public storage
        $path = storage_path('app/public/staff_images/'.$document);
        
        // Log for debugging
        \Log::info('Staff image requested: ' . $document);
        \Log::info('Path being checked: ' . $path);
        \Log::info('File exists: ' . (file_exists($path) ? 'Yes' : 'No'));
    
        // Check if the file exists
        if (!file_exists($path)) {
            // Try alternative path
            $alternatePath = storage_path('app/public/events/'.$document);
            \Log::info('Trying alternate path: ' . $alternatePath);
            \Log::info('File exists at alternate path: ' . (file_exists($alternatePath) ? 'Yes' : 'No'));
            
            if (file_exists($alternatePath)) {
                $path = $alternatePath;
            } else {
                return $this->sendError("Document not found", ['error'=>['Document not found.']]);
            }
        }
    
        // Get the file content and MIME type
        $fileContent = File::get($path);
        $mimeType = File::mimeType($path);
    
        // Create the response for the file download
        $response = Response::make($fileContent, 200);
        $response->header("Content-Type", $mimeType);
        $response->header('Content-Disposition', 'inline; filename="' . $document . '"'); // Set to inline for viewing
        return $response;
    }

    public function allStaffs(): JsonResponse
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