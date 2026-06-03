<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (!app()->environment('local')) {
            return;
        }

        foreach ([
            'HTTP_PROXY',
            'HTTPS_PROXY',
            'ALL_PROXY',
            'GIT_HTTP_PROXY',
            'GIT_HTTPS_PROXY',
            'http_proxy',
            'https_proxy',
            'all_proxy',
        ] as $proxyKey) {
            putenv($proxyKey);
            unset($_ENV[$proxyKey], $_SERVER[$proxyKey]);
        }
    }
}
