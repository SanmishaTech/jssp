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
            $table->string('designation',100)->nullable();
            $table->string('email')->nullable();
            $table->string('mobile')->nullable();
            $table->date('joining_date')->nullable();
            $table->date('resignation_date')->nullable();
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