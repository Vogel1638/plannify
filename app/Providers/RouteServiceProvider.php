<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // API-Routes werden jetzt in bootstrap/app.php konfiguriert
        // Web-Routes werden auch dort konfiguriert
    }
}
