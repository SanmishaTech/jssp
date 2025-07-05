<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id')->nullable();
            $table->unsignedBigInteger('staff_id');
            $table->string('letter_number')->unique();
            $table->string('letter_title');
            // Moved from 2025_07_05_062200_add_type_to_letters_table.php
            $table->enum('type', ['inward', 'outward'])->default('outward');
            $table->longText('letter_description');
            $table->string('letter_path')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letters');
    }
};
