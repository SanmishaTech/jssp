<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\StaffEducation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\StaffEducationResource;
use App\Http\Controllers\Api\BaseController;

class StaffEducationController extends BaseController
{
   
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $staffId = Auth::user()->staff->id;
    
        // Start the query by filtering staff based on the institute_id and paginating the results.
        $education = StaffEducation::where('staff_id', $staffId)->paginate(9);

        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "StaffEducation" => StaffEducationResource::collection($education),
                'Pagination' => [
                    'current_page' => $education->currentPage(),
                    'last_page'    => $education->lastPage(),
                    'per_page'     => $education->perPage(),
                    'total'        => $education->total(),
                ]
            ],
            "StaffEducation retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        // Validate input including optional certificate file
        $request->validate([
            'qualification'     => 'nullable|string|max:255',
            'college_name'      => 'nullable|string|max:255',
            'board_university'  => 'nullable|string|max:255',
            'passing_year'      => 'nullable|digits:4',
            'percentage'        => 'nullable|numeric',
            'certificate'       => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048'
        ]);

        // Create a new education record
        $education = new StaffEducation();
        $education->staff_id        = Auth::user()->staff->id;  
        $education->qualification   = $request->input('qualification');
        $education->college_name    = $request->input('college_name');
        $education->board_university= $request->input('board_university');
        $education->passing_year    = $request->input('passing_year');
        $education->percentage      = $request->input('percentage');

        // Handle certificate upload (optional)
        if ($request->hasFile('certificate')) {
            $file        = $request->file('certificate');
            $original    = $file->getClientOriginalName();
            $uniqueName  = time().'_'.$original;

            // Ensure dir exists
            \Storage::disk('public')->makeDirectory('staff_education_certificates', 0755, true, true);

            $file->storeAs('staff_education_certificates', $uniqueName, 'public');

            $education->certificate_path = $uniqueName;
        }

        $education->save();

        return $this->sendResponse([ "StaffEducation" => new StaffEducationResource($education)], "StaffEducation stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $education = StaffEducation::find($id);

        if(!$education){
            return $this->sendError("StaffEducation not found", ['error'=>'StaffEducation not found']);
        }

  
        return $this->sendResponse(["StaffEducation" => new StaffEducationResource($education) ], "StaffEducation retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
        $education = StaffEducation::find($id);

        if(!$education){
            return $this->sendError("StaffEducation not found", ['error'=>'StaffEducation not found']);
        }

        // Validate
        $request->validate([
            'qualification'     => 'nullable|string|max:255',
            'college_name'      => 'nullable|string|max:255',
            'board_university'  => 'nullable|string|max:255',
            'passing_year'      => 'nullable|digits:4',
            'percentage'        => 'nullable|numeric',
            'certificate'       => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:2048',
            'delete_certificate'=> 'nullable|boolean'
        ]);

        $education->staff_id        = Auth::user()->staff->id;
        $education->qualification   = $request->input('qualification');
        $education->college_name    = $request->input('college_name');
        $education->board_university= $request->input('board_university');
        $education->passing_year    = $request->input('passing_year');
        $education->percentage      = $request->input('percentage');

        // Handle delete request for existing certificate
        if ($request->boolean('delete_certificate') && $education->certificate_path) {
            if (\Storage::disk('public')->exists('staff_education_certificates/'.$education->certificate_path)) {
                \Storage::disk('public')->delete('staff_education_certificates/'.$education->certificate_path);
            }
            $education->certificate_path = null;
        }

        // Handle new certificate upload
        if ($request->hasFile('certificate')) {
            // Remove old certificate first
            if ($education->certificate_path && \Storage::disk('public')->exists('staff_education_certificates/'.$education->certificate_path)) {
                \Storage::disk('public')->delete('staff_education_certificates/'.$education->certificate_path);
            }

            $file       = $request->file('certificate');
            $original   = $file->getClientOriginalName();
            $uniqueName = time().'_'.$original;

            \Storage::disk('public')->makeDirectory('staff_education_certificates', 0755, true, true);
            $file->storeAs('staff_education_certificates', $uniqueName, 'public');

            $education->certificate_path = $uniqueName;
        }

        $education->save();

        return $this->sendResponse(["StaffEducation" => new StaffEducationResource($education)], "StaffEducation updated successfully");
    }


    public function destroy(string $id): JsonResponse
    {
        $education = StaffEducation::find($id);
        if(!$education){
            return $this->sendError("StaffEducation not found", ['error'=> 'StaffEducation not found']);
        }
         $education->delete();
         return $this->sendResponse([], "StaffEducation deleted successfully");
    }

    public function allStaffEducations(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $staffId = Auth::user()->staff->id;
    
        // Filter staff based on the institute_id.
        $education = StaffEducation::where('staff_id', $staffId)->get();
    
        return $this->sendResponse(
            ["StaffEducation" => StaffEducationResource::collection($education)],
            "StaffEducation retrieved successfully"
        );
    }
}
