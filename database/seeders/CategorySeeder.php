<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating categories...');

        $categories = [
            ['name' => 'Salad Bowl', 'description' => 'Экологичные салатники из крафт-бумаги и биоразлагаемых материалов'],
            ['name' => 'Old School', 'description' => 'Классическая упаковка в стиле ретро из натуральных материалов'],
            ['name' => 'Sushi Box', 'description' => 'Упаковка для суши и роллов из переработанных материалов'],
            ['name' => 'Craft Box', 'description' => 'Крафтовые коробки для еды различных размеров'],
            ['name' => 'Лотки', 'description' => 'Лотки для пищевых продуктов из биоразлагаемого сырья'],
            ['name' => 'Стаканы', 'description' => 'Экологичные стаканы для горячих и холодных напитков'],
            ['name' => 'Пакеты', 'description' => 'Бумажные и биоразлагаемые пакеты для упаковки'],
            ['name' => 'Контейнеры', 'description' => 'Контейнеры с крышками для доставки и takeaway'],
            ['name' => 'Крышки', 'description' => 'Крышки для стаканов и контейнеров из экоматериалов'],
            ['name' => 'Соусники', 'description' => 'Порционные контейнеры для соусов и дипов'],
            ['name' => 'Столовые приборы', 'description' => 'Деревянные и биоразлагаемые столовые приборы'],
            ['name' => 'Упаковка для выпечки', 'description' => 'Экологичная упаковка для выпечки и кондитерских изделий'],
        ];

        foreach ($categories as $index => $categoryData) {
            Category::create([
                'name' => $categoryData['name'],
                'description' => $categoryData['description'],
                'sort_order' => ($index + 1) * 10,
                'is_active' => true,
            ]);
        }

        $this->command->info('Categories seeded: ' . Category::count() . ' total');
    }
}
