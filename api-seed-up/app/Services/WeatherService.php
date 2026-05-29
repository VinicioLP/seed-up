<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class WeatherService
{
    public function getWeather(float $lat, float $lon): array
    {
        $appid = env('OPEN_WEATHER_KEY');
        $response = Http::get('https://api.openweathermap.org/data/2.5/weather', [
            'lat' => $lat,
            'lon' => $lon,
            'appid' => $appid,
            'units' => 'metric',
            'lang' => 'pt_br'
        ])->json();

        return $response;

    }
}
