<?php

namespace App\Http\Controllers\Api;

use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\VendorResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\VendorRequest;

class VendorController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Start the query by filtering staff based on the institute_id.
        $query = Vendor::where('institute_id', $instituteId);
    
        // If there's a search term, apply additional filtering.
        if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('vendor_name', 'like', '%' . $searchTerm . '%');
            });
        }
    
        // Paginate the results.
        $vendor = $query->paginate(7);
    
        // Return the paginated response with staff resources.
        return $this->sendResponse(
            [
                "Vendor" => VendorResource::collection($vendor),
                'Pagination' => [
                    'current_page' => $vendor->currentPage(),
                    'last_page'    => $vendor->lastPage(),
                    'per_page'     => $vendor->perPage(),
                    'total'        => $vendor->total(),
                ]
            ],
            "Vendor retrieved successfully"
        );
    }


    public function store(VendorRequest $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $vendor = new Vendor();
        $vendor->institute_id = Auth::user()->staff->institute_id;  
        $vendor->vendor_name = $request->input('vendor_name');
        $vendor->organization_name = $request->input('organization_name');
        $vendor->contact_name = $request->input('contact_name');
        $vendor->contact_number = $request->input('contact_number');
        $vendor->contact_email = $request->input('contact_email');
        $vendor->contact_address = $request->input('contact_address');
        $vendor->contact_city = $request->input('contact_city');
        $vendor->contact_state = $request->input('contact_state');
        $vendor->contact_pincode = $request->input('contact_pincode');
        $vendor->contact_country = $request->input('contact_country');
        $vendor->website = $request->input('website');
        $vendor->gst_number = $request->input('gst_number');
        $vendor->organization_pan_number = $request->input('organization_pan_number');
        $vendor->bank_name = $request->input('bank_name');
        $vendor->bank_account_holder_name = $request->input('bank_account_holder_name');
        $vendor->bank_account_number = $request->input('bank_account_number');
        $vendor->bank_ifsc_code = $request->input('bank_ifsc_code');
        $vendor->bank_branch = $request->input('bank_branch');
        $vendor->save();
        
        return $this->sendResponse([ "Vendor" => new VendorResource($vendor)], "Vendor stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $vendor = Vendor::find($id);

        if(!$vendor){
            return $this->sendError("Vendor not found", ['error'=>'Vendor not found']);
        }

  
        return $this->sendResponse(["Vendor" => new VendorResource($vendor) ], "Vendor retrived successfully");
    }


    public function update(VendorRequest $request, string $id): JsonResponse
    {
 
        $vendor = Vendor::find($id);

        if(!$vendor){
            return $this->sendError("Vendor not found", ['error'=>'Vendor not found']);
        }
       
                       
        $vendor->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $vendor->vendor_name = $request->input('vendor_name');
        $vendor->organization_name = $request->input('organization_name');
        $vendor->contact_name = $request->input('contact_name');
        $vendor->contact_number = $request->input('contact_number');
        $vendor->contact_email = $request->input('contact_email');
        $vendor->contact_address = $request->input('contact_address');
        $vendor->contact_city = $request->input('contact_city');
        $vendor->contact_state = $request->input('contact_state');
        $vendor->contact_pincode = $request->input('contact_pincode');
        $vendor->contact_country = $request->input('contact_country');
        $vendor->website = $request->input('website');
        $vendor->gst_number = $request->input('gst_number');
        $vendor->organization_pan_number = $request->input('organization_pan_number');
        $vendor->bank_name = $request->input('bank_name');
        $vendor->bank_account_holder_name = $request->input('bank_account_holder_name');
        $vendor->bank_account_number = $request->input('bank_account_number');
        $vendor->bank_ifsc_code = $request->input('bank_ifsc_code');
        $vendor->bank_branch = $request->input('bank_branch');
           $vendor->save();
       
        return $this->sendResponse([ "Vendor" => new VendorResource($vendor)], "Vendor updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $vendor = Vendor::find($id);
        if(!$vendor){
            return $this->sendError("Vendor not found", ['error'=> 'Vendor not found']);
        }
         $vendor->delete();
         return $this->sendResponse([], "Vendor deleted successfully");
    }

    public function allVendors(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $vendor = Vendor::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["Vendor" => VendorResource::collection($vendor)],
            "Vendor retrieved successfully"
        );
    }
}
