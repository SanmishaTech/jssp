<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Staff;
use App\Models\StaffImage;
use App\Models\StaffEducation;
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
use Illuminate\Support\Facades\Log;

 
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
    return response()->json(
        [
            'status' => true,
            'message' => "Staff retrieved successfully",
            'data' => [
                "Staff" => StaffResource::collection($staff),
                'Pagination' => [
                    'current_page' => $staff->currentPage(),
                    'last_page'    => $staff->lastPage(),
                    'per_page'     => $staff->perPage(),
                    'total'        => $staff->total(),
                ]
            ]
        ]
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
        $staff->employee_code = $request->input('employee_code');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
        
        $staff->gender = $request->input('gender');
        $staff->experience = $request->input('experience');
        $staff->highest_qualification = $request->input('highest_qualification');
        $staff->pan_number = $request->input('pan_number');
        $staff->aadhaar_number = $request->input('aadhaar_number');
        $staff->appointment_date = $request->input('appointment_date');
        $staff->nature_of_appointment = $request->input('nature_of_appointment');
        $staff->subject_type = $request->input('subject_type');
        $staff->mode_of_payment = $request->input('mode_of_payment');
        $staff->bank_name = $request->input('bank_name');
        $staff->account_number = $request->input('account_number');
        $staff->ifsc_code = $request->input('ifsc_code');
        $staff->salary = $request->input('salary');
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
        
        // Handle education details
        if ($request->has('education') && is_array($request->input('education'))) {
            foreach ($request->input('education') as $educationData) {
                StaffEducation::create([
                    'staff_id' => $staff->id,
                    'qualification' => $educationData['qualification'],
                    'college_name' => $educationData['college_name'],
                    'board_university' => $educationData['board_university'],
                    'passing_year' => $educationData['passing_year'],
                    'percentage' => $educationData['percentage'],
                ]);
            }
        }
        
        return response()->json([
            'status' => true,
            'message' => "Staff stored successfully",
            'data' => [ "Staff" => new StaffResource($staff)]
        ]);
    }
    

    /**
     * Show Staff.
     */
    public function show(string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if(!$staff){
            return response()->json([
                'status' => false,
                'message' => "Staff not found",
                'errors' => ['error'=>'Staff not found']
            ], 404);
        }

        $user = User::find($staff->user_id);
 
        return response()->json([
            'status' => true,
            'message' => "Staff retrieved successfully",
            'data' => [ "Staff" => new StaffResource($staff) ]
        ]);
    }

    /**
     * Update Staff.
     */
    public function update(StaffRequest $request, string $id): JsonResponse
    {
        $staff = Staff::find($id);

        if(!$staff){
            return response()->json([
                'status' => false,
                'message' => "Staff not found",
                'errors' => ['error'=>'Staff not found']
            ], 404);
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
        $staff->employee_code = $request->input('employee_code');
        $staff->is_teaching = $request->input('is_teaching');
        $staff->date_of_birth = $request->input('date_of_birth');
        $staff->address = $request->input('address');
        $staff->email = $request->input('email');
        $staff->mobile = $request->input('mobile');
        $staff->gender = $request->input('gender');
        $staff->experience = $request->input('experience');
        $staff->highest_qualification = $request->input('highest_qualification');
        $staff->pan_number = $request->input('pan_number');
        $staff->aadhaar_number = $request->input('aadhaar_number');
        $staff->appointment_date = $request->input('appointment_date');
        $staff->nature_of_appointment = $request->input('nature_of_appointment');
        $staff->subject_type = $request->input('subject_type');
        $staff->mode_of_payment = $request->input('mode_of_payment');
        $staff->bank_name = $request->input('bank_name');
        $staff->account_number = $request->input('account_number');
        $staff->ifsc_code = $request->input('ifsc_code');
        $staff->salary = $request->input('salary');
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
        
        // Handle education details
        // First, delete existing education records if specified
        if ($request->input('delete_existing_education') === 'true') {
            Log::info('Deleting all existing education records for staff ID: ' . $staff->id);
            $staff->education()->delete();
        } 
        // Or delete specific education records
        elseif ($request->has('deleted_education_ids')) {
            $deletedEduIds = json_decode($request->input('deleted_education_ids'), true);
            Log::info('Deleting specific education records: ', $deletedEduIds);
            if (is_array($deletedEduIds) && count($deletedEduIds) > 0) {
                StaffEducation::whereIn('id', $deletedEduIds)->delete();
            }
        }
        
        // Add/update education details
        if ($request->has('education')) {
            Log::info('Education data received in request: ' . $request->input('education'));
            
            // Decode JSON string if it's a string
            $educationData = $request->input('education');
            if (is_string($educationData)) {
                $educationData = json_decode($educationData, true);
                Log::info('Decoded education data: ', $educationData ?: []);
            }
            
            if (is_array($educationData) && count($educationData) > 0) {
                foreach ($educationData as $eduItem) {
                    // If ID exists, update the record
                    if (isset($eduItem['id']) && $eduItem['id']) {
                        $education = StaffEducation::find($eduItem['id']);
                        if ($education && $education->staff_id == $staff->id) {
                            Log::info('Updating education record ID: ' . $eduItem['id']);
                            $education->update([
                                'qualification' => $eduItem['qualification'],
                                'college_name' => $eduItem['college_name'],
                                'board_university' => $eduItem['board_university'],
                                'passing_year' => $eduItem['passing_year'],
                                'percentage' => $eduItem['percentage'],
                            ]);
                        }
                    } else {
                        // Create a new record
                        Log::info('Creating new education record for staff ID: ' . $staff->id);
                        Log::info('Education data: ', $eduItem);
                        StaffEducation::create([
                            'staff_id' => $staff->id,
                            'qualification' => $eduItem['qualification'],
                            'college_name' => $eduItem['college_name'],
                            'board_university' => $eduItem['board_university'],
                            'passing_year' => $eduItem['passing_year'],
                            'percentage' => $eduItem['percentage'],
                        ]);
                    }
                }
            } else {
                Log::warning('Education data is empty or not an array');
            }
        } else {
            Log::info('No education data in request for staff ID: ' . $staff->id);
        }
       
        return response()->json([
            'status' => true,
            'message' => "Staff updated successfully",
            'data' => [ "Staff" => new StaffResource($staff)]
        ]);
    }

    /**
     * Remove Staff.
     */
    public function destroy(string $id): JsonResponse
    {
        $staff = Staff::find($id);
        if(!$staff){
            return response()->json([
                'status' => false,
                'message' => "Staff not found",
                'errors' => ['error'=> 'Staff not found']
            ], 404);
        }

        // Delete associated images
        foreach ($staff->images as $image) {
            // Delete the file from storage using the correct path
            Storage::disk('public')->delete('staff_images/'.$image->image_path);
            $image->delete();
        }

        // Delete associated education records
        $staff->education()->delete();

        $user = User::find($staff->user_id);
        $staff->delete();
        $user->delete();
        return response()->json([
            'status' => true,
            'message' => "Staff deleted successfully",
            'data' => []
        ]);
    }

    public function displayDocuments(string $document){
        // Generate the full path to the file in the public storage
        $path = storage_path('app/public/staff_images/'.$document);
        
        // Log for debugging
        Log::info('Staff image requested: ' . $document);
        Log::info('Path being checked: ' . $path);
        Log::info('File exists: ' . (file_exists($path) ? 'Yes' : 'No'));
    
        // Check if the file exists
        if (!file_exists($path)) {
            // Try alternative path
            $alternatePath = storage_path('app/public/events/'.$document);
            Log::info('Trying alternate path: ' . $alternatePath);
            Log::info('File exists at alternate path: ' . (file_exists($alternatePath) ? 'Yes' : 'No'));
            
            if (file_exists($alternatePath)) {
                $path = $alternatePath;
            } else {
                return response()->json([
                    'status' => false,
                    'message' => "Document not found",
                    'errors' => ['error'=>['Document not found.']]
                ], 404);
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
    
        return response()->json([
            'status' => true,
            'message' => "Staff retrieved successfully",
            'data' => ["Staff" => StaffResource::collection($staff)]
        ]);
    }
}