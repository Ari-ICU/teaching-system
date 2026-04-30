<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Module extends Model
{
    protected $fillable = [
        'title', 'description', 'icon', 'color', 'order', 'is_active', 'teacher_id', 'image'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * A module can belong to multiple courses.
     */
    public function courses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'course_module')
                    ->withPivot('order')
                    ->withTimestamps();
    }

    /**
     * Legacy support (returns first course)
     */
    public function getCourseAttribute()
    {
        return $this->courses()->first();
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    public function teacher(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
