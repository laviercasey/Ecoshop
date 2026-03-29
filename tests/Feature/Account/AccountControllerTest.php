<?php

use App\Models\Order;
use App\Models\User;
use Spatie\Permission\Models\Role;

describe('AccountController', function () {
    beforeEach(function () {
        Role::create(['name' => 'customer']);
    });

    describe('GET /api/account/orders', function () {
        it('requires authentication', function () {
            $response = $this->getJson('/api/account/orders');

            $response->assertStatus(401);
        });

        it('returns orders for authenticated user', function () {
            $user = User::factory()->create();
            Order::factory()->count(3)->create(['user_id' => $user->id]);

            $response = $this->actingAs($user)->getJson('/api/account/orders');

            $response->assertOk()
                ->assertJsonStructure(['orders']);

            expect($response->json('orders'))->toHaveCount(3);
        });

        it('returns empty orders for user with no orders', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)->getJson('/api/account/orders');

            $response->assertOk();
            expect($response->json('orders'))->toHaveCount(0);
        });

        it('returns only current users orders', function () {
            $user = User::factory()->create();
            $otherUser = User::factory()->create();

            $userOrders = Order::factory()->count(2)->create(['user_id' => $user->id]);
            Order::factory()->count(5)->create(['user_id' => $otherUser->id]);

            $response = $this->actingAs($user)->getJson('/api/account/orders');

            $response->assertOk();
            expect($response->json('orders'))->toHaveCount(2);

            $returnedIds = array_column($response->json('orders'), 'id');
            $expectedIds = $userOrders->pluck('id')->sort()->values()->toArray();
            sort($returnedIds);
            expect($returnedIds)->toBe($expectedIds);
        });
    });

    describe('GET /api/account/orders/{order}', function () {
        it('requires authentication', function () {
            $order = Order::factory()->create();

            $response = $this->getJson("/api/account/orders/{$order->id}");

            $response->assertStatus(401);
        });

        it('returns order details for owner', function () {
            $user = User::factory()->create();
            $order = Order::factory()->create(['user_id' => $user->id]);

            $response = $this->actingAs($user)->getJson("/api/account/orders/{$order->id}");

            $response->assertOk()
                ->assertJsonStructure(['order']);

            expect($response->json('order.id'))->toBe($order->id);
        });

        it('returns 403 for another users order', function () {
            $user = User::factory()->create();
            $otherUser = User::factory()->create();
            $order = Order::factory()->create(['user_id' => $otherUser->id]);

            $response = $this->actingAs($user)->getJson("/api/account/orders/{$order->id}");

            $response->assertStatus(404);
        });
    });
});
