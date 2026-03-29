<?php

use App\Mail\NewOrderAdminMail;
use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

describe('CheckoutController', function () {
    beforeEach(function () {
        Role::create(['name' => 'customer']);
    });

    describe('POST /api/checkout', function () {
        it('requires authentication', function () {
            $response = $this->postJson('/api/checkout', []);

            $response->assertStatus(401);
        });

        it('returns 422 when cart is empty', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)
                ->withSession(['cart' => []])
                ->postJson('/api/checkout', [
                    'customer_name' => 'Ivan Ivanov',
                    'customer_email' => 'ivan@example.com',
                    'shipping_method' => 'pickup',
                    'payment_method' => 'card',
                ]);

            $response->assertStatus(422)
                ->assertJson(['message' => 'Корзина пуста']);
        });

        it('creates order with pickup shipping', function () {
            Mail::fake();

            $user = User::factory()->create();
            $product = Product::factory()->create(['price' => 150.00]);

            $response = $this->actingAs($user)
                ->withSession(['cart' => [$product->id => 2]])
                ->postJson('/api/checkout', [
                    'customer_name' => 'Ivan Ivanov',
                    'customer_email' => 'ivan@example.com',
                    'shipping_method' => 'pickup',
                    'payment_method' => 'card',
                ]);

            $response->assertCreated()
                ->assertJsonStructure([
                    'message',
                    'order' => ['id', 'number', 'total', 'customer_email'],
                ]);

            expect($response->json('order.total'))->toBe(300);
            expect($response->json('order.customer_email'))->toBe('ivan@example.com');

            $this->assertDatabaseHas('orders', [
                'user_id' => $user->id,
                'total' => 300.00,
                'shipping_method' => 'pickup',
            ]);
        });

        it('creates order with delivery and address', function () {
            Mail::fake();

            $user = User::factory()->create();
            $product = Product::factory()->create(['price' => 200.00]);

            $response = $this->actingAs($user)
                ->withSession(['cart' => [$product->id => 1]])
                ->postJson('/api/checkout', [
                    'customer_name' => 'Anna Petrova',
                    'customer_email' => 'anna@example.com',
                    'shipping_method' => 'cdek',
                    'payment_method' => 'card',
                    'city' => 'Moscow',
                    'street' => 'Lenina',
                    'building' => '10',
                    'apartment' => '5',
                    'postal_code' => '123456',
                ]);

            $response->assertCreated();

            $order = Order::where('customer_email', 'anna@example.com')->first();
            expect($order)->not->toBeNull();
            expect($order->shipping_address)->not->toBeNull();
            expect($order->shipping_address['city'])->toBe('Moscow');
            expect($order->shipping_address['street'])->toBe('Lenina');
        });

        it('validates required fields', function () {
            $user = User::factory()->create();
            $product = Product::factory()->create();

            $response = $this->actingAs($user)
                ->withSession(['cart' => [$product->id => 1]])
                ->postJson('/api/checkout', []);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['customer_name', 'customer_email', 'shipping_method', 'payment_method']);
        });

        it('requires city and street for non-pickup shipping', function () {
            $user = User::factory()->create();
            $product = Product::factory()->create();

            $response = $this->actingAs($user)
                ->withSession(['cart' => [$product->id => 1]])
                ->postJson('/api/checkout', [
                    'customer_name' => 'Ivan Ivanov',
                    'customer_email' => 'ivan@example.com',
                    'shipping_method' => 'cdek',
                    'payment_method' => 'card',
                ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['city', 'street']);
        });

        it('sends confirmation emails', function () {
            Mail::fake();

            $user = User::factory()->create();
            $product = Product::factory()->create(['price' => 100.00]);

            $this->actingAs($user)
                ->withSession(['cart' => [$product->id => 1]])
                ->postJson('/api/checkout', [
                    'customer_name' => 'Ivan Ivanov',
                    'customer_email' => 'ivan@example.com',
                    'shipping_method' => 'pickup',
                    'payment_method' => 'card',
                ]);

            Mail::assertSent(OrderConfirmationMail::class);
            Mail::assertSent(NewOrderAdminMail::class);
        });

        it('clears cart after successful order', function () {
            Mail::fake();

            $user = User::factory()->create();
            $product = Product::factory()->create();

            $this->actingAs($user)
                ->withSession(['cart' => [$product->id => 1]])
                ->postJson('/api/checkout', [
                    'customer_name' => 'Ivan Ivanov',
                    'customer_email' => 'ivan@example.com',
                    'shipping_method' => 'pickup',
                    'payment_method' => 'card',
                ]);

            expect(session('cart'))->toBeNull();
        });
    });

    describe('GET /api/checkout/success/{order}', function () {
        it('returns order info', function () {
            $user = User::factory()->create();
            $order = Order::factory()->create(['user_id' => $user->id]);

            $response = $this->actingAs($user)
                ->getJson("/api/checkout/success/{$order->id}");

            $response->assertOk()
                ->assertJsonStructure([
                    'order' => ['number', 'total', 'customer_email'],
                ]);

            expect($response->json('order.number'))->toBe($order->number);
        });

        it('requires authentication', function () {
            $order = Order::factory()->create();

            $response = $this->getJson("/api/checkout/success/{$order->id}");

            $response->assertStatus(401);
        });

        it('returns 404 for another user order', function () {
            $owner = User::factory()->create();
            $other = User::factory()->create();
            $order = Order::factory()->create(['user_id' => $owner->id]);

            $response = $this->actingAs($other)
                ->getJson("/api/checkout/success/{$order->id}");

            $response->assertStatus(404);
        });
    });
});
