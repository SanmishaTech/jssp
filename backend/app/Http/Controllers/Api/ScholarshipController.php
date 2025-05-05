<?php

namespace App\Http\Controllers\Api;

use App\Models\Scholarship;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ScholarshipResource;
use App\Http\Controllers\Api\BaseController;

class ScholarshipController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $instituteId = Auth::user()->staff->institute_id;

        $query = Scholarship::where('institute_id', $instituteId);

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('students_applied_for_scholarship', 'like', '%' . $searchTerm . '%');
            });
        }

        // Add date filter
        if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

        $scholarship = $query->paginate(7);

        return $this->sendResponse(
            [
                "Scholarship" => ScholarshipResource::collection($scholarship),
                'Pagination' => [
                    'current_page' => $scholarship->currentPage(),
                    'last_page'    => $scholarship->lastPage(),
                    'per_page'     => $scholarship->perPage(),
                    'total'        => $scholarship->total(),
                ]
            ],
            "Scholarship retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $scholarship = new Scholarship();
        $scholarship->institute_id = Auth::user()->staff->institute_id;  
        $scholarship->course_id = $request->input('course_id');
        $scholarship->academic_years_id = $request->input('academic_years_id');
        $scholarship->students_applied_for_scholarship = $request->input('students_applied_for_scholarship');
        $scholarship->approved_from_university = $request->input('approved_from_university');
        $scholarship->first_installment_date = $request->input('first_installment_date');
        $scholarship->first_installment_student = $request->input('first_installment_student');
        $scholarship->first_installment_amount = $request->input('first_installment_amount');
        $scholarship->second_installment_date = $request->input('second_installment_date');
        $scholarship->second_installment_student = $request->input('second_installment_student');
        $scholarship->second_installment_amount = $request->input('second_installment_amount');
        $scholarship->third_installment_date = $request->input('third_installment_date');
        $scholarship->third_installment_student = $request->input('third_installment_student');
        $scholarship->third_installment_amount = $request->input('third_installment_amount');
        $scholarship->save();
        
        return $this->sendResponse([ "Scholarship" => new ScholarshipResource($scholarship)], "Scholarship stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $scholarship = Scholarship::find($id);

        if(!$scholarship){
            return $this->sendError("Scholarship not found", ['error'=>'Scholarship not found']);
        }

  
        return $this->sendResponse(["Scholarship" => new ScholarshipResource($scholarship) ], "Scholarship retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $scholarship = Scholarship::find($id);

        if(!$scholarship){
            return $this->sendError("Scholarship not found", ['error'=>'Scholarship not found']);
        }
       
                       
        $scholarship->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $scholarship->course_id = $request->input('course_id');
        $scholarship->academic_years_id = $request->input('academic_years_id');
        $scholarship->students_applied_for_scholarship = $request->input('students_applied_for_scholarship');
        $scholarship->approved_from_university = $request->input('approved_from_university');
        $scholarship->first_installment_date = $request->input('first_installment_date');
        $scholarship->first_installment_student = $request->input('first_installment_student');
        $scholarship->first_installment_amount = $request->input('first_installment_amount');
        $scholarship->second_installment_date = $request->input('second_installment_date');
        $scholarship->second_installment_student = $request->input('second_installment_student');
        $scholarship->second_installment_amount = $request->input('second_installment_amount');
        $scholarship->third_installment_date = $request->input('third_installment_date');
        $scholarship->third_installment_student = $request->input('third_installment_student');
        $scholarship->third_installment_amount = $request->input('third_installment_amount');
        $scholarship->save();
       
        return $this->sendResponse([ "Scholarship" => new ScholarshipResource($scholarship)], "Scholarship updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $scholarship = Scholarship::find($id);
        if(!$scholarship){
            return $this->sendError("Scholarship not found", ['error'=> 'Scholarship not found']);
        }
         $scholarship->delete();
         return $this->sendResponse([], "Scholarship deleted successfully");
    }

    public function allScholarship(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $scholarship = Scholarship::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Scholarship" => ScholarshipResource::collection($scholarship)],
            "Scholarship retrieved successfully"
        );
    }
}