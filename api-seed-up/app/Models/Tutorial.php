<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'slug',
    'title',
    'category',
    'level',
    'duration',
    'views',
    'description',
    'image_url',
    'intro',
    'materials',
    'steps',
    'tips',
])]
class Tutorial extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'materials' => 'array',
            'steps' => 'array',
            'tips' => 'array',
        ];
    }

    public function savedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'saved_tutorials')->withTimestamps();
    }
}
