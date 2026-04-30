<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodeExample extends Model
{
    protected $fillable = [
        'lesson_id', 'title', 'code', 'language', 'description', 'runnable', 'order'
    ];

    protected $casts = [
        'runnable' => 'boolean',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
