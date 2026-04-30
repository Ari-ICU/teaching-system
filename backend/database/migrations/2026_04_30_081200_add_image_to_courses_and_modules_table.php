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
        if (!Schema::hasColumn('courses', 'image')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->string('image')->nullable()->after('description');
            });
        }

        if (!Schema::hasColumn('modules', 'image')) {
            Schema::table('modules', function (Blueprint $table) {
                $table->string('image')->nullable()->after('description');
            });
        }
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'image')) {
                $table->dropColumn('image');
            }
        });

        Schema::table('modules', function (Blueprint $table) {
            if (Schema::hasColumn('modules', 'image')) {
                $table->dropColumn('image');
            }
        });
    }
};
