<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    protected $fillable = [
        'module_id', 'title', 'description', 'order', 'duration', 'difficulty', 'is_active', 'teacher_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function slides(): HasMany
    {
        return $this->hasMany(Slide::class)->orderBy('order');
    }

    public function codeExamples(): HasMany
    {
        return $this->hasMany(CodeExample::class)->orderBy('order');
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(Exercise::class)->orderBy('order');
    }
}
