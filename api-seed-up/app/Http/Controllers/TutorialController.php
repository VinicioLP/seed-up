<?php

namespace App\Http\Controllers;

use App\Models\Tutorial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TutorialController extends Controller
{
    public function index(): JsonResponse
    {
        $tutorials = Tutorial::query()
            ->orderBy('id')
            ->get()
            ->map(fn (Tutorial $tutorial) => $this->serializeTutorial($tutorial));

        return response()->json([
            'tutorials' => $tutorials,
        ]);
    }

    public function show(Tutorial $tutorial): JsonResponse
    {
        return response()->json([
            'tutorial' => $this->serializeTutorial($tutorial),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'category' => ['required', 'string', 'max:80'],
            'level' => ['required', 'string', 'max:80'],
            'duration' => ['required', 'string', 'max:40'],
            'description' => ['required', 'string', 'max:500'],
            'image' => ['required', 'url', 'max:1000'],
            'intro' => ['required', 'string', 'max:1200'],
            'materials' => ['required', 'array', 'min:1'],
            'materials.*' => ['required', 'string', 'max:180'],
            'steps' => ['required', 'array', 'min:1'],
            'steps.*' => ['required', 'string', 'max:700'],
            'tips' => ['required', 'array', 'min:1'],
            'tips.*' => ['required', 'string', 'max:300'],
        ]);

        $tutorial = Tutorial::create([
            'slug' => $this->makeUniqueSlug($validated['title']),
            'title' => $validated['title'],
            'category' => $validated['category'],
            'level' => $validated['level'],
            'duration' => $validated['duration'],
            'views' => '0 views',
            'description' => $validated['description'],
            'image_url' => $validated['image'],
            'intro' => $validated['intro'],
            'materials' => $validated['materials'],
            'steps' => $validated['steps'],
            'tips' => $validated['tips'],
        ]);

        return response()->json([
            'tutorial' => $this->serializeTutorial($tutorial),
        ], 201);
    }

    private function makeUniqueSlug(string $title): string
    {
        $baseSlug = Str::slug($title) ?: 'tutorial';
        $slug = $baseSlug;
        $suffix = 2;

        while (Tutorial::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function serializeTutorial(Tutorial $tutorial): array
    {
        return [
            'id' => $tutorial->slug,
            'databaseId' => $tutorial->id,
            'title' => $tutorial->title,
            'category' => $tutorial->category,
            'level' => $tutorial->level,
            'duration' => $tutorial->duration,
            'views' => $tutorial->views,
            'description' => $tutorial->description,
            'image' => $tutorial->image_url,
            'intro' => $tutorial->intro,
            'materials' => $tutorial->materials ?? [],
            'steps' => $tutorial->steps ?? [],
            'tips' => $tutorial->tips ?? [],
        ];
    }
}
