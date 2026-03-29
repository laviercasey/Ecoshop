<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ShippingMethod;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating orders...');

        $customers = User::role('customer')->get();

        if ($customers->isEmpty()) {
            $this->command->warn('No customers found. Skipping OrderSeeder.');

            return;
        }

        $products = Product::where('is_published', true)->get();

        if ($products->isEmpty()) {
            $this->command->warn('No products found. Skipping OrderSeeder.');

            return;
        }

        $statuses = OrderStatus::cases();
        $paymentMethods = PaymentMethod::cases();
        $shippingMethods = ShippingMethod::cases();

        $cities = [
            ['city' => 'Москва', 'street' => 'ул. Тверская', 'building' => '15'],
            ['city' => 'Москва', 'street' => 'ул. Арбат', 'building' => '22к1'],
            ['city' => 'Москва', 'street' => 'пр-т Мира', 'building' => '101'],
            ['city' => 'Санкт-Петербург', 'street' => 'Невский пр-т', 'building' => '78'],
            ['city' => 'Санкт-Петербург', 'street' => 'ул. Садовая', 'building' => '33'],
            ['city' => 'Новосибирск', 'street' => 'ул. Ленина', 'building' => '5'],
            ['city' => 'Екатеринбург', 'street' => 'пр-т Космонавтов', 'building' => '44'],
            ['city' => 'Казань', 'street' => 'ул. Баумана', 'building' => '19'],
            ['city' => 'Нижний Новгород', 'street' => 'ул. Большая Покровская', 'building' => '12'],
            ['city' => 'Краснодар', 'street' => 'ул. Красная', 'building' => '88'],
        ];

        $statusTransitions = [
            OrderStatus::New->value => [],
            OrderStatus::Processing->value => [
                ['old' => null, 'new' => OrderStatus::New],
                ['old' => OrderStatus::New, 'new' => OrderStatus::Processing],
            ],
            OrderStatus::Shipped->value => [
                ['old' => null, 'new' => OrderStatus::New],
                ['old' => OrderStatus::New, 'new' => OrderStatus::Processing],
                ['old' => OrderStatus::Processing, 'new' => OrderStatus::Shipped],
            ],
            OrderStatus::Delivered->value => [
                ['old' => null, 'new' => OrderStatus::New],
                ['old' => OrderStatus::New, 'new' => OrderStatus::Processing],
                ['old' => OrderStatus::Processing, 'new' => OrderStatus::Shipped],
                ['old' => OrderStatus::Shipped, 'new' => OrderStatus::Delivered],
            ],
            OrderStatus::Cancelled->value => [
                ['old' => null, 'new' => OrderStatus::New],
                ['old' => OrderStatus::New, 'new' => OrderStatus::Cancelled],
            ],
        ];

        for ($i = 0; $i < 50; $i++) {
            $customer = $customers->random();
            $status = fake()->randomElement($statuses);
            $shippingMethod = fake()->randomElement($shippingMethods);
            $paymentMethod = fake()->randomElement($paymentMethods);
            $address = fake()->randomElement($cities);
            $shippingCost = $shippingMethod === ShippingMethod::Pickup
                ? 0
                : fake()->randomElement([0, 250, 300, 350, 450, 500]);

            $itemCount = fake()->numberBetween(1, 5);
            $selectedProducts = $products->random($itemCount);
            $subtotal = 0;
            $itemsData = [];

            foreach ($selectedProducts as $product) {
                $quantity = fake()->numberBetween(
                    $product->min_order_qty,
                    $product->min_order_qty * 3
                );
                $itemTotal = (float) $product->price * $quantity;
                $subtotal += $itemTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'price' => $product->price,
                ];
            }

            $total = $subtotal + $shippingCost;

            $order = new Order([
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'shipping_method' => $shippingMethod,
                'tracking_number' => in_array($status, [OrderStatus::Shipped, OrderStatus::Delivered])
                    ? 'TRK'.fake()->numerify('##########')
                    : null,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone,
                'shipping_address' => $address,
            ]);
            $order->number = Order::generateNumber();
            $order->user_id = $customer->id;
            $order->status = $status;
            $order->save();

            foreach ($itemsData as $itemData) {
                OrderItem::create(array_merge($itemData, [
                    'order_id' => $order->id,
                ]));
            }

            $transitions = $statusTransitions[$status->value] ?? [];

            if (empty($transitions)) {
                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'old_status' => null,
                    'new_status' => OrderStatus::New,
                    'comment' => 'Заказ создан',
                    'author_name' => 'Система',
                ]);
            } else {
                $comments = [
                    OrderStatus::New->value => 'Заказ создан',
                    OrderStatus::Processing->value => 'Заказ принят в обработку',
                    OrderStatus::Shipped->value => 'Заказ передан в службу доставки',
                    OrderStatus::Delivered->value => 'Заказ доставлен получателю',
                    OrderStatus::Cancelled->value => fake()->randomElement([
                        'Отменён по просьбе клиента',
                        'Товар отсутствует на складе',
                        'Клиент не подтвердил заказ',
                    ]),
                ];

                foreach ($transitions as $transition) {
                    OrderStatusHistory::create([
                        'order_id' => $order->id,
                        'old_status' => $transition['old'],
                        'new_status' => $transition['new'],
                        'comment' => $comments[$transition['new']->value] ?? null,
                        'author_name' => $transition['new'] === OrderStatus::New ? 'Система' : 'Менеджер заказов',
                    ]);
                }
            }
        }

        $this->command->info('Orders seeded: '.Order::count().' total');
        $this->command->info('Order items seeded: '.OrderItem::count().' total');
    }
}
