<?php

namespace App\Http\Controllers\Api;

use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Http\Controllers\Api\BaseController;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use Illuminate\Validation\ValidationException;

   /**
     * @group Department Management
     */
    
class DepartmentController extends BaseController
{
    /**
     * All Departments.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Department::query();

        if ($request->query('search')) {
            $searchTerm = $request->query('search');
    
            $query->where(function ($query) use ($searchTerm) {
                $query->where('department_name', 'like', '%' . $searchTerm . '%');
            });
        }
        $departments = $query->orderBy("id", "DESC")->paginate(15);

        return $this->sendResponse(["Departments"=>DepartmentResource::collection($departments),
        'Pagination' => [
            'current_page' => $departments->currentPage(),
            'last_page' => $departments->lastPage(),
            'per_page' => $departments->perPage(),
            'total' => $departments->total(),
        ]], "Department retrived successfully");
        
    }

    /**
     * Store Department.
     * @bodyParam department_name string The name of the department.
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = new Department();
        $department->department_name = $request->input("department_name");
        if(!$department->save()) {
            dd($department); exit;
        }
        return $this->sendResponse(['Department'=> new DepartmentResource($department)], 'Department Created Successfully');
    }

    /**
     * Show Department.
     */
    public function show(string $id): JsonResponse
    {
        $department = Department::find($id);

        if(!$department){
            return $this->sendError("Department not found", ['error'=>['Department not found']]);
        }
        //  $project->load('users');
        return $this->sendResponse(["Department"=> new DepartmentResource($department)], "Department retrived successfully");
    }

    /**
     * Update Department.
     * @bodyParam department_name string The name of the department.
     */
    public function update(UpdateDepartmentRequest $request, string $id): JsonResponse
    {
        $department = Department::find($id);
        if(!$department){
            return $this->sendError("Department not found", ['error'=>['Department not found']]);
        }
        $department->department_name = $request->input('department_name');
        $department->save();
        return $this->sendResponse(["Department"=> new DepartmentResource($department)], "Department Updated successfully");

    }

    /**
     * Delete Department
     */
    public function destroy(string $id): JsonResponse
    {
        $department = Department::find($id);
        if(!$department){
            return $this->sendError("department not found", ['error'=>'department not found']);
        }

        $department->delete();

        return $this->sendResponse([], "department deleted successfully");
    }

    /**
     * Fetch All Departments.
     */
    public function allDepartments(): JsonResponse
    {
        $departments = Department::all();

        return $this->sendResponse(["Departments"=>DepartmentResource::collection($departments),
        ], "Departments retrieved successfully");

    }

   
}