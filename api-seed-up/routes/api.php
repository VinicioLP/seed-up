<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth', [AuthController::class, 'auth']);
});

Route::post('/weather', [WeatherController::class, 'getWeather']);
