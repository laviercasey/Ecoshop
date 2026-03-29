<?php

use App\Models\Order;

describe('Order model', function () {
    describe('generateNumber()', function () {
        it('generates a number matching expected format', function () {
            $number = Order::generateNumber();

            expect($number)->toMatch('/^ECO-\d{6}-\d{7}$/');
        });

        it('includes today date in the number', function () {
            $number = Order::generateNumber();
            $expectedDate = now()->format('ymd');

            expect($number)->toContain($expectedDate);
        });

        it('always starts with ECO prefix', function () {
            $number = Order::generateNumber();

            expect($number)->toStartWith('ECO-');
        });

        it('generates unique numbers across multiple calls', function () {
            $numbers = collect(range(1, 10))->map(fn () => Order::generateNumber())->all();

            expect(array_unique($numbers))->toHaveCount(10);
        });
    });
});
