<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AiChatController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth', [AuthController::class, 'auth']);
});

Route::post('/weather', [WeatherController::class, 'getWeather']);
Route::post('/ai/chat', [AiChatController::class, 'chat']);
