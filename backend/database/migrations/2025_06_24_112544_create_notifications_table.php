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
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('from_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('to_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('institute_id')->nullable()->constrained('institutes')->onDelete('set null');
            $table->string('type');
            $table->text('data');
            $table->string('link')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
