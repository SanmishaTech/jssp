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
        Schema::create('staff_papers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('staff_id');
            $table->string('journal_title')->nullable();
           $table->string('research_topic')->nullable();
           $table->string('publication_identifier')->nullable();
           $table->string('volume')->nullable();
           $table->string('issue')->nullable();
           $table->string('year_of_publication')->nullable();
           $table->string('peer_reviewed')->nullable();
           $table->string('coauthor')->nullable();
           $table->string('certificate_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_papers');
    }
}; 