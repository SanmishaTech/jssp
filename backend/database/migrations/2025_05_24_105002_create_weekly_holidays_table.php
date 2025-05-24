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
        Schema::create('weekly_holidays', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id')->unique();
            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
            
            // JSON array of days marked as holidays [0,1,5] etc. where 0=Sunday, 1=Monday, etc.
            $table->json('holiday_days')->default('[]');
            
            // Optional description for the weekly holidays
            $table->string('description')->nullable()->default('Weekly Holiday');
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_holidays');
    }
};
