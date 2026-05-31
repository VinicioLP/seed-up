<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
            'nickname' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $login = trim($validated['nickname']);
        $user = User::query()
            ->where('username', $this->normalizeNickname($login))
            ->orWhere('email', mb_strtolower($login))
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'nickname' => ['Apelido ou senha invalidos.'],
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
            'avatar_url' => $user?->avatar_url,
        ];
    }

    private function normalizeNickname(string $nickname): string
    {
        return mb_strtolower(trim($nickname));
    }
}
