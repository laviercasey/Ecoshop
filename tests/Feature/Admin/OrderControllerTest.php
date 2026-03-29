<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'admin']);
    Role::create(['name' => 'customer']);
});

function makeAdminForOrders(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');
    return $user;
}

describe('Admin\OrderController', function () {
    describe('GET /api/admin/orders', function () {
        it('requires admin role', function () {
            $user = User::factory()->create();
            $user->assignRole('customer');

            $this->actingAs($user)
                ->getJson('/api/admin/orders')
                ->assertStatus(403);
        });

        it('returns paginated orders list', function () {
            $admin = makeAdminForOrders();
            Order::factory()->count(3)->create();

            $this->actingAs($admin)
                ->getJson('/api/admin/orders')
                ->assertOk()
                ->assertJsonStructure([
                    'orders',
                    'meta' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total',
                    ],
                ])
                ->assertJsonPath('meta.total', 3);
        });

        it('filters by status', function () {
            $admin = makeAdminForOrders();
            Order::factory()->count(2)->create(['status' => OrderStatus::New]);
            Order::factory()->count(3)->processing()->create();

            $this->actingAs($admin)
                ->getJson('/api/admin/orders?status=processing')
                ->assertOk()
                ->assertJsonPath('meta.total', 3);
        });

        it('searches by order number', function () {
            $admin = makeAdminForOrders();
            $order = Order::factory()->create(['number' => 'ECO-260101-99999']);
            Order::factory()->count(2)->create();

            $this->actingAs($admin)
                ->getJson('/api/admin/orders?search=99999')
                ->assertOk()
                ->assertJsonPath('meta.total', 1)
                ->assertJsonPath('orders.0.number', 'ECO-260101-99999');
        });

        it('searches by customer name', function () {
            $admin = makeAdminForOrders();
            Order::factory()->create(['customer_name' => 'Иван Иванов']);
            Order::factory()->count(2)->create(['customer_name' => 'Пётр Петров']);

            $this->actingAs($admin)
                ->getJson('/api/admin/orders?search=Иван')
                ->assertOk()
                ->assertJsonPath('meta.total', 1)
                ->assertJsonPath('orders.0.customer_name', 'Иван Иванов');
        });

        it('returns meta pagination info', function () {
            $admin = makeAdminForOrders();
            Order::factory()->count(5)->create();

            $response = $this->actingAs($admin)
                ->getJson('/api/admin/orders')
                ->assertOk();

            expect($response->json('meta.current_page'))->toBe(1);
            expect($response->json('meta.per_page'))->toBe(15);
            expect($response->json('meta.total'))->toBe(5);
        });
    });

    describe('GET /api/admin/orders/{id}', function () {
        it('returns order details', function () {
            $admin = makeAdminForOrders();
            $order = Order::factory()->create();

            $this->actingAs($admin)
                ->getJson("/api/admin/orders/{$order->id}")
                ->assertOk()
                ->assertJsonStructure([
                    'order' => [
                        'id',
                        'number',
                        'status',
                        'total',
                    ],
                ])
                ->assertJsonPath('order.id', $order->id);
        });

        it('returns 404 for nonexistent order', function () {
            $admin = makeAdminForOrders();

            $this->actingAs($admin)
                ->getJson('/api/admin/orders/99999')
                ->assertStatus(404);
        });
    });

    describe('PATCH /api/admin/orders/{id}/status', function () {
        it('updates order status', function () {
            $admin = makeAdminForOrders();
            $order = Order::factory()->create(['status' => OrderStatus::New]);

            $this->actingAs($admin)
                ->patchJson("/api/admin/orders/{$order->id}/status", [
                    'status' => 'processing',
                ])
                ->assertOk()
                ->assertJsonPath('message', 'Статус заказа обновлён')
                ->assertJsonPath('order.status', 'processing');

            expect($order->fresh()->status)->toBe(OrderStatus::Processing);
        });

        it('creates status history record', function () {
            $admin = makeAdminForOrders();
            $order = Order::factory()->create(['status' => OrderStatus::New]);

            $this->actingAs($admin)
                ->patchJson("/api/admin/orders/{$order->id}/status", [
                    'status' => 'shipped',
                    'comment' => 'Отправлен почтой',
                    'tracking_number' => 'TRK123456',
                ]);

            expect(
                OrderStatusHistory::where('order_id', $order->id)->count()
            )->toBe(1);

            $history = OrderStatusHistory::where('order_id', $order->id)->first();
            expect($history->old_status)->toBe(OrderStatus::New);
            expect($history->new_status)->toBe(OrderStatus::Shipped);
            expect($history->comment)->toBe('Отправлен почтой');
        });

        it('validates status enum value', function () {
            $admin = makeAdminForOrders();
            $order = Order::factory()->create();

            $this->actingAs($admin)
                ->patchJson("/api/admin/orders/{$order->id}/status", [
                    'status' => 'invalid_status',
                ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['status']);
        });

        it('returns 404 for nonexistent order', function () {
            $admin = makeAdminForOrders();

            $this->actingAs($admin)
                ->patchJson('/api/admin/orders/99999/status', [
                    'status' => 'processing',
                ])
                ->assertStatus(404);
        });
    });
});
