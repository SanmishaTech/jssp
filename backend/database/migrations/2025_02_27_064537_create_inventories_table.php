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
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("room_id")->nullable();
            $table->string("asset")->nullable();
            $table->string("quantity")->nullable();
            $table->string('institute_id')->nullable();
            $table->string('purchase_date')->nullable();
            $table->string('purchase_price')->nullable();
            $table->string('remarks')->nullable();
            $table->string('status')->nullable();
            $table->string('scraped_amount')->nullable();
             $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};