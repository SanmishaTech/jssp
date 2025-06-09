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
        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id')->nullable();
            $table->unsignedBigInteger('sender_staff_id')->nullable();
            $table->string('sender_role');
            $table->unsignedBigInteger('recipient_staff_id')->nullable();
            $table->string('recipient_role')->nullable();
            $table->unsignedBigInteger('recipient_institute_id')->nullable();
            $table->text('message');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
            $table->foreign('sender_staff_id')->references('id')->on('staff')->onDelete('set null');
            $table->foreign('recipient_staff_id')->references('id')->on('staff')->onDelete('set null');
            $table->foreign('recipient_institute_id')->references('id')->on('institutes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notices');
    }
};
