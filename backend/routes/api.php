<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BankController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\LeadsController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\ClientsController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TrusteeController;
use App\Http\Controllers\Api\ContactsController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\InvoicesController;
use App\Http\Controllers\Api\PeticashController;
use App\Http\Controllers\Api\ProductsController;
use App\Http\Controllers\Api\SemesterController;
use App\Http\Controllers\Api\AdmissionController;
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
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\ScholarshipController;
use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\SubjectHoursController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TeacherTimetableController;
use App\Http\Controllers\Api\ProductCategoriesController;



Route::post('/login', [UserController::class, 'login']);


Route::group(['middleware'=>['auth:sanctum', 'permission','request.null']], function(){
   
   Route::resource('institutes', InstituteController::class);
   Route::get('/all_institute', [InstituteController::class, 'allInstitutes'])->name("institutes.all");
   Route::resource('trustees', TrusteeController::class);

   Route::resource('staff', StaffController::class);  
   Route::get('/all_staff', [StaffController::class, 'allStaffs'])->name("staffs.all");

   Route::resource('members', MemberController::class);
   Route::resource('superadmin', SuperAdminController::class);
   
   Route::resource('courses', CourseController::class);
   Route::get('/all_courses', [CourseController::class, 'allCourses'])->name("courses.all");
  
   Route::resource('holiday', HolidayController::class);
   Route::get('/all_holiday', [HolidayController::class, 'allHoliday'])->name("holidays.all");
   
   // Weekly holiday routes
   Route::get('/weekly-holidays', [HolidayController::class, 'weeklyHolidays'])->name('weekly.holidays');
   Route::post('/weekly-holidays', [HolidayController::class, 'updateWeeklyHolidays'])->name('weekly.holidays.update');
   Route::put('/weekly-holidays/toggle', [HolidayController::class, 'toggleWeeklyHoliday'])->name('weekly.holidays.toggle');
   
   // Get combined calendar holidays (regular + weekly)
   Route::get('/calendar-holidays', [HolidayController::class, 'calendarHolidays'])->name('calendar.holidays');

   Route::resource('semesters', SemesterController::class);
   Route::get('/all_semesters', [SemesterController::class, 'allSemesters'])->name("semesters.all");

   Route::resource('divisions', DivisionController::class);
   Route::get('/all_divisions', [DivisionController::class, 'allDivisions'])->name("divisions.all");
   
   Route::resource('rooms', RoomController::class);
   Route::get('/all_rooms', [RoomController::class, 'allRooms'])->name("rooms.all");

   Route::resource('meetings', MeetingController::class);
   Route::get('/all_meetings', [MeetingController::class, 'allMeetings'])->name("meetings.all");

   Route::resource('events', EventController::class);
   Route::get('/all_events', [EventController::class, 'allEvents'])->name("events.all");

   Route::resource('inventory', InventoryController::class); 
 
   Route::resource('complaints', ComplaintController::class);
   Route::get('/all_complaints', [ComplaintController::class, 'allComplaints'])->name("complaints.all");

   Route::resource('committee', CommitteeController::class);
   Route::get('/all_committee', [CommitteeController::class, 'allCommitees'])->name("committees.all");

   Route::resource('admissions', AdmissionController::class);
   Route::get('/all_admissions', [AdmissionController::class, 'allAdmissions'])->name("admissions.all");
   
   Route::resource('cashiers', CashierController::class);
   Route::get('/all_cashiers', [CashierController::class, 'allCashier'])->name("cashiers.all");
   Route::get('/cashiers-report', [CashierController::class, 'generateReport'])->name("cashiers.report");

   Route::resource('bankaccounts', BankAccountController::class);
   Route::get('/all_bankaccounts', [BankAccountController::class, 'allBankAccounts'])->name("bankaccounts.all");
   
   Route::resource('subjects', SubjectController::class);
   Route::get('/all_subjects', [SubjectController::class, 'allSubject'])->name("subjects.all");

   Route::resource('academic_years', AcademicYearController::class);
   Route::get('/all_academic_years', [AcademicYearController::class, 'allAcademicYears'])->name("academic_years.all");
   
   Route::resource('students', StudentController::class);
   Route::get('/all_students', [StudentController::class, 'allStudents'])->name("students.all");
   Route::get('/students/download-template', [StudentController::class, 'downloadTemplate'])->name("students.download-template");
   Route::post('/students/import', [StudentController::class, 'import'])->name("students.import");

   // Peticash routes
   Route::resource('peticash', PeticashController::class);
   Route::get('/all_peticash', [PeticashController::class, 'allRooms'])->name("peticash.all");
   Route::post('/peticash/{id}/transaction', [PeticashController::class, 'recordTransaction'])->name("peticash.transaction");
   Route::get('/peticash/{id}/transactions', [PeticashController::class, 'getTransactionHistory'])->name("peticash.transactions");

   // Bank routes
   Route::resource('banks', BankController::class);
   Route::get('/all_banks', [BankController::class, 'allBanks'])->name("banks.all");
   Route::post('/banks/{id}/transaction', [BankController::class, 'recordTransaction'])->name("banks.transaction");
   Route::get('/banks/{id}/transactions', [BankController::class, 'getTransactionHistory'])->name("banks.transactions");
   Route::get('/banks/transactions/account/{id}', [BankController::class, 'getTransactionsByBankAccount'])->name("banks.transactions.byAccount");
   Route::post('/bankaccounts/{id}/add-transaction', [BankController::class, 'recordBankAccountTransaction'])->name("bankaccounts.transaction");
   Route::get('/all_bankaccounts', [BankAccountController::class, 'allBankAccounts'])->name("bankaccounts.all");


   Route::resource('scholarships', ScholarshipController::class);
   Route::get('/all_scholarships', [ScholarshipController::class, 'allScholarship'])->name("scholarships.all");

   // Task Manager Routes
   Route::resource('tasks', TaskController::class);
   Route::put('/tasks/{id}/status', [TaskController::class, 'updateStatus'])->name('tasks.update_status');



   
});

Route::get('/file/{document}', [EventController::class, 'displayDocuments'])->name("client.displayDocuments");
Route::get('/staff-file/{document}', [StaffController::class, 'displayDocuments'])->name("client.displayStaffDocuments");

// Leave Application Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/leaves', [LeaveController::class, 'store']);
    Route::get('/leaves/member', [LeaveController::class, 'getByMember']);
    Route::get('/leaves/status/{status}', [LeaveController::class, 'getByStatus']);
    Route::put('/leaves/{id}', [LeaveController::class, 'update']);
});

// Subject Hours Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/staff-sub-subject-hours', [SubjectHoursController::class, 'index']);
    Route::post('/staff-sub-subject-hours/batch', [SubjectHoursController::class, 'storeBatch']);
});

// Teacher Timetable Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('teacher-timetables', TeacherTimetableController::class);
    Route::get('/teacher-timetables-by-staff-week', [TeacherTimetableController::class, 'getByStaffAndWeek']);
    Route::patch('/teacher-timetables/{timetableId}/slots/{slotId}', [TeacherTimetableController::class, 'updateSlot']);
    Route::get('/teaching-staff', [TeacherTimetableController::class, 'getTeachingStaff']);
});
