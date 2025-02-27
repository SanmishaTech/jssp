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
        Schema::create('commitee_staff', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('commitees_id'); 
            $table->unsignedBigInteger('staff_id');
            $table->string("designation")->nullable();
              
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commitee_staff');
    }
};