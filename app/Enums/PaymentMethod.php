<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Card = 'card';
    case Cash = 'cash';
    case Sbp = 'sbp';

    public function label(): string
    {
        return match ($this) {
            self::Card => 'Банковская карта',
            self::Cash => 'Наличные',
            self::Sbp => 'СБП',
        };
    }
}
