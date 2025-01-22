<?php

namespace App\Http\Controllers\Api;

use App\Models\Institute;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\InstituteResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\StoreInstituteRequest;
use App\Http\Requests\UpdateInstituteRequest;
use App\Http\Controllers\Api\InstituteController;

class InstituteController extends BaseController
{
    /**
     * All Institutes.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Institute::query();

        if($request->query('search')){
            $searchTerm = $request->query('search');

            $query->where(function($query) use ($searchTerm){
                $query->where('institute_name', 'like', '%' . $searchTerm . '%');
            });
        }

        $institutes = $query->orderBy("id", "DESC")->paginate(5);

        return $this->sendResponse(["Institutes"=>InstituteResource::collection($institutes),
        'Pagination' => [
            'current_page' => $institutes->currentPage(),
            'last_page'=> $institutes->lastPage(),
            'per_page'=> $institutes->perPage(),
            'total'=> $institutes->total(),
        ]], "Department retrived successfully");

        
    }


    

 public function store(StoreInstituteRequest $request): JsonResponse
 {
    $institutes = new Institute();

    $institutes->institute_name = $request->input('institute_name');
    $institutes->contact_name = $request->input('contact_name');
    $institutes->contact_mobile = $request->input('contact_mobile');
    $institutes->street_address = $request->input('street_address');
    $institutes->area = $request->input('area');
    $institutes->city = $request->input('city');
    $institutes->state = $request->input('state');
    $institutes->pincode = $request->input('pincode');
    $institutes->country = $request->input('country');  
      if(!$institutes->save()){
        dd($institutes); 
        exit;
    }
    return $this->sendResponse(['Institutes' => new InstituteResource($institutes)], 'Institute Created Successfully');
 }

 public function show(string $id): JsonResponse
 {
      $institutes = Institute::find($id);
     
      if (!$institutes) {
         return $this->sendError("Institute not found", ['error' => 'Institute not found']);
     }
 
      return $this->sendResponse(new InstituteResource($institutes), "Institute retrieved successfully");
 }
 

 public function update(UpdateInstituteRequest $request, string $id): JsonResponse
 {
     // Find the Institute by ID
     $institute = Institute::find($id);
 
     // If the institute is not found, return an error
     if (!$institute) {
         return $this->sendError("Institute not found", ['error' => 'Institute not found']);
     }
 
     // Update the institute's name
     $institute->institute_name = $request->input('institute_name');
     $institute->contact_name = $request->input('contact_name');
     $institute->contact_mobile = $request->input('contact_mobile');
     $institute->street_address = $request->input('street_address');
     $institute->area = $request->input('area');
     $institute->city = $request->input('city');
     $institute->state = $request->input('state');
     $institute->pincode = $request->input('pincode');
     $institute->country = $request->input('country');
 
     // Save the updated institute record
     $institute->save();
 
     // Return the updated institute data
     return $this->sendResponse(
         ["Institute" => new InstituteResource($institute)], 
         "Institute Updated Successfully"
     );
 }
 

 public function destroy(string $id): JsonResponse
 {
    $institutes = Institute::find($id);
    if(!$institutes){
        return $this->sendError("Institutes not found", ['error'=>'Institutes not found']);
    }

    $institutes->delete();
    
    return $this->sendResponse([], "Institutes Deleted Successfully");

 }

 public function allInstitutes(): JsonResponse
 {
    $institutes = Institute::all();

    return $this->sendResponse(["Institutes"=>InstitutesResource::collection($institutes),], "Institutes retrieved successfully");

 }

}