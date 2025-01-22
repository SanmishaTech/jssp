<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LeadsController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\ClientsController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ContactsController;
use App\Http\Controllers\Api\InvoicesController;
use App\Http\Controllers\Api\ProductsController;
use App\Http\Controllers\Api\EmployeesController;
use App\Http\Controllers\Api\FollowUpsController;
use App\Http\Controllers\Api\InstituteController;
use App\Http\Controllers\Api\PurchasesController;
use App\Http\Controllers\Api\SuppliersController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ProductCategoriesController;



Route::post('/login', [UserController::class, 'login']);


Route::group(['middleware'=>['auth:sanctum', 'permission','request.null']], function(){
   
   Route::resource('institutes', InstituteController::class);
   Route::get('/all_institute', [InstituteController::class, 'allInstitute'])->name("institute.all");
   Route::resource('profiles', ProfileController::class);  
   Route::resource('members', MemberController::class);


 
   Route::resource('suppliers', SuppliersController::class);    
   Route::resource('departments', DepartmentController::class);  
   Route::get('/all_departments', [DepartmentController::class, 'allDepartments'])->name("departments.all");
   Route::get('/all_suppliers', [SuppliersController::class, 'allSuppliers'])->name("suppliers.all");
   
   

});


 