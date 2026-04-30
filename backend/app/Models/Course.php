<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'price',
        'image',
        'order',
        'is_active',
        'teacher_id'
    ];

    /**
     * A course has many modules via the pivot table.
     */
    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'course_module')
                    ->withPivot('order')
                    ->withTimestamps()
                    ->orderBy('modules.order');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_user')
                    ->withPivot('status', 'payment_screenshot', 'phone', 'admin_note', 'enrolled_at')
                    ->withTimestamps();
    }

    public function teacher(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
}
