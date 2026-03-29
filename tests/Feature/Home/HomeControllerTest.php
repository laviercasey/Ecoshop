<?php

use App\Models\Banner;
use App\Models\Product;

describe('HomeController', function () {
    describe('GET /api/home', function () {
        it('returns expected structure', function () {
            $response = $this->getJson('/api/home');

            $response->assertOk()
                ->assertJsonStructure([
                    'banners',
                    'featuredProducts',
                    'discountedProducts',
                ]);
        });

        it('returns only active banners', function () {
            Banner::factory()->count(3)->create(['is_active' => true]);
            Banner::factory()->count(2)->inactive()->create();

            $response = $this->getJson('/api/home');

            $response->assertOk();
            expect($response->json('banners'))->toHaveCount(3);
        });

        it('returns up to 8 featured products', function () {
            Product::factory()->count(10)->create(['is_published' => true]);

            $response = $this->getJson('/api/home');

            $response->assertOk();
            expect($response->json('featuredProducts'))->toHaveCount(8);
        });

        it('does not include unpublished products in featured', function () {
            Product::factory()->count(3)->create(['is_published' => true]);
            Product::factory()->count(3)->unpublished()->create();

            $response = $this->getJson('/api/home');

            $response->assertOk();
            expect($response->json('featuredProducts'))->toHaveCount(3);
        });

        it('returns only discounted products in discountedProducts', function () {
            Product::factory()->count(4)->withDiscount()->create(['is_published' => true]);
            Product::factory()->count(3)->create(['is_published' => true, 'compare_price' => null]);

            $response = $this->getJson('/api/home');

            $response->assertOk();
            expect($response->json('discountedProducts'))->toHaveCount(4);
        });

        it('returns up to 4 discounted products', function () {
            Product::factory()->count(6)->withDiscount()->create(['is_published' => true]);

            $response = $this->getJson('/api/home');

            $response->assertOk();
            expect($response->json('discountedProducts'))->toHaveCount(4);
        });

        it('returns empty arrays when no data', function () {
            $response = $this->getJson('/api/home');

            $response->assertOk();
            expect($response->json('banners'))->toBeEmpty();
            expect($response->json('featuredProducts'))->toBeEmpty();
            expect($response->json('discountedProducts'))->toBeEmpty();
        });

        it('returns banners ordered by position', function () {
            Banner::factory()->create(['title' => 'First']);
            Banner::factory()->create(['title' => 'Second']);
            Banner::factory()->create(['title' => 'Third']);

            $response = $this->getJson('/api/home');

            $banners = $response->json('banners');
            expect($banners[0]['title'])->toBe('First');
            expect($banners[1]['title'])->toBe('Second');
            expect($banners[2]['title'])->toBe('Third');
        });
    });
});
