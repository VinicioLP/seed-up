<?php

namespace App\Http\Controllers;

use App\Services\WeatherService;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function getWeather(Request $request, WeatherService $service)
    {
        $lat = $request->input('lat');
        $lon = $request->input('lon');

        $data = $service->getWeather($lat, $lon);

        return response()->json([
            'description' => ucfirst($data['weather'][0]['description']),
            'temperature' => $data['main']['temp'],
            'humidity' => $data['main']['humidity'],
            'windSpeed' => $data['wind']['speed'],
            'icon' => $data['weather'][0]['icon'],
            'iconUrl' => 'https://openweathermap.org/img/wn/' . $data['weather'][0]['icon'] . '@2x.png',
        ]);
    }
}
