<?php

use App\Enums\ShippingMethod;

describe('ShippingMethod', function () {
    it('has all expected cases', function () {
        expect(ShippingMethod::cases())->toHaveCount(3);
        expect(ShippingMethod::Cdek->value)->toBe('cdek');
        expect(ShippingMethod::Pickup->value)->toBe('pickup');
        expect(ShippingMethod::RussianPost->value)->toBe('russian_post');
    });

    it('can be created from string value', function () {
        expect(ShippingMethod::from('cdek'))->toBe(ShippingMethod::Cdek);
        expect(ShippingMethod::from('pickup'))->toBe(ShippingMethod::Pickup);
        expect(ShippingMethod::from('russian_post'))->toBe(ShippingMethod::RussianPost);
    });

    it('returns null for invalid value with tryFrom', function () {
        expect(ShippingMethod::tryFrom('dhl'))->toBeNull();
    });

    it('returns correct Russian labels', function () {
        expect(ShippingMethod::Cdek->label())->toBe('СДЭК');
        expect(ShippingMethod::Pickup->label())->toBe('Самовывоз');
        expect(ShippingMethod::RussianPost->label())->toBe('Почта России');
    });
});
