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
        Schema::create('teacher_timetable_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_timetable_id')->constrained('teacher_timetables')->onDelete('cascade');
            $table->string('day')->comment('Day of the week: monday, tuesday, etc.');
            $table->string('time_slot')->comment('Time slot: 10:00 AM - 11:00 AM, etc.');
            $table->string('slot_id')->comment('Identifier for the time slot: 10, 11, etc.');
            $table->boolean('is_break')->default(false)->comment('Whether this is a break slot');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete()->comment('The division ID for this class');
            $table->timestamps();
            
            // Unique constraint to prevent duplicate slots for the same timetable, day and time slot
            $table->unique(['teacher_timetable_id', 'day', 'slot_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_timetable_slots');
    }
};
