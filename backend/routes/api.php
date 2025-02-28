<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LeadsController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\ClientsController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\TrusteeController;
use App\Http\Controllers\Api\ContactsController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\InvoicesController;
use App\Http\Controllers\Api\ProductsController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\CommitteeController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\EmployeesController;
use App\Http\Controllers\Api\FollowUpsController;
use App\Http\Controllers\Api\InstituteController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\PurchasesController;
use App\Http\Controllers\Api\SuppliersController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\ProductCategoriesController;



Route::post('/login', [UserController::class, 'login']);


Route::group(['middleware'=>['auth:sanctum', 'permission','request.null']], function(){
   
   Route::resource('institutes', InstituteController::class);
   Route::get('/all_institute', [InstituteController::class, 'allInstitutes'])->name("institutes.all");
   Route::resource('trustees', TrusteeController::class);

   Route::resource('staff', StaffController::class);  
   Route::get('/all_staff', [StaffController::class, 'allStaff'])->name("staffs.all");

   Route::resource('members', MemberController::class);
   Route::resource('superadmin', SuperAdminController::class);
   Route::resource('courses', CourseController::class);
   Route::get('/all_courses', [CourseController::class, 'allCourses'])->name("courses.all");
   Route::resource('semesters', SemesterController::class);
   Route::get('/all_semesters', [SemesterController::class, 'allSemesters'])->name("semesters.all");
   Route::resource('divisions', DivisionController::class);
   Route::get('/all_divisions', [DivisionController::class, 'allDivisions'])->name("divisions.all");
   
   Route::resource('rooms', RoomController::class);
   Route::get('/all_rooms', [RoomController::class, 'allRooms'])->name("rooms.all");

   Route::resource('inventory', InventoryController::class);

   Route::resource('complaints', ComplaintController::class);
   Route::get('/all_complaints', [ComplaintController::class, 'allComplaints'])->name("complaints.all");

   Route::resource('committee', CommitteeController::class);
   Route::get('/all_committee', [CommitteeController::class, 'allCommitees'])->name("committees.all");


});


 