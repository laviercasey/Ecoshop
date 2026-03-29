<?php

namespace App\Enums;

enum ShippingMethod: string
{
    case Cdek = 'cdek';
    case Pickup = 'pickup';
    case RussianPost = 'russian_post';

    public function label(): string
    {
        return match ($this) {
            self::Cdek => 'СДЭК',
            self::Pickup => 'Самовывоз',
            self::RussianPost => 'Почта России',
        };
    }
}
