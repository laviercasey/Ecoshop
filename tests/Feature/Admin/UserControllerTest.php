<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'admin']);
    Role::create(['name' => 'order_manager']);
    Role::create(['name' => 'content_manager']);
    Role::create(['name' => 'customer']);
});

function makeAdminForUsers(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');
    return $user;
}

describe('Admin\UserController', function () {
    describe('GET /api/admin/users', function () {
        it('requires admin role', function () {
            $user = User::factory()->create();
            $user->assignRole('customer');

            $this->actingAs($user)
                ->getJson('/api/admin/users')
                ->assertStatus(403);
        });

        it('returns paginated users list', function () {
            $admin = makeAdminForUsers();
            User::factory()->count(3)->create();

            $response = $this->actingAs($admin)
                ->getJson('/api/admin/users')
                ->assertOk()
                ->assertJsonStructure([
                    'users',
                ]);

            expect($response->json('users'))->toHaveCount(4);
        });

        it('searches by name', function () {
            $admin = makeAdminForUsers();
            User::factory()->create(['name' => 'Особый Пользователь']);
            User::factory()->count(2)->create(['name' => 'Обычный Пользователь']);

            $this->actingAs($admin)
                ->getJson('/api/admin/users?search=Особый')
                ->assertOk()
                ->assertJsonCount(1, 'users');
        });

        it('searches by email', function () {
            $admin = makeAdminForUsers();
            User::factory()->create(['email' => 'findme@example.com']);
            User::factory()->count(2)->create();

            $this->actingAs($admin)
                ->getJson('/api/admin/users?search=findme@example.com')
                ->assertOk()
                ->assertJsonCount(1, 'users');
        });

        it('filters by role', function () {
            $admin = makeAdminForUsers();

            $manager1 = User::factory()->create();
            $manager1->assignRole('order_manager');

            $manager2 = User::factory()->create();
            $manager2->assignRole('order_manager');

            $customer = User::factory()->create();
            $customer->assignRole('customer');

            $this->actingAs($admin)
                ->getJson('/api/admin/users?role=order_manager')
                ->assertOk()
                ->assertJsonCount(2, 'users');
        });
    });

    describe('POST /api/admin/users', function () {
        it('creates new user with role', function () {
            $admin = makeAdminForUsers();

            $this->actingAs($admin)
                ->postJson('/api/admin/users', [
                    'name'                  => 'Новый Менеджер',
                    'email'                 => 'newmanager@example.com',
                    'password'              => 'password123',
                    'password_confirmation' => 'password123',
                    'role'                  => 'order_manager',
                ])
                ->assertStatus(201)
                ->assertJsonPath('message', 'Пользователь создан')
                ->assertJsonPath('user.name', 'Новый Менеджер')
                ->assertJsonPath('user.email', 'newmanager@example.com');

            $created = User::where('email', 'newmanager@example.com')->first();
            expect($created)->not->toBeNull();
            expect($created->hasRole('order_manager'))->toBeTrue();
        });

        it('validates required fields', function () {
            $admin = makeAdminForUsers();

            $this->actingAs($admin)
                ->postJson('/api/admin/users', [])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
        });

        it('rejects duplicate email', function () {
            $admin = makeAdminForUsers();
            User::factory()->create(['email' => 'taken@example.com']);

            $this->actingAs($admin)
                ->postJson('/api/admin/users', [
                    'name'     => 'Someone',
                    'email'    => 'taken@example.com',
                    'password' => 'password123',
                    'role'     => 'customer',
                ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });

        it('rejects invalid role', function () {
            $admin = makeAdminForUsers();

            $this->actingAs($admin)
                ->postJson('/api/admin/users', [
                    'name'     => 'Test User',
                    'email'    => 'testuser@example.com',
                    'password' => 'password123',
                    'role'     => 'superadmin',
                ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['role']);
        });
    });

    describe('PUT /api/admin/users/{id}', function () {
        it('updates user name', function () {
            $admin = makeAdminForUsers();
            $user = User::factory()->create(['name' => 'Старое Имя']);

            $this->actingAs($admin)
                ->putJson("/api/admin/users/{$user->id}", [
                    'name' => 'Новое Имя',
                ])
                ->assertOk()
                ->assertJsonPath('message', 'Пользователь обновлён')
                ->assertJsonPath('user.name', 'Новое Имя');

            expect($user->fresh()->name)->toBe('Новое Имя');
        });

        it('updates user role', function () {
            $admin = makeAdminForUsers();
            $user = User::factory()->create();
            $user->assignRole('customer');

            $this->actingAs($admin)
                ->putJson("/api/admin/users/{$user->id}", [
                    'role' => 'order_manager',
                ])
                ->assertOk()
                ->assertJsonPath('message', 'Пользователь обновлён');

            $user->refresh();
            expect($user->hasRole('order_manager'))->toBeTrue();
            expect($user->hasRole('customer'))->toBeFalse();
        });

        it('returns 404 for nonexistent user', function () {
            $admin = makeAdminForUsers();

            $this->actingAs($admin)
                ->putJson('/api/admin/users/99999', [
                    'name' => 'Ghost',
                ])
                ->assertStatus(404);
        });

        it('rejects duplicate email on update', function () {
            $admin = makeAdminForUsers();
            User::factory()->create(['email' => 'existing@example.com']);
            $user = User::factory()->create(['email' => 'original@example.com']);

            $this->actingAs($admin)
                ->putJson("/api/admin/users/{$user->id}", [
                    'email' => 'existing@example.com',
                ])
                ->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });
    });

    describe('DELETE /api/admin/users/{id}', function () {
        it('successfully deletes a user without orders', function () {
            $admin = makeAdminForUsers();
            $user = User::factory()->create();
            $user->assignRole('customer');

            $this->actingAs($admin)
                ->deleteJson("/api/admin/users/{$user->id}")
                ->assertStatus(204);

            expect(User::find($user->id))->toBeNull();
        });

        it('prevents self-deletion', function () {
            $admin = makeAdminForUsers();

            $this->actingAs($admin)
                ->deleteJson("/api/admin/users/{$admin->id}")
                ->assertStatus(422)
                ->assertJsonPath('message', 'Нельзя удалить собственный аккаунт');
        });

        it('prevents deleting the last administrator', function () {
            $admin = makeAdminForUsers();
            $this->actingAs($admin)
                ->deleteJson("/api/admin/users/{$admin->id}")
                ->assertStatus(422);
        });

        it('allows deleting an admin when another admin exists', function () {
            $admin1 = makeAdminForUsers();
            $admin2 = User::factory()->create();
            $admin2->assignRole('admin');

            $this->actingAs($admin1)
                ->deleteJson("/api/admin/users/{$admin2->id}")
                ->assertStatus(204);
        });

        it('prevents deleting a user with orders', function () {
            $admin = makeAdminForUsers();
            $customer = User::factory()->create();
            $customer->assignRole('customer');

            \App\Models\Order::factory()->create(['user_id' => $customer->id]);

            $this->actingAs($admin)
                ->deleteJson("/api/admin/users/{$customer->id}")
                ->assertStatus(422)
                ->assertJsonPath('message', 'Нельзя удалить пользователя с историей заказов');
        });

        it('returns 404 for nonexistent user', function () {
            $admin = makeAdminForUsers();

            $this->actingAs($admin)
                ->deleteJson('/api/admin/users/99999')
                ->assertStatus(404);
        });

        it('requires admin role', function () {
            $admin = makeAdminForUsers();
            $customer = User::factory()->create();
            $customer->assignRole('customer');

            $this->actingAs($customer)
                ->deleteJson("/api/admin/users/{$admin->id}")
                ->assertStatus(403);
        });
    });
});
