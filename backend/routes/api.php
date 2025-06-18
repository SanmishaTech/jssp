<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\BankController;
use App\Http\Controllers\Api\MemoController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\LeadsController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\CashierController;
use App\Http\Controllers\Api\ClientsController;
use App\Http\Controllers\Api\HolidayController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\CommitteeMeetingController;
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
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\PurchasesController;
use App\Http\Controllers\Api\SuppliersController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\StaffPaperController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\AssetMasterController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\RequisitionController;
use App\Http\Controllers\Api\ScholarshipController;
use App\Http\Controllers\Api\AcademicYearController;
use App\Http\Controllers\Api\SubjectHoursController;
use App\Http\Controllers\Api\AssetCategoryController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\StaffEducationController;
use App\Http\Controllers\Api\TeacherTimetableController;
use App\Http\Controllers\Api\ProductCategoriesController;
use App\Http\Controllers\Api\NoticeController; // Added this line
use App\Http\Controllers\Api\SyllabusController; // Added this line
use App\Http\Controllers\Api\DashboardController; // Added for dashboard


Route::post('/login', [UserController::class, 'login']);


Route::group(['middleware'=>['auth:sanctum', 'permission','request.null']], function(){
   
   Route::resource('institutes', InstituteController::class);
   Route::get('/all_institute', [InstituteController::class, 'allInstitutes'])->name("institutes.all");
   Route::resource('trustees', TrusteeController::class);

   // Staff PDF download route
   Route::get('/staff/{id}/pdf', [StaffController::class, 'pdf'])->name('staff.pdf');
   Route::get('/event/{id}/pdf', [EventController::class, 'pdf'])->name('event.pdf');
   Route::get('/committee/{id}/pdf', [CommitteeController::class, 'pdf'])->name('committee.pdf');

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

   // Inventory Transfer routes
   Route::apiResource('transfers', TransferController::class)->only(['index','store']);
   Route::post('/transfers/{transfer}/approve', [TransferController::class, 'approve'])->name('transfers.approve');
   Route::post('/transfers/{transfer}/reject',  [TransferController::class, 'reject'])->name('transfers.reject'); 
 
   Route::resource('complaints', ComplaintController::class);
   Route::get('/all_complaints', [ComplaintController::class, 'allComplaints'])->name("complaints.all");

   Route::resource('committee', CommitteeController::class);

   // Committee Meetings routes
   Route::resource('committee-meetings', CommitteeMeetingController::class);
   Route::get('/all_committee_meetings', [CommitteeMeetingController::class, 'allMeetings'])->name('committeemeetings.all');
   Route::get('/all_committee', [CommitteeController::class, 'allCommitees'])->name("committees.all");

   Route::resource('tasks', TaskController::class);
   Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.update_status');
   
   Route::resource('admissions', AdmissionController::class);
   Route::get('/all_admissions', [AdmissionController::class, 'allAdmissions'])->name("admissions.all");
   
   Route::resource('cashiers', CashierController::class);
   Route::get('/all_cashiers', [CashierController::class, 'allCashier'])->name("cashiers.all");
   Route::get('/cashiers-report', [CashierController::class, 'generateReport'])->name("cashiers.report");

   Route::resource('bankaccounts', BankAccountController::class);
   Route::get('/all_bankaccounts', [BankAccountController::class, 'allBankAccounts'])->name("bankaccounts.all");
   
   Route::resource('subjects', SubjectController::class);
   Route::get('/all_subjects', [SubjectController::class, 'allSubject'])->name("subjects.all");
   // Syllabus routes (index for get and store for update/create)
   Route::resource('syllabus', SyllabusController::class)->only(['index','store']);
   Route::resource('notices', NoticeController::class)->only(['index','store']);
   Route::get('notices/{notice}/reads', [NoticeController::class, 'reads']);

   Route::resource('academic_years', AcademicYearController::class);
   Route::get('/all_academic_years', [AcademicYearController::class, 'allAcademicYears'])->name("academic_years.all");
   
   // Custom student routes must be defined before the resource route to avoid conflicts
   Route::get('/students/download-template', [StudentController::class, 'downloadTemplate'])->name('students.download-template');
   Route::patch('/students/{student}/id-card', [StudentController::class, 'updateIdCard'])->name('students.id_card');
   Route::resource('students', StudentController::class);
   Route::get('/all_students', [StudentController::class, 'allStudents'])->name("students.all");
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

   Route::resource('vendors', VendorController::class);
   Route::get('/all_vendors', [VendorController::class, 'allVendors'])->name("vendors.all");

   Route::resource('assetmasters', AssetMasterController::class);
Route::get('/all_assetmasters', [AssetMasterController::class, 'allAssetMaster'])->name("assetmasters.all");
   
   // Custom requisition routes must come before the resource route to avoid conflicts
   Route::get('/requisitions/history', [RequisitionController::class, 'history'])->name("requisitions.history");
   Route::get('/requisitions/pending-approvals', [RequisitionController::class, 'pendingApprovals'])->name("requisitions.pending-approvals");
   Route::get('/requisitions/admin-own', [RequisitionController::class, 'adminOwnRequisitions'])->name("requisitions.admin-own");
   Route::post('/requisitions/{id}/approve', [RequisitionController::class, 'approve'])->name("requisitions.approve");
   Route::post('/requisitions/{id}/reject', [RequisitionController::class, 'reject'])->name("requisitions.reject");
   Route::get('/all_requisitions', [RequisitionController::class, 'allRequisitions'])->name("requisitions.all");
   
   // Superadmin routes to access admin requisitions
   Route::get('/requisitions/admin', [RequisitionController::class, 'getAdminRequisitions'])->name("requisitions.admin");
   Route::get('/requisitions/admin/pending', [RequisitionController::class, 'getAdminPendingRequisitions'])->name("requisitions.admin.pending");
   
   Route::resource('requisitions', RequisitionController::class);
   

   Route::resource('memos', MemoController::class);
   Route::get('/all_memos', [MemoController::class, 'allMemos'])->name("memos.all");

   Route::resource('assetcategories', AssetCategoryController::class);
   Route::get('/all_assetcategories', [AssetCategoryController::class, 'allAssetCategories'])->name("assetcategories.all");
   
   Route::resource('purchaseorders', PurchaseOrderController::class);
   Route::get('/all_purchaseorders', [PurchaseOrderController::class, 'allPurchaseOrders'])->name("purchaseorders.all");
   Route::get('/asset_categories_by_asset/{assetId}', [PurchaseOrderController::class, 'getAssetCategoriesByAsset'])->name("asset.categories");

   // Dashboard route
   Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.data');


   Route::resource('staffEducations', StaffEducationController::class);
   Route::get('/all_staffEducations', [StaffEducationController::class, 'allStaffEducations'])->name("staffEducations.all");

   Route::resource('staffPapers', StaffPaperController::class);
   Route::get('/all_staffPapers', [StaffPaperController::class, 'allStaffPapers'])->name("staffPapers.all");

   
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

// Syllabus Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/syllabi/staff', [SyllabusController::class, 'index']);
    Route::post('/syllabi/staff', [SyllabusController::class, 'store']);
});

