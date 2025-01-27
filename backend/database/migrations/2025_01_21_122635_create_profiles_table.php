<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); 
            $table->unsignedBigInteger('institute_id')->nullable(); 
            $table->string('profile_name')->nullable();
             $table->string('email')->nullable();
              //employee details
             $table->string('employee_number')->nullable();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('spouse')->nullable();
            $table->string('gender')->nullable();
            $table->string('maritial_status')->nullable();
            $table->string('blood_group')->nullable();
            //address
            $table->string('corresponding_address')->nullable();
            $table->string('permanent_address')->nullable();
            //contact details
            $table->string('personal_email')->nullable();
            $table->string('mobile')->nullable();
            $table->string('landline')->nullable();
            //company details
            $table->string('state')->nullable();
            $table->string('branch')->nullable();
            $table->string('location')->nullable();
            $table->string('designation')->nullable();
            $table->string('department')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->date('joining_date')->nullable();
            $table->date('probation_date')->nullable();
            $table->date('confirmation_date')->nullable();
            $table->date('registration_date')->nullable();
            $table->date('relieving_date')->nullable();
            $table->string('office_mail')->nullable();
            $table->string('office_landline')->nullable();
            $table->string('office_mobile')->nullable();
            //statutory details
            $table->string('pf_number')->nullable();
            $table->string('uan_number')->nullable();
            $table->string('esic_number')->nullable();
            $table->string('pt_number')->nullable();
            $table->string('lwf_number')->nullable();
            //qualification number
            $table->string('institution_name')->nullable();
            $table->string('degree')->nullable();
            $table->string('specialization')->nullable();
            $table->date('from_year')->nullable();
            $table->date('to_year')->nullable();
            //previous employer
            $table->string('organization_name')->nullable();
            $table->string('previous_designation')->nullable();
            $table->string('previous_department')->nullable();
            $table->date('previous_from_year')->nullable();
            $table->date('previous_to_year')->nullable();
            //bank details
            $table->string('holder_name')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('bank_address')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};