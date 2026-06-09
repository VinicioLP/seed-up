<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WeatherController extends Controller
{
    public function getWeather(Request $request, WeatherService $service)
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric'],
            'lon' => ['required', 'numeric'],
        ]);

        $data = $service->getWeather((float) $validated['lat'], (float) $validated['lon']);

        if (
            !$data ||
            !isset($data['weather'][0], $data['main']['temp'], $data['main']['humidity'], $data['wind']['speed'])
        ) {
            return response()->json([
                'message' => 'Nao foi possivel carregar o clima agora.',
            ], 503);
        }

        Log::info("Weather respons: " . print_r($data, true));

        return response()->json([
            'description' => ucfirst($data['weather'][0]['description']),
            'temperature' => $data['main']['temp'],
            'humidity' => $data['main']['humidity'],
            'windSpeed' => $data['wind']['speed'],
            'icon' => $data['weather'][0]['icon'],
            'name' => $data['name'],
            'iconUrl' => 'https://openweathermap.org/img/wn/' . $data['weather'][0]['icon'] . '@2x.png',
        ]);
    }
}
