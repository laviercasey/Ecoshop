<?php

namespace App\Providers;

use App\Services\Payment\PaymentGateway;
use App\Services\Payment\YooKassaGateway;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGateway::class, YooKassaGateway::class);
    }

    public function boot(): void
    {
        Model::preventLazyLoading(! app()->isProduction());
    }
}
