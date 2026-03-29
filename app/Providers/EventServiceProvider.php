<?php

namespace App\Providers;

use App\Events\ContactFormSubmitted;
use App\Events\OrderCreated;
use App\Listeners\SendContactFormNotification;
use App\Listeners\SendNewOrderAdminNotification;
use App\Listeners\SendOrderConfirmation;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderCreated::class => [
            SendOrderConfirmation::class,
            SendNewOrderAdminNotification::class,
        ],
        ContactFormSubmitted::class => [
            SendContactFormNotification::class,
        ],
    ];
}
