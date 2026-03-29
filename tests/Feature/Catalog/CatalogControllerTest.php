<?php

use App\Models\Category;
use App\Models\Product;

describe('CatalogController', function () {
    describe('GET /api/catalog', function () {
        it('returns catalog with paginated products', function () {
            Product::factory()->count(3)->create();

            $response = $this->getJson('/api/catalog');

            $response->assertOk()
                ->assertJsonStructure([
                    'products',
                    'currentCategory',
                    'categoryName',
                    'currentSort',
                    'currentSearch',
                    'categoryCounts',
                    'totalCount',
                ]);
        });

        it('returns only published products', function () {
            Product::factory()->count(2)->create();
            Product::factory()->unpublished()->create();

            $response = $this->getJson('/api/catalog');

            $response->assertOk();
            expect($response->json('totalCount'))->toBe(2);
        });

        it('filters by category slug', function () {
            $category = Category::factory()->create();
            $inCategory = Product::factory()->create();
            $inCategory->categories()->attach($category);

            Product::factory()->create();

            $response = $this->getJson("/api/catalog?category={$category->slug}");

            $response->assertOk();
            $products = $response->json('products.data');
            expect($products)->toHaveCount(1);
            expect($products[0]['id'])->toBe($inCategory->id);
        });

        it('returns 404 for unknown category slug', function () {
            $response = $this->getJson('/api/catalog?category=does-not-exist');

            $response->assertNotFound();
        });

        it('filters by search term', function () {
            Product::factory()->create(['name' => 'Bamboo Toothbrush']);
            Product::factory()->create(['name' => 'Cotton Bag']);

            $response = $this->getJson('/api/catalog?search=Bamboo');

            $response->assertOk();
            $products = $response->json('products.data');
            expect($products)->toHaveCount(1);
            expect($products[0]['name'])->toBe('Bamboo Toothbrush');
        });

        it('sorts by price_asc', function () {
            Product::factory()->create(['price' => 300]);
            Product::factory()->create(['price' => 100]);
            Product::factory()->create(['price' => 200]);

            $response = $this->getJson('/api/catalog?sort=price_asc');

            $response->assertOk();
            $prices = array_column($response->json('products.data'), 'price');
            expect($prices[0])->toBeLessThanOrEqual($prices[1]);
            expect($prices[1])->toBeLessThanOrEqual($prices[2]);
        });

        it('sorts by price_desc', function () {
            Product::factory()->create(['price' => 100]);
            Product::factory()->create(['price' => 300]);
            Product::factory()->create(['price' => 200]);

            $response = $this->getJson('/api/catalog?sort=price_desc');

            $response->assertOk();
            $prices = array_column($response->json('products.data'), 'price');
            expect($prices[0])->toBeGreaterThanOrEqual($prices[1]);
            expect($prices[1])->toBeGreaterThanOrEqual($prices[2]);
        });

        it('returns categoryCounts and totalCount', function () {
            $category = Category::factory()->create();
            $product1 = Product::factory()->create();
            $product2 = Product::factory()->create();
            $product1->categories()->attach($category);
            $product2->categories()->attach($category);

            $response = $this->getJson('/api/catalog');

            $response->assertOk();
            expect($response->json('totalCount'))->toBe(2);
            $categoryCounts = $response->json('categoryCounts');
            expect($categoryCounts[$category->slug])->toBe(2);
        });
    });

    describe('GET /api/catalog/{slug}', function () {
        it('returns product by slug', function () {
            $product = Product::factory()->create();

            $response = $this->getJson("/api/catalog/{$product->slug}");

            $response->assertOk()
                ->assertJsonStructure([
                    'product' => ['id', 'name', 'slug', 'price'],
                    'relatedProducts',
                ]);
            expect($response->json('product.id'))->toBe($product->id);
        });

        it('returns 404 for unknown slug', function () {
            $response = $this->getJson('/api/catalog/this-slug-does-not-exist');

            $response->assertNotFound();
        });

        it('returns 404 for unpublished product', function () {
            $product = Product::factory()->unpublished()->create();

            $response = $this->getJson("/api/catalog/{$product->slug}");

            $response->assertNotFound();
        });

        it('returns related products', function () {
            $category = Category::factory()->create();

            $product = Product::factory()->create();
            $product->categories()->attach($category);

            $related1 = Product::factory()->create();
            $related1->categories()->attach($category);

            $related2 = Product::factory()->create();
            $related2->categories()->attach($category);

            $response = $this->getJson("/api/catalog/{$product->slug}");

            $response->assertOk();
            $relatedIds = array_column($response->json('relatedProducts'), 'id');
            expect($relatedIds)->toContain($related1->id);
            expect($relatedIds)->toContain($related2->id);
            expect($relatedIds)->not->toContain($product->id);
        });
    });
});
