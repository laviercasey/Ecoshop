<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating banners...');

        $banners = [
            [
                'title' => 'Летняя коллекция 2026',
                'subtitle' => 'Экологичная упаковка для вашего бизнеса',
                'link' => '/catalog',
                'is_active' => true,
                'position' => 1,
            ],
            [
                'title' => 'Скидка 10% на первый заказ',
                'subtitle' => 'Промокод: ECO10',
                'link' => '/catalog',
                'is_active' => true,
                'position' => 2,
            ],
            [
                'title' => 'Брендирование упаковки',
                'subtitle' => 'Ваш логотип на нашей продукции',
                'link' => '/branding',
                'is_active' => true,
                'position' => 3,
            ],
        ];

        foreach ($banners as $bannerData) {
            Banner::create($bannerData);
        }

        $this->command->info('Banners seeded: ' . Banner::count() . ' total');
    }
}
