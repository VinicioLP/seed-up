<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class WeatherService
{
    public function getWeather(float $lat, float $lon): ?array
    {
        $appid = env('OPEN_WEATHER_KEY');

        if (!$appid) {
            return null;
        }

        try {
            $response = Http::timeout(8)
                ->connectTimeout(4)
                ->withOptions([
                    'curl' => [
                        CURLOPT_PROXY => '',
                    ],
                ])
                ->get('https://api.openweathermap.org/data/2.5/weather', [
                    'lat' => $lat,
                    'lon' => $lon,
                    'appid' => $appid,
                    'units' => 'metric',
                    'lang' => 'pt_br',
                ]);

            if ($response->failed()) {
                return null;
            }

            return $response->json();
        } catch (ConnectionException) {
            return null;
        }
    }
}