// Teacher Timetable Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('teacher-timetables', TeacherTimetableController::class);
    Route::get('/teacher-timetables-by-staff-week', [TeacherTimetableController::class, 'getByStaffAndWeek']);
    Route::patch('/teacher-timetables/{timetableId}/slots/{slotId}', [TeacherTimetableController::class, 'updateSlot']);
    Route::get('/teaching-staff', [TeacherTimetableController::class, 'getTeachingStaff']);
});

// Attendance Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('attendance', AttendanceController::class);
    Route::post('/attendance/by-date-division', [AttendanceController::class, 'getAttendanceByDateAndDivision']);
    Route::post('/attendance/students-by-division', [AttendanceController::class, 'getStudentsByDivision']);
    Route::post('/attendance/save', [AttendanceController::class, 'saveAttendance']);
    Route::post('/attendance/statistics', [AttendanceController::class, 'getStatistics']);
    Route::get('/attendance/analysis', [AttendanceController::class, 'getAttendanceAnalysis']);
    
    // Attendance Report Download Routes
    Route::post('/attendance/reports/day', [AttendanceController::class, 'downloadDayReport']);
    Route::post('/attendance/reports/week', [AttendanceController::class, 'downloadWeekReport']);
    Route::post('/attendance/reports/month', [AttendanceController::class, 'downloadMonthReport']);
});
