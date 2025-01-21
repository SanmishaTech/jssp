<?php

namespace App\Http\Controllers\Api;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierResource;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\UpdateSupplierRequest;

 /**
     * @group Supplier Management.
    */
 
class SuppliersController extends BaseController
{
    /**
     * All Suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::query();

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
    
            $query->where(function ($query) use ($searchTerm) {
                $query->where('supplier', 'like', '%' . $searchTerm . '%');
            });
        }

        $suppliers = $query->paginate(5);

       


        return $this->sendResponse(["Suppliers"=>SupplierResource::collection($suppliers),
        'pagination' => [
            'current_page' => $suppliers->currentPage(),
            'last_page' => $suppliers->lastPage(),
            'per_page' => $suppliers->perPage(),
            'total' => $suppliers->total(),
        ]], "Suppliers retrived successfully");
        
    }

    /**
     * Store Supplier.
     * @bodyParam supplier sting The name of the Supplier.
     * @bodyParam street_address string The street address of the Supplier.
     * @bodyParam area string The area of the Supplier.
     * @bodyParam city string The city of the Supplier.
     * @bodyParam state string The state of the Supplier.
     * @bodyParam pincode string The pincode of the Supplier.
     * @bodyParam country string The country of the Supplier.
     * @bodyParam gstin string The gstin of the Supplier.
     * @bodyParam contact_name string The contact number of the Supplier.
     * @bodyParam department string The department of the Supplier.
     * @bodyParam designation string The designation of the Supplier.
     * @bodyParam mobile_1 string The mobile 1 of the Supplier.
     * @bodyParam mobile_2 string The mobile 2 of the Supplier.
     * @bodyParam email string The email of the Supplier.
     */
    public function store(StoreSupplierRequest $request): JsonResponse
    {
        $suppliers = new Supplier();
        $suppliers->supplier = $request->input("supplier");
        $suppliers->street_address = $request->input("street_address");
        $suppliers->area = $request->input("area");
        $suppliers->city = $request->input("city");
        $suppliers->state = $request->input("state");
        $suppliers->pincode = $request->input("pincode");
        $suppliers->country = $request->input("country");
        $suppliers->gstin = $request->input("gstin");
        $suppliers->contact_name = $request->input("contact_name");
        $suppliers->department = $request->input("department");
        $suppliers->designation = $request->input("designation");
        $suppliers->mobile_1 = $request->input("mobile_1");
        $suppliers->mobile_2 = $request->input("mobile_2");
        $suppliers->email = $request->input("email"); 
        $suppliers->save();

        return $this->sendResponse(["Suppliers"=> new SupplierResource($suppliers)], 'Supplier Stored Successfully');

    }

    /**
     * Show Suppliers.
     */
    public function show(string $id): JsonResponse
    {
        $suppliers = Supplier::find($id);
        if(!$suppliers){
            return $this->sendError("Suppliers not found", ['error'=>'Suppliers not found']);
        }
        
        return $this->sendResponse(["Supplier"=> new SupplierResource($suppliers)], 'Supplier retrived Successfully');
    }

    /**
     * Update Suppliers.   
     * @bodyParam supplier sting The name of the Supplier.
     * @bodyParam street_address string The street address of the Supplier.
     * @bodyParam area string The area of the Supplier.
     * @bodyParam city string The city of the Supplier.
     * @bodyParam state string The state of the Supplier.
     * @bodyParam pincode string The pincode of the Supplier.
     * @bodyParam country string The country of the Supplier.
     * @bodyParam gstin string The gstin of the Supplier.
     * @bodyParam contact_name string The contact number of the Supplier.
     * @bodyParam department string The department of the Supplier.
     * @bodyParam designation string The designation of the Supplier.
     * @bodyParam mobile_1 string The mobile 1 of the Supplier.
     * @bodyParam mobile_2 string The mobile 2 of the Supplier.
     * @bodyParam email string The email of the Supplier.
     */
    public function update(UpdateSupplierRequest $request, string $id): JsonResponse
    {
        // Find the existing supplier
        $suppliers = Supplier::find($id);
    
        if (!$suppliers) {
            return $this->sendError("Supplier not found", ['error' => 'Supplier not found']);
        }
    
        // Update the supplier properties
        $suppliers->supplier = $request->input("supplier");
        $suppliers->street_address = $request->input("street_address");
        $suppliers->area = $request->input("area");
        $suppliers->city = $request->input("city");
        $suppliers->state = $request->input("state");
        $suppliers->pincode = $request->input("pincode");
        $suppliers->country = $request->input("country");
        $suppliers->gstin = $request->input("gstin");
        $suppliers->contact_name = $request->input("contact_name");
        $suppliers->department = $request->input("department");
        $suppliers->designation = $request->input("designation");
        $suppliers->mobile_1 = $request->input("mobile_1");
        $suppliers->mobile_2 = $request->input("mobile_2");
        $suppliers->email = $request->input("email");
    
        // Save the updated supplier
        $suppliers->save();
    
        return $this->sendResponse(["Supplier" => new SupplierResource($suppliers)], 'Supplier Updated Successfully');
    }
    
    /**
     * Destroy Suppliers.
     */
    public function destroy(string $id): JsonResponse
    {
        $suppliers = Supplier::find($id);
        if(!$suppliers){
            return $this->sendError("Supplier not found", ['error'=>'Supplier not found']);
        }
        $suppliers->delete();
        return $this->sendResponse([], 'Supplier Deleted Successfully');

    }

     /**
     * Fetch All Suppliers.
     */
    public function allSuppliers(): JsonResponse
    {
        $suppliers = Supplier::all();

        return $this->sendResponse(["Suppliers"=>SupplierResource::collection($suppliers),
        ], "Suppliers retrived successfully");

    }
    
}