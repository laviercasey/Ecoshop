<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating settings...');

        $settings = [
            ['group' => 'general', 'key' => 'store_name', 'value' => 'EcoShop'],
            ['group' => 'general', 'key' => 'phone', 'value' => '+7 (495) 123-45-67'],
            ['group' => 'general', 'key' => 'email', 'value' => 'info@ecoshop.ru'],
            ['group' => 'general', 'key' => 'address', 'value' => 'г. Москва, ул. Зелёная, д. 42'],
            ['group' => 'general', 'key' => 'company_name', 'value' => 'ООО «ЭкоШоп»'],
            ['group' => 'general', 'key' => 'inn', 'value' => '7712345678'],
            ['group' => 'general', 'key' => 'meta_title', 'value' => 'EcoShop — экологичная упаковка для бизнеса'],
            ['group' => 'general', 'key' => 'meta_description', 'value' => 'Экологичная одноразовая упаковка для пищевой промышленности. Контейнеры, стаканы, тарелки из биоразлагаемых материалов. Доставка по России.'],
            ['group' => 'general', 'key' => 'meta_keywords', 'value' => 'экологичная упаковка, биоразлагаемая упаковка, одноразовая посуда, EcoShop, упаковка оптом'],
            ['group' => 'payment', 'key' => 'min_order_amount', 'value' => 3000],
            ['group' => 'payment', 'key' => 'free_shipping_threshold', 'value' => 15000],
            ['group' => 'shipping', 'key' => 'default_method', 'value' => 'cdek'],
            ['group' => 'shipping', 'key' => 'cdek_api_key', 'value' => ''],
        ];

        foreach ($settings as $settingData) {
            Setting::updateOrCreate(
                ['group' => $settingData['group'], 'key' => $settingData['key']],
                ['value' => $settingData['value']],
            );
        }

        $this->command->info('Settings seeded: '.Setting::count().' total');
    }
}
