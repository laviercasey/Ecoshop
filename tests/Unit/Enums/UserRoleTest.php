<?php

use App\Enums\UserRole;

describe('UserRole', function () {
    it('has all expected cases', function () {
        expect(UserRole::cases())->toHaveCount(4);
        expect(UserRole::Admin->value)->toBe('admin');
        expect(UserRole::OrderManager->value)->toBe('order_manager');
        expect(UserRole::ContentManager->value)->toBe('content_manager');
        expect(UserRole::Customer->value)->toBe('customer');
    });

    it('can be created from string value', function () {
        expect(UserRole::from('admin'))->toBe(UserRole::Admin);
        expect(UserRole::from('order_manager'))->toBe(UserRole::OrderManager);
        expect(UserRole::from('content_manager'))->toBe(UserRole::ContentManager);
        expect(UserRole::from('customer'))->toBe(UserRole::Customer);
    });

    it('returns null for invalid value with tryFrom', function () {
        expect(UserRole::tryFrom('superuser'))->toBeNull();
    });

    it('returns correct Russian labels', function () {
        expect(UserRole::Admin->label())->toBe('Администратор');
        expect(UserRole::OrderManager->label())->toBe('Менеджер заказов');
        expect(UserRole::ContentManager->label())->toBe('Контент-менеджер');
        expect(UserRole::Customer->label())->toBe('Покупатель');
    });
});
