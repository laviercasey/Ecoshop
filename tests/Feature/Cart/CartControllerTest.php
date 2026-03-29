<?php

use App\Models\Product;

describe('CartController', function () {
    describe('GET /api/cart', function () {
        it('returns empty cart by default', function () {
            $response = $this->getJson('/api/cart');

            $response->assertOk()
                ->assertJson([
                    'items' => [],
                    'subtotal' => 0,
                    'total' => 0,
                    'count' => 0,
                ]);
        });

        it('returns cart items with product details', function () {
            $product = Product::factory()->create(['price' => 100.00]);

            $this->withSession(['cart' => [$product->id => 2]])
                ->getJson('/api/cart')
                ->assertOk()
                ->assertJsonFragment([
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'price' => 100.0,
                ]);
        });

        it('calculates subtotal correctly', function () {
            $product = Product::factory()->create(['price' => 50.00]);

            $response = $this->withSession(['cart' => [$product->id => 3]])
                ->getJson('/api/cart');

            $response->assertOk();
            expect($response->json('subtotal'))->toBe(150);
            expect($response->json('total'))->toBe(150);
        });

        it('calculates count correctly', function () {
            $product1 = Product::factory()->create();
            $product2 = Product::factory()->create();

            $response = $this->withSession([
                'cart' => [$product1->id => 2, $product2->id => 3],
            ])->getJson('/api/cart');

            $response->assertOk();
            expect($response->json('count'))->toBe(5);
        });

        it('skips unpublished products in cart', function () {
            $published = Product::factory()->create(['is_published' => true]);
            $unpublished = Product::factory()->unpublished()->create();

            $response = $this->withSession([
                'cart' => [$published->id => 1, $unpublished->id => 1],
            ])->getJson('/api/cart');

            $response->assertOk();
            expect($response->json('items'))->toHaveCount(1);
        });
    });

    describe('POST /api/cart', function () {
        it('adds a product to cart', function () {
            $product = Product::factory()->create();

            $response = $this->postJson('/api/cart', [
                'product_id' => $product->id,
                'quantity' => 2,
            ]);

            $response->assertOk()
                ->assertJsonStructure(['message', 'cartItems', 'cartCount'])
                ->assertJson(['cartCount' => 2]);
        });

        it('uses default quantity of 1 if not specified', function () {
            $product = Product::factory()->create();

            $response = $this->postJson('/api/cart', [
                'product_id' => $product->id,
            ]);

            $response->assertOk();
            expect($response->json('cartCount'))->toBe(1);
        });

        it('accumulates quantity for same product', function () {
            $product = Product::factory()->create();

            $this->withSession(['cart' => [$product->id => 3]])
                ->postJson('/api/cart', [
                    'product_id' => $product->id,
                    'quantity' => 2,
                ])
                ->assertJson(['cartCount' => 5]);
        });

        it('rejects non-existent product', function () {
            $response = $this->postJson('/api/cart', [
                'product_id' => 999999,
                'quantity' => 1,
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['product_id']);
        });

        it('rejects invalid quantity', function () {
            $product = Product::factory()->create();

            $response = $this->postJson('/api/cart', [
                'product_id' => $product->id,
                'quantity' => -1,
            ]);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['quantity']);
        });
    });

    describe('PATCH /api/cart/{product}', function () {
        it('updates product quantity', function () {
            $product = Product::factory()->create();

            $response = $this->withSession(['cart' => [$product->id => 2]])
                ->patchJson("/api/cart/{$product->id}", ['quantity' => 5]);

            $response->assertOk()
                ->assertJson(['cartCount' => 5]);
        });

        it('removes product when quantity is 0', function () {
            $product = Product::factory()->create();

            $response = $this->withSession(['cart' => [$product->id => 3]])
                ->patchJson("/api/cart/{$product->id}", ['quantity' => 0]);

            $response->assertOk()
                ->assertJson(['cartCount' => 0]);
        });

        it('requires quantity field', function () {
            $product = Product::factory()->create();

            $response = $this->patchJson("/api/cart/{$product->id}", []);

            $response->assertStatus(422)
                ->assertJsonValidationErrors(['quantity']);
        });
    });

    describe('DELETE /api/cart/{product}', function () {
        it('removes product from cart', function () {
            $product = Product::factory()->create();

            $response = $this->withSession(['cart' => [$product->id => 2]])
                ->deleteJson("/api/cart/{$product->id}");

            $response->assertOk()
                ->assertJson(['cartCount' => 0, 'message' => 'Товар удалён из корзины']);
        });

        it('handles removing non-existent cart item gracefully', function () {
            $response = $this->deleteJson('/api/cart/999');

            $response->assertNotFound();
        });
    });
});
