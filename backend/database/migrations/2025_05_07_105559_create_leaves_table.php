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
        Schema::create('leaves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id');
            $table->unsignedBigInteger('staff_id');
            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
            $table->string('date');
            $table->date('from_date');
            $table->string('leave_type');
            $table->date('to_date');
            $table->string('reason');
            $table->string('status');
            $table->string('remarks');
            $table->string('approved_by');
            $table->string('approved_at');


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaves');
    }
};
