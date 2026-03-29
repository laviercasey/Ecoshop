<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'admin']);
    Role::create(['name' => 'customer']);
});

function makeAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

describe('Admin\DashboardController', function () {
    describe('GET /api/admin/dashboard', function () {
        it('requires authentication', function () {
            $this->getJson('/api/admin/dashboard')
                ->assertStatus(401);
        });

        it('requires admin role', function () {
            $user = User::factory()->create();
            $user->assignRole('customer');

            $this->actingAs($user)
                ->getJson('/api/admin/dashboard')
                ->assertStatus(403);
        });

        it('returns stats structure', function () {
            $admin = makeAdmin();

            $this->actingAs($admin)
                ->getJson('/api/admin/dashboard')
                ->assertOk()
                ->assertJsonStructure([
                    'stats' => [
                        'revenue',
                        'revenue_change',
                        'orders_this_month',
                        'new_orders',
                        'customers_this_month',
                        'total_customers',
                        'average_order',
                    ],
                ]);
        });

        it('returns recentOrders array', function () {
            $admin = makeAdmin();
            Order::factory()->count(3)->create();

            $this->actingAs($admin)
                ->getJson('/api/admin/dashboard')
                ->assertOk()
                ->assertJsonStructure([
                    'recentOrders' => [
                        '*' => [
                            'id',
                            'number',
                            'customer_name',
                            'total',
                            'status',
                            'status_label',
                            'status_color',
                            'created_at',
                        ],
                    ],
                ]);
        });

        it('returns topProducts array', function () {
            $admin = makeAdmin();

            $this->actingAs($admin)
                ->getJson('/api/admin/dashboard')
                ->assertOk()
                ->assertJsonStructure([
                    'topProducts',
                ]);

            $response = $this->actingAs($admin)->getJson('/api/admin/dashboard');
            expect($response->json('topProducts'))->toBeArray();
        });

        it('counts new orders correctly', function () {
            $admin = makeAdmin();

            Order::factory()->count(3)->create(['status' => OrderStatus::New]);
            Order::factory()->count(2)->processing()->create();

            $this->actingAs($admin)
                ->getJson('/api/admin/dashboard')
                ->assertOk()
                ->assertJsonPath('stats.new_orders', 3);
        });

        it('counts total customers correctly', function () {
            $admin = makeAdmin();

            $customer1 = User::factory()->create();
            $customer1->assignRole('customer');

            $customer2 = User::factory()->create();
            $customer2->assignRole('customer');

            $this->actingAs($admin)
                ->getJson('/api/admin/dashboard')
                ->assertOk()
                ->assertJsonPath('stats.total_customers', 2);
        });
    });
});
