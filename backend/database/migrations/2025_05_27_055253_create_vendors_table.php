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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id');
            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');   
            $table->string("vendor_name")->nullable();
            $table->string("organization_name")->nullable();
            $table->string("contact_name")->nullable();
            $table->string("contact_number")->nullable();
            $table->string("contact_email")->nullable();
            $table->string("contact_address")->nullable();
            $table->string("contact_city")->nullable();
            $table->string("contact_state")->nullable();
            $table->string("contact_pincode")->nullable();
            $table->string("contact_country")->nullable();
            $table->string("website")->nullable();
            $table->string("gst_number")->nullable();
            $table->string("organization_pan_number")->nullable();
            $table->string("bank_name")->nullable();
            $table->string("bank_account_holder_name")->nullable();
            $table->string("bank_account_number")->nullable();
            $table->string("bank_ifsc_code")->nullable();
            $table->string("bank_branch")->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendors');
    }
};
