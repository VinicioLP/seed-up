<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nickname' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:4'],
        ]);
        $username = $this->normalizeNickname($validated['nickname']);

        if (User::query()->where('username', $username)->exists()) {
            throw ValidationException::withMessages([
                'nickname' => ['Este apelido ja esta em uso.'],
            ]);
        }

        $user = User::create([
            'name' => trim($validated['nickname']),
            'username' => $username,
            'email' => mb_strtolower(trim($validated['email'])),
            'password' => $validated['password'],
        ]);

        return $this->tokenResponse($user);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $login = mb_strtolower(trim($validated['email']));
        $user = User::query()
            ->where('email', $login)
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['E-mail ou senha invalidos.'],
            ]);
        }

        return $this->tokenResponse($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout realizado com sucesso.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->serializeUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'nickname' => ['sometimes', 'required', 'string', 'min:3', 'max:255'],
            'avatar' => ['sometimes', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        if (array_key_exists('nickname', $validated)) {
            $username = $this->normalizeNickname($validated['nickname']);

            if (
                User::query()
                    ->where('username', $username)
                    ->whereKeyNot($user->id)
                    ->exists()
            ) {
                throw ValidationException::withMessages([
                    'nickname' => ['Este apelido ja esta em uso.'],
                ]);
            }

            $user->name = trim($validated['nickname']);
            $user->username = $username;
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $user->avatar_path = $request->file('avatar')->store('profile-photos', 'public');
        }

        $user->save();

        return response()->json([
            'user' => $this->serializeUser($user->fresh()),
        ]);
    }

    private function tokenResponse(User $user): JsonResponse
    {
        return response()->json([
            'token' => $user->createToken('seedup-mobile')->plainTextToken,
            'user' => $this->serializeUser($user),
        ]);
    }

    /**
     * @return array{id:int|null,name:string|null,username:string|null,email:string|null,avatar_url:string|null}
     */
    private function serializeUser(?User $user): array
    {
        return [
            'id' => $user?->id,
            'name' => $user?->name,
            'username' => $user?->username,
            'email' => $user?->email,
            'avatar_url' => $this->avatarUrl($user),
        ];
    }

    private function avatarUrl(?User $user): ?string
    {
        if (! $user) {
            return null;
        }

        if ($user->avatar_path) {
            return request()->getSchemeAndHttpHost().Storage::url($user->avatar_path);
        }

        return $user->avatar_url;
    }

    private function normalizeNickname(string $nickname): string
    {
        return mb_strtolower(trim($nickname));
    }
}
