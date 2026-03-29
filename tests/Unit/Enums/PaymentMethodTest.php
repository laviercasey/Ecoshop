<?php

use App\Enums\PaymentMethod;

describe('PaymentMethod', function () {
    it('has all expected cases', function () {
        expect(PaymentMethod::cases())->toHaveCount(3);
        expect(PaymentMethod::Card->value)->toBe('card');
        expect(PaymentMethod::Cash->value)->toBe('cash');
        expect(PaymentMethod::Sbp->value)->toBe('sbp');
    });

    it('can be created from string value', function () {
        expect(PaymentMethod::from('card'))->toBe(PaymentMethod::Card);
        expect(PaymentMethod::from('cash'))->toBe(PaymentMethod::Cash);
        expect(PaymentMethod::from('sbp'))->toBe(PaymentMethod::Sbp);
    });

    it('returns null for invalid value with tryFrom', function () {
        expect(PaymentMethod::tryFrom('bitcoin'))->toBeNull();
    });

    it('returns correct Russian labels', function () {
        expect(PaymentMethod::Card->label())->toBe('Банковская карта');
        expect(PaymentMethod::Cash->label())->toBe('Наличные');
        expect(PaymentMethod::Sbp->label())->toBe('СБП');
    });
});
