<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\AssetCategory;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\BaseController;
use App\Http\Resources\AssetCategoryResource;

class AssetCategoryController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
         $instituteId = Auth::user()->staff->institute_id;
    
         $query = AssetCategory::where('institute_id', $instituteId);
    
          if ($request->query('search')) {
            $searchTerm = $request->query('search');
            $query->where(function ($query) use ($searchTerm) {
                $query->where('category_name', 'like', '%' . $searchTerm . '%');
            });
        }
 

    
          $category = $query->paginate(7);
    
         return $this->sendResponse(
            [
                "AssetCategories" => AssetCategoryResource::collection($category),
                'Pagination' => [
                    'current_page' => $category->currentPage(),
                    'last_page'    => $category->lastPage(),
                    'per_page'     => $category->perPage(),
                    'total'        => $category->total(),
                ]
            ],
            "AssetCategories retrieved successfully"
        );
    }


    public function store(Request $request): JsonResponse
    {
        
        
        // Create a new staff record and assign the institute_id from the logged-in admin
        $category = new AssetCategory();
        $category->institute_id = Auth::user()->staff->institute_id;  
        $category->category_name = $request->input('category_name');
        $category->save();
        
        return $this->sendResponse([ "AssetCategories" => new AssetCategoryResource($category)], "AssetCategories stored successfully");
    }


    public function show(string $id): JsonResponse
    {
        $category = AssetCategory::find($id);

        if(!$category){
            return $this->sendError("AssetCategories not found", ['error'=>'AssetCategories not found']);
        }

  
        return $this->sendResponse(["AssetCategories" => new AssetCategoryResource($category) ], "AssetCategories retrived successfully");
    }


    public function update(Request $request, string $id): JsonResponse
    {
 
        $category = AssetCategory::find($id);

        if(!$category){
            return $this->sendError("AssetCategories not found", ['error'=>'AssetCategories not found']);
        }
       
                       
        $category->institute_id = Auth::user()->staff->institute_id; // This will be 1 based on your admin login response
        $category->category_name = $request->input('category_name');
        $category->save();
       
        return $this->sendResponse([ "AssetCategories" => new AssetCategoryResource($category)], "AssetCategories updated successfully");

    }


    public function destroy(string $id): JsonResponse
    {
        $category = AssetCategory::find($id);
        if(!$category){
            return $this->sendError("AssetCategories not found", ['error'=> 'AssetCategories not found']);
        }
         $category->delete();
         return $this->sendResponse([], "AssetCategories deleted successfully");
    }

    public function allAssetCategories(): JsonResponse
    {
        // Get the institute ID from the logged-in user's staff details.
        $instituteId = Auth::user()->staff->institute_id;
    
        // Filter staff based on the institute_id.
        $category = AssetCategory::where('institute_id', $instituteId)->get();
    
        return $this->sendResponse(
            ["AssetCategories" => AssetCategoryResource::collection($category)],
            "AssetCategories retrieved successfully"
        );
    }
}
