<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Slide extends Model
{
    protected $fillable = [
        'lesson_id', 'title', 'content', 'code_snippet', 'image', 'secondary_image', 'image_position', 'image_width', 'code_position', 'code_theme', 'type', 'layout_type', 'language', 'order', 'notes'
    ];

    protected $casts = [
        'notes' => 'array',
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }
}
