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
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventory_id');
            $table->unsignedBigInteger('from_room_id')->nullable();
            $table->unsignedBigInteger('from_institute_id')->nullable();
            $table->unsignedBigInteger('to_room_id')->nullable();
            $table->unsignedBigInteger('to_institute_id')->nullable();
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('requested_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('inventory_id')->references('id')->on('inventories')->cascadeOnDelete();
            $table->foreign('from_room_id')->references('id')->on('rooms')->nullOnDelete();
            $table->foreign('from_institute_id')->references('id')->on('institutes')->nullOnDelete();
            $table->foreign('to_room_id')->references('id')->on('rooms')->nullOnDelete();
            $table->foreign('to_institute_id')->references('id')->on('institutes')->nullOnDelete();
            $table->foreign('requested_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
