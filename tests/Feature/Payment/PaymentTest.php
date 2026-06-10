<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'customer']);
    config()->set('services.yookassa.shop_id', 'test-shop');
    config()->set('services.yookassa.secret_key', 'test-secret');
});

describe('Checkout payment', function () {
    it('returns payment url and marks order pending payment for card', function () {
        Mail::fake();
        Http::fake([
            'api.yookassa.ru/v3/payments' => Http::response([
                'id' => 'pay-123',
                'status' => 'pending',
                'confirmation' => ['confirmation_url' => 'https://yookassa.test/pay'],
            ]),
        ]);

        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 100.00]);

        $response = $this->actingAs($user)
            ->withSession(['cart' => [$product->id => 1]])
            ->postJson('/api/checkout', [
                'customer_name' => 'Ivan Ivanov',
                'customer_email' => 'ivan@example.com',
                'shipping_method' => 'pickup',
                'payment_method' => 'card',
            ]);

        $response->assertCreated()
            ->assertJsonPath('payment_url', 'https://yookassa.test/pay');

        $order = Order::first();
        expect($order->status)->toBe(OrderStatus::PendingPayment);
        expect($order->payment_id)->toBe('pay-123');
    });

    it('does not request payment for cash orders', function () {
        Mail::fake();
        Http::fake();

        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 100.00]);

        $response = $this->actingAs($user)
            ->withSession(['cart' => [$product->id => 1]])
            ->postJson('/api/checkout', [
                'customer_name' => 'Ivan Ivanov',
                'customer_email' => 'ivan@example.com',
                'shipping_method' => 'pickup',
                'payment_method' => 'cash',
            ]);

        $response->assertCreated()
            ->assertJsonPath('payment_url', null);

        expect(Order::first()->status)->toBe(OrderStatus::New);
        Http::assertNothingSent();
    });

    it('keeps order when gateway is not configured', function () {
        Mail::fake();
        Http::fake();
        config()->set('services.yookassa.shop_id', null);

        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 100.00]);

        $response = $this->actingAs($user)
            ->withSession(['cart' => [$product->id => 1]])
            ->postJson('/api/checkout', [
                'customer_name' => 'Ivan Ivanov',
                'customer_email' => 'ivan@example.com',
                'shipping_method' => 'pickup',
                'payment_method' => 'card',
            ]);

        $response->assertCreated()
            ->assertJsonPath('payment_url', null);

        expect(Order::first()->status)->toBe(OrderStatus::New);
        Http::assertNothingSent();
    });

    it('keeps order when gateway request fails', function () {
        Mail::fake();
        Http::fake([
            'api.yookassa.ru/v3/payments' => Http::response(['type' => 'error'], 500),
        ]);

        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 100.00]);

        $response = $this->actingAs($user)
            ->withSession(['cart' => [$product->id => 1]])
            ->postJson('/api/checkout', [
                'customer_name' => 'Ivan Ivanov',
                'customer_email' => 'ivan@example.com',
                'shipping_method' => 'pickup',
                'payment_method' => 'card',
            ]);

        $response->assertCreated()
            ->assertJsonPath('payment_url', null);

        expect(Order::first()->status)->toBe(OrderStatus::New);
    });
});

describe('POST /api/payments/yookassa/webhook', function () {
    it('marks order as paid on succeeded payment', function () {
        Http::fake([
            'api.yookassa.ru/v3/payments/pay-123' => Http::response([
                'id' => 'pay-123',
                'status' => 'succeeded',
            ]),
        ]);

        $order = Order::factory()->create([
            'status' => OrderStatus::PendingPayment,
            'payment_id' => 'pay-123',
        ]);

        $this->postJson('/api/payments/yookassa/webhook', [
            'event' => 'payment.succeeded',
            'object' => ['id' => 'pay-123'],
        ])->assertOk();

        $order->refresh();
        expect($order->status)->toBe(OrderStatus::Paid);
        expect($order->paid_at)->not->toBeNull();
        expect($order->statusHistory()->count())->toBe(1);
    });

    it('is idempotent for already paid orders', function () {
        Http::fake([
            'api.yookassa.ru/v3/payments/pay-123' => Http::response([
                'id' => 'pay-123',
                'status' => 'succeeded',
            ]),
        ]);

        $order = Order::factory()->create([
            'status' => OrderStatus::Paid,
            'payment_id' => 'pay-123',
            'paid_at' => now(),
        ]);

        $this->postJson('/api/payments/yookassa/webhook', [
            'event' => 'payment.succeeded',
            'object' => ['id' => 'pay-123'],
        ])->assertOk();

        expect($order->refresh()->statusHistory()->count())->toBe(0);
    });

    it('returns order to new on canceled payment', function () {
        Http::fake([
            'api.yookassa.ru/v3/payments/pay-123' => Http::response([
                'id' => 'pay-123',
                'status' => 'canceled',
            ]),
        ]);

        $order = Order::factory()->create([
            'status' => OrderStatus::PendingPayment,
            'payment_id' => 'pay-123',
        ]);

        $this->postJson('/api/payments/yookassa/webhook', [
            'event' => 'payment.canceled',
            'object' => ['id' => 'pay-123'],
        ])->assertOk();

        expect($order->refresh()->status)->toBe(OrderStatus::New);
    });

    it('ignores unknown payment ids', function () {
        Http::fake();

        $this->postJson('/api/payments/yookassa/webhook', [
            'event' => 'payment.succeeded',
            'object' => ['id' => 'unknown'],
        ])->assertOk();

        Http::assertNothingSent();
    });

    it('rejects malformed notifications', function () {
        $this->postJson('/api/payments/yookassa/webhook', [
            'event' => 'payment.succeeded',
        ])->assertStatus(400);
    });
});
