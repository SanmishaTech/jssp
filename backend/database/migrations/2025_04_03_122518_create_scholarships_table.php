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
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id');
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('academic_years_id');
            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
            $table->string('students_applied_for_scholarship')->nullable();
            $table->string('approved_from_university')->nullable();
            $table->string('first_installment_date')->nullable();
            $table->string('first_installment_amount')->nullable();
            $table->string('second_installment_date')->nullable();
            $table->string('second_installment_amount')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarships');   
    }
};