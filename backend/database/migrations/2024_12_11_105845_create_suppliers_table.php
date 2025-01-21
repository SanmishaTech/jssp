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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('supplier')->nullable();
            $table->string('street_address')->nullable();
            $table->string('area')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('pincode', 10)->nullable();
            $table->string('country', 50)->nullable();
            $table->string('gstin', 15)->nullable();
            $table->string('contact_name')->nullable();
            $table->string('department', 100)->nullable();
            $table->string('designation', 100)->nullable();
            $table->string('mobile_1', 20)->nullable();
            $table->string('mobile_2', 20)->nullable();
            $table->string('email', 100)->nullable();
            $table->timestamps();
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};