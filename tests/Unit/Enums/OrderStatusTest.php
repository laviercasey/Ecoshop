<?php

use App\Enums\OrderStatus;

describe('OrderStatus', function () {
    it('has all expected cases', function () {
        expect(OrderStatus::cases())->toHaveCount(5);
        expect(OrderStatus::New->value)->toBe('new');
        expect(OrderStatus::Processing->value)->toBe('processing');
        expect(OrderStatus::Shipped->value)->toBe('shipped');
        expect(OrderStatus::Delivered->value)->toBe('delivered');
        expect(OrderStatus::Cancelled->value)->toBe('cancelled');
    });

    it('can be created from string value', function () {
        expect(OrderStatus::from('new'))->toBe(OrderStatus::New);
        expect(OrderStatus::from('processing'))->toBe(OrderStatus::Processing);
        expect(OrderStatus::from('shipped'))->toBe(OrderStatus::Shipped);
        expect(OrderStatus::from('delivered'))->toBe(OrderStatus::Delivered);
        expect(OrderStatus::from('cancelled'))->toBe(OrderStatus::Cancelled);
    });

    it('returns null for invalid value with tryFrom', function () {
        expect(OrderStatus::tryFrom('invalid'))->toBeNull();
        expect(OrderStatus::tryFrom(''))->toBeNull();
    });

    it('returns correct Russian labels', function () {
        expect(OrderStatus::New->label())->toBe('Новый');
        expect(OrderStatus::Processing->label())->toBe('В обработке');
        expect(OrderStatus::Shipped->label())->toBe('Отправлен');
        expect(OrderStatus::Delivered->label())->toBe('Доставлен');
        expect(OrderStatus::Cancelled->label())->toBe('Отменён');
    });

    it('returns correct color codes', function () {
        expect(OrderStatus::New->color())->toBe('info');
        expect(OrderStatus::Processing->color())->toBe('warning');
        expect(OrderStatus::Shipped->color())->toBe('primary');
        expect(OrderStatus::Delivered->color())->toBe('success');
        expect(OrderStatus::Cancelled->color())->toBe('danger');
    });
});
