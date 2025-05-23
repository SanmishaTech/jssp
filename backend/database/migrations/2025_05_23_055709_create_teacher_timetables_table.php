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
        Schema::create('teacher_timetables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->date('week_start_date')->comment('Start date of the week');
            $table->string('status')->default('active')->comment('Status of the timetable: active, inactive, draft');
            $table->timestamps();
            
            // Unique constraint to prevent duplicate timetables for the same staff and week
            $table->unique(['staff_id', 'week_start_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_timetables');
    }
};
