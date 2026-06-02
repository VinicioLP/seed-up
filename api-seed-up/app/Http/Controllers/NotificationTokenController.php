<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationTokenController extends Controller
{
    public function updateToken(Request $request): JsonResponse
    {
        $request->validate([
            'push_token' => 'required|string|starts_with:ExponentPushToken'
        ]);

        $user = $request->user();
        $user->expo_push_token = $request->push_token;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Token atualizado com sucesso!'
        ], 200);
    }
}
