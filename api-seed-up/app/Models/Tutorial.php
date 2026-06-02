<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
