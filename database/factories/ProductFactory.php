<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $price = fake()->randomFloat(2, 1, 500);

        return [
            'name' => fake()->unique()->words(3, true),
            'slug' => fake()->unique()->slug(3),
            'sku' => 'ECO-' . strtoupper(fake()->unique()->bothify('???-###')),
            'description' => fake()->paragraph(),
            'price' => $price,
            'compare_price' => null,
            'stock' => fake()->numberBetween(10, 1000),
            'min_order_qty' => fake()->randomElement([50, 100, 200]),
            'unit' => fake()->randomElement(['шт', 'уп']),
            'is_published' => true,
            'weight' => null,
            'dimensions' => null,
            'meta_title' => null,
            'meta_description' => null,
        ];
    }

    public function unpublished(): static
    {
        return $this->state(['is_published' => false]);
    }

    public function withDiscount(float $comparePrice = null): static
    {
        return $this->state(function (array $attributes) use ($comparePrice) {
            return [
                'compare_price' => $comparePrice ?? ($attributes['price'] * 1.25),
            ];
        });
    }

    public function outOfStock(): static
    {
        return $this->state(['stock' => 0]);
    }
}
