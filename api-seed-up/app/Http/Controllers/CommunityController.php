<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CommunityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $posts = CommunityPost::query()
            ->with('user:id,name,username')
            ->latest()
            ->get()
            ->map(fn (CommunityPost $post) => $this->serializePost($post, $request));

        return response()->json([
            'posts' => $posts,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $imagePaths = [];

        foreach ($request->file('images', []) as $image) {
            $imagePaths[] = $image->store('community-posts', 'public');
        }

        $post = CommunityPost::create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'image_paths' => $imagePaths,
        ])->load('user:id,name,username');

        return response()->json([
            'post' => $this->serializePost($post, $request),
        ], 201);
    }

    private function serializePost(CommunityPost $post, Request $request): array
    {
        return [
            'id' => (string) $post->id,
            'author' => $post->user?->name ?? $post->user?->username ?? 'Cultivador',
            'content' => $post->content,
            'imageUrls' => collect($post->image_paths ?? [])
                ->map(fn (string $path) => $this->publicStorageUrl($path, $request))
                ->values()
                ->all(),
            'createdAt' => $post->created_at?->diffForHumans() ?? 'Agora',
        ];
    }

    private function publicStorageUrl(string $path, Request $request): string
    {
        return $request->getSchemeAndHttpHost().Storage::url($path);
    }
}
