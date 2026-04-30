<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->longText('content'); // Markdown or HTML
            $table->string('type')->default('slide'); // slide | code | demo | exercise
            $table->string('language')->nullable(); // js, php, html, css
            $table->integer('order')->default(0);
            $table->json('notes')->nullable(); // Teacher notes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slides');
    }
};
