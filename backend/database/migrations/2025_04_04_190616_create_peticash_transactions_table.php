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
        Schema::create('peticash_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('peticash_id');
            $table->foreign('peticash_id')->references('id')->on('peticashes')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('description');
            $table->enum('type', ['credit', 'debit'])->default('debit');
            $table->decimal('balance_after', 10, 2)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peticash_transactions');
    }
};
