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
        Schema::table('course_user', function (Blueprint $table) {
            $table->string('status')->default('pending'); // pending, active, rejected
            $table->string('payment_screenshot')->nullable();
            $table->string('phone')->nullable();
            $table->text('admin_note')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_user', function (Blueprint $table) {
            $table->dropColumn(['status', 'payment_screenshot', 'phone', 'admin_note']);
        });
    }
};
