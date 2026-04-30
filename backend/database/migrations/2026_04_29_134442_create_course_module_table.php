<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create the pivot table
        Schema::create('course_module', function (Blueprint $col) {
            $col->id();
            $col->foreignId('course_id')->constrained()->onDelete('cascade');
            $col->foreignId('module_id')->constrained()->onDelete('cascade');
            $col->integer('order')->default(0);
            $col->timestamps();
        });

        // 2. Migrate existing data from modules.course_id to course_module
        $existingModules = DB::table('modules')->whereNotNull('course_id')->get();
        foreach ($existingModules as $module) {
            DB::table('course_module')->insert([
                'course_id' => $module->course_id,
                'module_id' => $module->id,
                'order'     => $module->order ?? 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Remove the old course_id column from modules
        Schema::table('modules', function (Blueprint $col) {
            $col->dropColumn('course_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Add back the course_id column
        Schema::table('modules', function (Blueprint $col) {
            $col->foreignId('course_id')->nullable()->constrained();
        });

        // 2. Restore data from pivot to modules (approximate)
        $pivotData = DB::table('course_module')->get();
        foreach ($pivotData as $row) {
            DB::table('modules')->where('id', $row.module_id)->update(['course_id' => $row.course_id]);
        }

        Schema::dropIfExists('course_module');
    }
};
