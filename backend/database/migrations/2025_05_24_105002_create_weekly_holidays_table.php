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
             $table->json('holiday_days');  // Can't set default for JSON columns in MySQL
             $table->string('description')->nullable()->default('Weekly Holiday');

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
