<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case OrderManager = 'order_manager';
    case ContentManager = 'content_manager';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Администратор',
            self::OrderManager => 'Менеджер заказов',
            self::ContentManager => 'Контент-менеджер',
            self::Customer => 'Покупатель',
        };
    }
}
