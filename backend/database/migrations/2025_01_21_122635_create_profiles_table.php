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
             $table->string('staff_number')->nullable();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('gender')->nullable();
            $table->string('maritial_status')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('date_of_birth')->nullable();
            //address
            $table->string('corresponding_address')->nullable();
            $table->string('permanent_address')->nullable();
            //contact details
            $table->string('personal_email')->nullable();
            $table->string('mobile')->nullable();
            $table->string('alternate_mobile')->nullable();
            $table->string('landline')->nullable();
            //attachment
            // $table->string('bond_attachment')->nullable();
           
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