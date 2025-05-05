<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\AcademicYears;
use Illuminate\Http\JsonResponse;
 use Illuminate\Support\Facades\Auth;
use App\Http\Requests\AcademicYearRequest;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\AcademicYearResource;

class AcademicYearController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
         $instituteId = Auth::user()->staff->institute_id;
    
         $query = AcademicYears::where('institute_id', $instituteId);
    
          if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('academic_year', 'like', '%' . $searchTerm . '%');
            });
        }

           // Add date filter
           if ($request->query('date')) {
            $date = $request->query('date');
            $query->whereDate('created_at', $date);
        }

    
          $academicyear = $query->paginate(7);
    
         return $this->sendResponse(
            [
                "AcademicYears" => AcademicYearResource::collection($academicyear),
                'Pagination' => [
                    'current_page' => $academicyear->currentPage(),
                    'last_page'    => $academicyear->lastPage(),
                    'per_page'     => $academicyear->perPage(),
                    'total'        => $academicyear->total(),
                ]
            ],
            "AcademicYears retrieved successfully"
        );
    }


    public function store(AcademicYearRequest $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $academicyear = new AcademicYears();
        $academicyear->institute_id = Auth::user()->staff->institute_id;  
        $academicyear->academic_year = $request->input('academic_year');
        $academicyear->save();
        
        return $this->sendResponse([ "AcademicYears" => new AcademicYearResource($academicyear)], "AcademicYears stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $academicyear = AcademicYears::find($id);

        if(!$academicyear){
            return $this->sendError("AcademicYears not found", ['error'=>'AcademicYears not found']);
        }

  
        return $this->sendResponse(["AcademicYears" => new AcademicYearResource($academicyear) ], "AcademicYears retrived successfully");
    }


    public function update(AcademicYearRequest $request, string $id): JsonResponse
    {
 
        $academicyear = AcademicYears::find($id);

        if(!$academicyear){
            return $this->sendError("AcademicYears not found", ['error'=>'AcademicYears not found']);
        }
       
                       
        $academicyear->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $academicyear->academic_year = $request->input('academic_year');
        $academicyear->save();
       
        return $this->sendResponse([ "AcademicYears" => new AcademicYearResource($academicyear)], "AcademicYears updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $academicyear = AcademicYears::find($id);
        if(!$academicyear){
            return $this->sendError("AcademicYears not found", ['error'=> 'AcademicYears not found']);
        }
         $academicyear->delete();
         return $this->sendResponse([], "AcademicYears deleted successfully");
    }

    public function allAcademicYears(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $academicyear = AcademicYears::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["AcademicYears" => AcademicYearResource::collection($academicyear)],
            "AcademicYears retrieved successfully"
        );
    }
}
