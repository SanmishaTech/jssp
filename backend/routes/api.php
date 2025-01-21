<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LeadsController;
use App\Http\Controllers\Api\ClientsController;
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
Route::resource('institutes', InstituteController::class);


Route::group(['middleware'=>['auth:sanctum', 'permission','request.null']], function(){
   
   Route::resource('suppliers', SuppliersController::class);    
   Route::resource('departments', DepartmentController::class);  
   Route::get('/all_departments', [DepartmentController::class, 'allDepartments'])->name("departments.all");
   Route::get('/all_suppliers', [SuppliersController::class, 'allSuppliers'])->name("suppliers.all");
   

});


 