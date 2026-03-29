<?php

use App\Models\Product;

describe('Product model', function () {
    describe('hasDiscount()', function () {
        it('returns true when compare_price is greater than price', function () {
            $product = new Product([
                'price' => '100.00',
                'compare_price' => '120.00',
            ]);

            expect($product->hasDiscount())->toBeTrue();
        });

        it('returns false when compare_price is null', function () {
            $product = new Product([
                'price' => '100.00',
                'compare_price' => null,
            ]);

            expect($product->hasDiscount())->toBeFalse();
        });

        it('returns false when compare_price equals price', function () {
            $product = new Product([
                'price' => '100.00',
                'compare_price' => '100.00',
            ]);

            expect($product->hasDiscount())->toBeFalse();
        });

        it('returns false when compare_price is less than price', function () {
            $product = new Product([
                'price' => '120.00',
                'compare_price' => '100.00',
            ]);

            expect($product->hasDiscount())->toBeFalse();
        });
    });

    describe('discountPercent()', function () {
        it('returns correct percentage', function () {
            $product = new Product([
                'price' => '80.00',
                'compare_price' => '100.00',
            ]);

            expect($product->discountPercent())->toBe(20);
        });

        it('returns 0 when no discount', function () {
            $product = new Product([
                'price' => '100.00',
                'compare_price' => null,
            ]);

            expect($product->discountPercent())->toBe(0);
        });

        it('rounds percentage correctly', function () {
            $product = new Product([
                'price' => '67.00',
                'compare_price' => '100.00',
            ]);

            expect($product->discountPercent())->toBe(33);
        });

        it('returns 0 when compare_price is lower than price', function () {
            $product = new Product([
                'price' => '110.00',
                'compare_price' => '100.00',
            ]);

            expect($product->discountPercent())->toBe(0);
        });
    });
});
