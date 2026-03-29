<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
});

describe('AuthController', function () {
    describe('POST /api/auth/login', function () {
        it('logs in with valid credentials', function () {
            $user = User::factory()->create([
                'password' => Hash::make('password123'),
            ]);

            $response = $this->postJson('/api/auth/login', [
                'email' => $user->email,
                'password' => 'password123',
            ]);

            $response->assertOk()
                ->assertJsonStructure([
                    'message',
                    'user' => ['id', 'name', 'email'],
                    'token',
                ]);
        });

        it('returns token on successful login', function () {
            $user = User::factory()->create([
                'password' => Hash::make('secret'),
            ]);

            $response = $this->postJson('/api/auth/login', [
                'email' => $user->email,
                'password' => 'secret',
            ]);

            $response->assertOk();
            expect($response->json('token'))->not->toBeNull();
        });

        it('rejects invalid password', function () {
            $user = User::factory()->create([
                'password' => Hash::make('correct'),
            ]);

            $response = $this->postJson('/api/auth/login', [
                'email' => $user->email,
                'password' => 'wrong',
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });

        it('rejects non-existent email', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'nobody@example.com',
                'password' => 'password',
            ]);

            $response->assertStatus(422);
        });

        it('validates required fields', function () {
            $response = $this->postJson('/api/auth/login', []);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'password']);
        });

        it('validates email format', function () {
            $response = $this->postJson('/api/auth/login', [
                'email' => 'not-an-email',
                'password' => 'password',
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });
    });

    describe('POST /api/auth/register', function () {
        it('registers a new user', function () {
            $response = $this->postJson('/api/auth/register', [
                'name' => 'Иван Иванов',
                'email' => 'ivan@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertCreated()
                ->assertJsonStructure([
                    'message',
                    'user' => ['id', 'name', 'email'],
                    'token',
                ]);

            $this->assertDatabaseHas('users', ['email' => 'ivan@example.com']);
        });

        it('assigns customer role on registration', function () {
            $this->postJson('/api/auth/register', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $user = User::where('email', 'test@example.com')->first();
            expect($user->hasRole('customer'))->toBeTrue();
        });

        it('rejects duplicate email', function () {
            User::factory()->create(['email' => 'taken@example.com']);

            $response = $this->postJson('/api/auth/register', [
                'name' => 'Another User',
                'email' => 'taken@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
        });

        it('rejects password confirmation mismatch', function () {
            $response = $this->postJson('/api/auth/register', [
                'name' => 'User',
                'email' => 'user@example.com',
                'password' => 'password123',
                'password_confirmation' => 'different',
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
        });

        it('rejects short password', function () {
            $response = $this->postJson('/api/auth/register', [
                'name' => 'User',
                'email' => 'user@example.com',
                'password' => 'short',
                'password_confirmation' => 'short',
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
        });

        it('accepts optional phone number', function () {
            $response = $this->postJson('/api/auth/register', [
                'name' => 'User',
                'email' => 'user@example.com',
                'phone' => '+7 900 123 4567',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);

            $response->assertCreated();
            $this->assertDatabaseHas('users', ['phone' => '+7 900 123 4567']);
        });
    });

    describe('POST /api/auth/logout', function () {
        it('logs out authenticated user', function () {
            $user = User::factory()->create();
            $token = $user->createToken('test-token')->plainTextToken;

            $response = $this->withHeaders(['Authorization' => 'Bearer '.$token])
                ->postJson('/api/auth/logout');

            $response->assertOk()
                ->assertJson(['message' => 'Выход выполнен']);
        });

        it('requires authentication', function () {
            $response = $this->postJson('/api/auth/logout');

            $response->assertStatus(401);
        });
    });

    describe('GET /api/auth/user', function () {
        it('returns current user info', function () {
            $user = User::factory()->create();

            $response = $this->actingAs($user)->getJson('/api/auth/user');

            $response->assertOk()
                ->assertJsonStructure([
                    'user' => ['id', 'name', 'email'],
                ]);

            expect($response->json('user.id'))->toBe($user->id);
        });

        it('requires authentication', function () {
            $response = $this->getJson('/api/auth/user');

            $response->assertStatus(401);
        });
    });
});
