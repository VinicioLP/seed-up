<?php

use App\Http\Controllers\AiChatController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\TutorialController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/weather', [WeatherController::class, 'getWeather']);
    Route::post('/ai/chat', [AiChatController::class, 'chat']);

    Route::get('/tutorials', [TutorialController::class, 'index']);
    Route::post('/tutorials', [TutorialController::class, 'store']);
    Route::get('/tutorials/{tutorial:slug}', [TutorialController::class, 'show']);

    Route::get('/community/posts', [CommunityController::class, 'index']);
    Route::post('/community/posts', [CommunityController::class, 'store']);
});
