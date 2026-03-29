<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'admin']);
});

function makeProductAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

describe('Admin\ProductController', function () {

    describe('GET /api/admin/products', function () {

        it('requires admin role', function () {
            $user = User::factory()->create();

            $this->actingAs($user, 'sanctum')
                ->getJson('/api/admin/products')
                ->assertStatus(403)
                ->assertJson(['message' => 'Доступ запрещён']);
        });

        it('returns paginated products list', function () {
            $admin = makeProductAdmin();
            Product::factory()->count(3)->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/products');

            $response->assertOk()
                ->assertJsonStructure([
                    'products' => [
                        '*' => ['id', 'name', 'slug', 'price', 'stock', 'is_published'],
                    ],
                ]);

            expect($response->json('products'))->toHaveCount(3);
        });

        it('searches by product name', function () {
            $admin = makeProductAdmin();
            Product::factory()->create(['name' => 'Eco Bamboo Toothbrush']);
            Product::factory()->create(['name' => 'Reusable Water Bottle']);

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/products?search=Bamboo');

            $response->assertOk();
            expect($response->json('products'))->toHaveCount(1);
            expect($response->json('products.0.name'))->toBe('Eco Bamboo Toothbrush');
        });

        it('searches by sku', function () {
            $admin = makeProductAdmin();
            $target = Product::factory()->create(['sku' => 'ECO-ABC-123']);
            Product::factory()->create(['sku' => 'ECO-XYZ-999']);

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/products?search=ABC-123');

            $response->assertOk();
            expect($response->json('products'))->toHaveCount(1);
            expect($response->json('products.0.id'))->toBe($target->id);
        });

        it('filters by is_published=true', function () {
            $admin = makeProductAdmin();
            Product::factory()->count(2)->create(['is_published' => true]);
            Product::factory()->unpublished()->count(3)->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/products?is_published=true');

            $response->assertOk();
            expect($response->json('products'))->toHaveCount(2);
        });

        it('filters by is_published=false', function () {
            $admin = makeProductAdmin();
            Product::factory()->count(2)->create(['is_published' => true]);
            Product::factory()->unpublished()->count(3)->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/products?is_published=false');

            $response->assertOk();
            expect($response->json('products'))->toHaveCount(3);
        });

    });

    describe('POST /api/admin/products', function () {

        it('creates a product', function () {
            $admin = makeProductAdmin();

            $payload = [
                'name' => 'Organic Cotton Bag',
                'sku' => 'ECO-BAG-001',
                'description' => 'Eco-friendly cotton bag',
                'price' => 12.99,
                'stock' => 50,
                'is_published' => true,
            ];

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/products', $payload);

            $response->assertStatus(201)
                ->assertJson([
                    'message' => 'Товар создан',
                    'product' => [
                        'name' => 'Organic Cotton Bag',
                        'sku' => 'ECO-BAG-001',
                        'price' => 12.99,
                    ],
                ]);

            $this->assertDatabaseHas('products', ['name' => 'Organic Cotton Bag', 'sku' => 'ECO-BAG-001']);
        });

        it('creates a product with category', function () {
            $admin = makeProductAdmin();
            $category = Category::factory()->create();

            $payload = [
                'name' => 'Bamboo Cutlery Set',
                'sku' => 'ECO-BCT-001',
                'price' => 8.50,
                'categories' => [$category->id],
            ];

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/products', $payload);

            $response->assertStatus(201)
                ->assertJson(['message' => 'Товар создан']);

            $productId = $response->json('product.id');
            $product = Product::find($productId);

            expect($product->categories->pluck('id')->toArray())->toContain($category->id);
        });

        it('validates required fields', function () {
            $admin = makeProductAdmin();

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/products', []);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'price']);
        });

        it('validates price is non-negative', function () {
            $admin = makeProductAdmin();

            $payload = [
                'name' => 'Bad Product',
                'price' => -5.00,
            ];

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/products', $payload);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['price']);
        });

    });

    describe('GET /api/admin/products/{id}', function () {

        it('returns product details', function () {
            $admin = makeProductAdmin();
            $product = Product::factory()->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson("/api/admin/products/{$product->id}");

            $response->assertOk()
                ->assertJsonStructure([
                    'product' => [
                        'id', 'name', 'slug', 'sku', 'price', 'stock',
                        'is_published', 'images', 'categories', 'attributes',
                    ],
                ])
                ->assertJson([
                    'product' => ['id' => $product->id, 'name' => $product->name],
                ]);
        });

        it('returns 404 for nonexistent product', function () {
            $admin = makeProductAdmin();

            $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/products/99999')
                ->assertNotFound();
        });

    });

    describe('PUT /api/admin/products/{id}', function () {

        it('updates product name and price', function () {
            $admin = makeProductAdmin();
            $product = Product::factory()->create(['name' => 'Old Name', 'price' => 10.00]);

            $response = $this->actingAs($admin, 'sanctum')
                ->putJson("/api/admin/products/{$product->id}", [
                    'name' => 'New Name',
                    'price' => 25.00,
                ]);

            $response->assertOk()
                ->assertJson([
                    'message' => 'Товар обновлён',
                    'product' => ['name' => 'New Name', 'price' => 25.00],
                ]);

            $this->assertDatabaseHas('products', [
                'id' => $product->id,
                'name' => 'New Name',
                'price' => 25.00,
            ]);
        });

        it('syncs categories on update', function () {
            $admin = makeProductAdmin();
            $product = Product::factory()->create();
            $categoryA = Category::factory()->create();
            $categoryB = Category::factory()->create();

            $product->categories()->sync([$categoryA->id]);

            $this->actingAs($admin, 'sanctum')
                ->putJson("/api/admin/products/{$product->id}", [
                    'categories' => [$categoryB->id],
                ])
                ->assertOk();

            $product->refresh();
            $categoryIds = $product->categories->pluck('id')->toArray();

            expect($categoryIds)->toContain($categoryB->id);
            expect($categoryIds)->not->toContain($categoryA->id);
        });

        it('returns 404 for nonexistent product', function () {
            $admin = makeProductAdmin();

            $this->actingAs($admin, 'sanctum')
                ->putJson('/api/admin/products/99999', ['name' => 'Ghost'])
                ->assertNotFound();
        });

    });

    describe('DELETE /api/admin/products/{id}', function () {

        it('soft deletes a product', function () {
            $admin = makeProductAdmin();
            $product = Product::factory()->create();

            $this->actingAs($admin, 'sanctum')
                ->deleteJson("/api/admin/products/{$product->id}")
                ->assertStatus(204);

            expect(Product::find($product->id))->toBeNull();
            expect(Product::withTrashed()->find($product->id))->not->toBeNull();
        });

        it('returns 404 for nonexistent product', function () {
            $admin = makeProductAdmin();

            $this->actingAs($admin, 'sanctum')
                ->deleteJson('/api/admin/products/99999')
                ->assertNotFound();
        });

    });

});
