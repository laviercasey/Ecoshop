<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 100, 5000);

        return [
            'number' => Order::generateNumber(),
            'user_id' => User::factory(),
            'status' => OrderStatus::New,
            'subtotal' => $subtotal,
            'shipping_cost' => 0,
            'total' => $subtotal,
            'payment_method' => PaymentMethod::Card,
            'shipping_method' => ShippingMethod::Pickup,
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'customer_note' => null,
            'shipping_address' => null,
            'tracking_number' => null,
        ];
    }

    public function processing(): static
    {
        return $this->state(['status' => OrderStatus::Processing]);
    }

    public function shipped(): static
    {
        return $this->state(['status' => OrderStatus::Shipped]);
    }

    public function delivered(): static
    {
        return $this->state(['status' => OrderStatus::Delivered]);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => OrderStatus::Cancelled]);
    }

    public function withDelivery(): static
    {
        return $this->state([
            'shipping_method' => ShippingMethod::Cdek,
            'shipping_address' => [
                'city' => fake()->city(),
                'street' => fake()->streetName(),
                'building' => fake()->buildingNumber(),
                'apartment' => '10',
                'postal_code' => '123456',
            ],
        ]);
    }
}
