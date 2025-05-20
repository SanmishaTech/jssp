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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id'); 
            $table->unsignedBigInteger('institute_id')->nullable(); 
            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
            $table->string('employee_code')->nullable();
            $table->string('staff_name')->nullable();
             $table->date('date_of_birth')->nullable();
            $table->string('address')->nullable();
            $table->string('mobile')->nullable();
            $table->string('email')->nullable();
            $table->string('gender')->nullable();
            $table->string('experience')->nullable();
            $table->string('highest_qualification')->nullable();
            $table->string('pan_number')->nullable();
            $table->string('aadhaar_number')->nullable();
            $table->string('appointment_date')->nullable();
            $table->string('nature_of_appointment')->nullable();
            $table->string('subject_type')->nullable();
            $table->string('mode_of_payment')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('account_holder_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('ifsc_code')->nullable();
            $table->string('salary')->nullable();
            $table->json('course_id')->nullable(); // Store multiple course IDs as JSON array
            $table->json('semester_id')->nullable(); // Store multiple semester IDs as JSON array
            $table->json('subject_id')->nullable(); // Store multiple subject IDs as JSON array
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};