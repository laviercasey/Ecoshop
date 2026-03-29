<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'admin']);
});

function makeCategoryAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

describe('Admin\CategoryController', function () {

    describe('GET /api/admin/categories', function () {

        it('requires admin role', function () {
            $user = User::factory()->create();

            $this->actingAs($user, 'sanctum')
                ->getJson('/api/admin/categories')
                ->assertStatus(403)
                ->assertJson(['message' => 'Доступ запрещён']);
        });

        it('returns all categories', function () {
            $admin = makeCategoryAdmin();
            Category::factory()->count(4)->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/categories');

            $response->assertOk()
                ->assertJsonStructure([
                    'categories' => [
                        '*' => ['id', 'name', 'slug', 'parent_id', 'sort_order', 'is_active', 'products_count'],
                    ],
                ]);

            expect($response->json('categories'))->toHaveCount(4);
        });

        it('filters roots_only', function () {
            $admin = makeCategoryAdmin();
            $root1 = Category::factory()->create();
            $root2 = Category::factory()->create();
            Category::factory()->withParent($root1)->create();
            Category::factory()->withParent($root2)->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/categories?roots_only=true');

            $response->assertOk();
            $ids = collect($response->json('categories'))->pluck('id')->toArray();

            expect($ids)->toContain($root1->id);
            expect($ids)->toContain($root2->id);
            expect($response->json('categories'))->toHaveCount(2);
        });

        it('includes product count', function () {
            $admin = makeCategoryAdmin();
            $category = Category::factory()->create();
            $products = Product::factory()->count(3)->create();
            $category->products()->attach($products->pluck('id'));

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/categories');

            $response->assertOk();

            $found = collect($response->json('categories'))
                ->firstWhere('id', $category->id);

            expect($found['products_count'])->toBe(3);
        });

    });

    describe('POST /api/admin/categories', function () {

        it('creates a root category', function () {
            $admin = makeCategoryAdmin();

            $payload = [
                'name'        => 'Eco Living',
                'description' => 'Products for sustainable living',
                'sort_order'  => 1,
                'is_active'   => true,
            ];

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/categories', $payload);

            $response->assertStatus(201)
                ->assertJson([
                    'message'  => 'Категория создана',
                    'category' => [
                        'name'      => 'Eco Living',
                        'parent_id' => null,
                        'is_active' => true,
                    ],
                ]);

            $this->assertDatabaseHas('categories', ['name' => 'Eco Living', 'parent_id' => null]);
        });

        it('creates a child category with parent_id', function () {
            $admin = makeCategoryAdmin();
            $parent = Category::factory()->create();

            $payload = [
                'name'      => 'Bamboo Products',
                'parent_id' => $parent->id,
                'is_active' => true,
            ];

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/categories', $payload);

            $response->assertStatus(201)
                ->assertJson([
                    'message'  => 'Категория создана',
                    'category' => [
                        'name'      => 'Bamboo Products',
                        'parent_id' => $parent->id,
                    ],
                ]);

            $this->assertDatabaseHas('categories', ['name' => 'Bamboo Products', 'parent_id' => $parent->id]);
        });

        it('validates required name field', function () {
            $admin = makeCategoryAdmin();

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/categories', []);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['name']);
        });

    });

    describe('GET /api/admin/categories/{id}', function () {

        it('returns category details', function () {
            $admin = makeCategoryAdmin();
            $category = Category::factory()->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->getJson("/api/admin/categories/{$category->id}");

            $response->assertOk()
                ->assertJsonStructure([
                    'category' => [
                        'id', 'name', 'slug', 'description', 'parent_id',
                        'sort_order', 'is_active', 'children', 'products_count',
                    ],
                ])
                ->assertJson([
                    'category' => ['id' => $category->id, 'name' => $category->name],
                ]);
        });

        it('returns 404 for nonexistent category', function () {
            $admin = makeCategoryAdmin();

            $this->actingAs($admin, 'sanctum')
                ->getJson('/api/admin/categories/99999')
                ->assertNotFound();
        });

    });

    describe('PUT /api/admin/categories/{id}', function () {

        it('updates category name', function () {
            $admin = makeCategoryAdmin();
            $category = Category::factory()->create(['name' => 'Old Category Name']);

            $response = $this->actingAs($admin, 'sanctum')
                ->putJson("/api/admin/categories/{$category->id}", [
                    'name' => 'New Category Name',
                ]);

            $response->assertOk()
                ->assertJson([
                    'message'  => 'Категория обновлена',
                    'category' => ['name' => 'New Category Name'],
                ]);

            $this->assertDatabaseHas('categories', [
                'id'   => $category->id,
                'name' => 'New Category Name',
            ]);
        });

        it('returns 404 for nonexistent category', function () {
            $admin = makeCategoryAdmin();

            $this->actingAs($admin, 'sanctum')
                ->putJson('/api/admin/categories/99999', ['name' => 'Ghost'])
                ->assertNotFound();
        });

    });

    describe('DELETE /api/admin/categories/{id}', function () {

        it('deletes a category without children', function () {
            $admin = makeCategoryAdmin();
            $category = Category::factory()->create();
            $product = Product::factory()->create();
            $category->products()->attach($product->id);

            $this->actingAs($admin, 'sanctum')
                ->deleteJson("/api/admin/categories/{$category->id}")
                ->assertStatus(204);

            $this->assertDatabaseMissing('categories', ['id' => $category->id]);
            $this->assertDatabaseMissing('category_product', [
                'category_id' => $category->id,
                'product_id'  => $product->id,
            ]);
        });

        it('returns 422 when category has children', function () {
            $admin = makeCategoryAdmin();
            $parent = Category::factory()->create();
            Category::factory()->withParent($parent)->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->deleteJson("/api/admin/categories/{$parent->id}");

            $response->assertStatus(422)
                ->assertJson(['message' => 'Невозможно удалить категорию с подкатегориями']);

            $this->assertDatabaseHas('categories', ['id' => $parent->id]);
        });

    });

});
