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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id');
             $table->unsignedBigInteger('subject_id');
            $table->unsignedBigInteger('division_id');
            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
            
            // Students fields
            $table->string('student_name')->nullable();
            $table->string('prn')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};