<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating products...');

        $products = [
            ['name' => 'Салатник крафт 500мл', 'sku' => 'ECO-SAL-001', 'price' => 5.80, 'compare_price' => 7.00, 'categories' => ['Salad Bowl'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '500 мл']]],
            ['name' => 'Салатник крафт 750мл', 'sku' => 'ECO-SAL-002', 'price' => 7.20, 'compare_price' => 8.60, 'categories' => ['Salad Bowl'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '750 мл']]],
            ['name' => 'Салатник крафт 1000мл', 'sku' => 'ECO-SAL-003', 'price' => 8.90, 'compare_price' => null, 'categories' => ['Salad Bowl'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '1000 мл']]],
            ['name' => 'Салатник белый 500мл', 'sku' => 'ECO-SAL-004', 'price' => 6.10, 'compare_price' => null, 'categories' => ['Salad Bowl'], 'attrs' => [['Материал', 'Ламинированный картон'], ['Объём', '500 мл']]],
            ['name' => 'Салатник белый 750мл с крышкой', 'sku' => 'ECO-SAL-005', 'price' => 9.50, 'compare_price' => 11.40, 'categories' => ['Salad Bowl', 'Крышки'], 'attrs' => [['Материал', 'Ламинированный картон'], ['Объём', '750 мл']]],

            ['name' => 'Коробка Old School бургер L', 'sku' => 'ECO-OLD-001', 'price' => 6.50, 'compare_price' => null, 'categories' => ['Old School'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '120x120x70 мм']]],
            ['name' => 'Коробка Old School бургер M', 'sku' => 'ECO-OLD-002', 'price' => 5.70, 'compare_price' => null, 'categories' => ['Old School'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '100x100x60 мм']]],
            ['name' => 'Коробка Old School наггетсы', 'sku' => 'ECO-OLD-003', 'price' => 4.30, 'compare_price' => 5.20, 'categories' => ['Old School'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '150x90x50 мм']]],
            ['name' => 'Коробка Old School картофель фри', 'sku' => 'ECO-OLD-004', 'price' => 3.80, 'compare_price' => null, 'categories' => ['Old School'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '70x70x120 мм']]],

            ['name' => 'Суши-бокс крафт 200x130мм', 'sku' => 'ECO-SUS-001', 'price' => 12.50, 'compare_price' => 15.00, 'categories' => ['Sushi Box'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '200x130x45 мм']]],
            ['name' => 'Суши-бокс крафт 250x170мм', 'sku' => 'ECO-SUS-002', 'price' => 15.80, 'compare_price' => null, 'categories' => ['Sushi Box'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '250x170x45 мм']]],
            ['name' => 'Суши-бокс чёрный 200x130мм', 'sku' => 'ECO-SUS-003', 'price' => 14.20, 'compare_price' => null, 'categories' => ['Sushi Box'], 'attrs' => [['Материал', 'Ламинированный картон'], ['Размер', '200x130x45 мм']]],
            ['name' => 'Суши-набор с соевым соусом', 'sku' => 'ECO-SUS-004', 'price' => 18.50, 'compare_price' => 22.20, 'categories' => ['Sushi Box', 'Соусники'], 'attrs' => [['Комплектация', 'Бокс + палочки + соус + имбирь + васаби']]],

            ['name' => 'Крафт-бокс L 200x120x40мм', 'sku' => 'ECO-CBX-001', 'price' => 8.40, 'compare_price' => null, 'categories' => ['Craft Box'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '200x120x40 мм']]],
            ['name' => 'Крафт-бокс M 150x100x40мм', 'sku' => 'ECO-CBX-002', 'price' => 6.80, 'compare_price' => null, 'categories' => ['Craft Box'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '150x100x40 мм']]],
            ['name' => 'Крафт-бокс XL 260x180x50мм', 'sku' => 'ECO-CBX-003', 'price' => 11.20, 'compare_price' => 13.40, 'categories' => ['Craft Box'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '260x180x50 мм']]],
            ['name' => 'Крафт-бокс с окном 150x100мм', 'sku' => 'ECO-CBX-004', 'price' => 9.60, 'compare_price' => null, 'categories' => ['Craft Box'], 'attrs' => [['Материал', 'Крафт-картон с PLA-окном'], ['Размер', '150x100x40 мм']]],

            ['name' => 'Лоток крафт 200x100мм', 'sku' => 'ECO-LOT-001', 'price' => 3.50, 'compare_price' => null, 'categories' => ['Лотки'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '200x100x35 мм']]],
            ['name' => 'Лоток крафт 250x150мм', 'sku' => 'ECO-LOT-002', 'price' => 4.80, 'compare_price' => 5.80, 'categories' => ['Лотки'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '250x150x35 мм']]],
            ['name' => 'Лоток для хот-дога крафт', 'sku' => 'ECO-LOT-003', 'price' => 3.20, 'compare_price' => null, 'categories' => ['Лотки'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '220x70x50 мм']]],
            ['name' => 'Лоток глубокий 300мл', 'sku' => 'ECO-LOT-004', 'price' => 4.10, 'compare_price' => null, 'categories' => ['Лотки'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '300 мл']]],

            ['name' => 'Стакан для кофе 250мл ECO', 'sku' => 'ECO-CUP-001', 'price' => 3.90, 'compare_price' => 4.70, 'categories' => ['Стаканы'], 'attrs' => [['Материал', 'Двухслойный крафт-картон'], ['Объём', '250 мл']]],
            ['name' => 'Стакан для кофе 350мл ECO', 'sku' => 'ECO-CUP-002', 'price' => 4.50, 'compare_price' => null, 'categories' => ['Стаканы'], 'attrs' => [['Материал', 'Двухслойный крафт-картон'], ['Объём', '350 мл']]],
            ['name' => 'Стакан для кофе 400мл ECO', 'sku' => 'ECO-CUP-003', 'price' => 5.20, 'compare_price' => null, 'categories' => ['Стаканы'], 'attrs' => [['Материал', 'Двухслойный крафт-картон'], ['Объём', '400 мл']]],
            ['name' => 'Стакан для холодных напитков 300мл', 'sku' => 'ECO-CUP-004', 'price' => 3.40, 'compare_price' => null, 'categories' => ['Стаканы'], 'attrs' => [['Материал', 'PLA-пластик'], ['Объём', '300 мл']]],
            ['name' => 'Стакан для холодных напитков 500мл', 'sku' => 'ECO-CUP-005', 'price' => 4.80, 'compare_price' => 5.80, 'categories' => ['Стаканы'], 'attrs' => [['Материал', 'PLA-пластик'], ['Объём', '500 мл']]],
            ['name' => 'Стакан бумажный белый 250мл', 'sku' => 'ECO-CUP-006', 'price' => 2.90, 'compare_price' => null, 'categories' => ['Стаканы'], 'attrs' => [['Материал', 'Картон с PLA-покрытием'], ['Объём', '250 мл']]],

            ['name' => 'Пакет крафт с ручками S', 'sku' => 'ECO-BAG-001', 'price' => 5.40, 'compare_price' => null, 'categories' => ['Пакеты'], 'attrs' => [['Материал', 'Крафт-бумага 70г/м²'], ['Размер', '180x85x225 мм']]],
            ['name' => 'Пакет крафт с ручками M', 'sku' => 'ECO-BAG-002', 'price' => 7.20, 'compare_price' => null, 'categories' => ['Пакеты'], 'attrs' => [['Материал', 'Крафт-бумага 70г/м²'], ['Размер', '260x150x350 мм']]],
            ['name' => 'Пакет крафт с ручками L', 'sku' => 'ECO-BAG-003', 'price' => 9.80, 'compare_price' => 11.80, 'categories' => ['Пакеты'], 'attrs' => [['Материал', 'Крафт-бумага 80г/м²'], ['Размер', '320x200x370 мм']]],
            ['name' => 'Пакет бумажный для выпечки', 'sku' => 'ECO-BAG-004', 'price' => 2.50, 'compare_price' => null, 'categories' => ['Пакеты', 'Упаковка для выпечки'], 'attrs' => [['Материал', 'Пергаментная бумага'], ['Размер', '170x70x240 мм']]],
            ['name' => 'Пакет с плоским дном 1кг', 'sku' => 'ECO-BAG-005', 'price' => 8.50, 'compare_price' => null, 'categories' => ['Пакеты'], 'attrs' => [['Материал', 'Крафт-бумага 100г/м²'], ['Размер', '120x80x260 мм']]],

            ['name' => 'Контейнер с крышкой 500мл', 'sku' => 'ECO-CNT-001', 'price' => 8.70, 'compare_price' => null, 'categories' => ['Контейнеры', 'Крышки'], 'attrs' => [['Материал', 'Крафт-картон с ламинацией'], ['Объём', '500 мл']]],
            ['name' => 'Контейнер с крышкой 750мл', 'sku' => 'ECO-CNT-002', 'price' => 10.40, 'compare_price' => 12.50, 'categories' => ['Контейнеры', 'Крышки'], 'attrs' => [['Материал', 'Крафт-картон с ламинацией'], ['Объём', '750 мл']]],
            ['name' => 'Контейнер с крышкой 1000мл', 'sku' => 'ECO-CNT-003', 'price' => 12.80, 'compare_price' => null, 'categories' => ['Контейнеры', 'Крышки'], 'attrs' => [['Материал', 'Крафт-картон с ламинацией'], ['Объём', '1000 мл']]],
            ['name' => 'Контейнер круглый 350мл', 'sku' => 'ECO-CNT-004', 'price' => 7.60, 'compare_price' => null, 'categories' => ['Контейнеры'], 'attrs' => [['Материал', 'Багасса (сахарный тростник)'], ['Объём', '350 мл']]],
            ['name' => 'Контейнер двухсекционный 800мл', 'sku' => 'ECO-CNT-005', 'price' => 14.20, 'compare_price' => 17.00, 'categories' => ['Контейнеры'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '800 мл']]],

            ['name' => 'Крышка для стакана 250-350мл', 'sku' => 'ECO-LID-001', 'price' => 2.50, 'compare_price' => null, 'categories' => ['Крышки'], 'attrs' => [['Материал', 'CPLA'], ['Диаметр', '80 мм']]],
            ['name' => 'Крышка для стакана 400мл', 'sku' => 'ECO-LID-002', 'price' => 2.80, 'compare_price' => null, 'categories' => ['Крышки'], 'attrs' => [['Материал', 'CPLA'], ['Диаметр', '90 мм']]],
            ['name' => 'Крышка плоская прозрачная PLA', 'sku' => 'ECO-LID-003', 'price' => 3.10, 'compare_price' => null, 'categories' => ['Крышки'], 'attrs' => [['Материал', 'PLA-пластик'], ['Диаметр', '95 мм']]],
            ['name' => 'Крышка купольная PLA 300-500мл', 'sku' => 'ECO-LID-004', 'price' => 3.50, 'compare_price' => 4.20, 'categories' => ['Крышки'], 'attrs' => [['Материал', 'PLA-пластик'], ['Диаметр', '95 мм']]],

            ['name' => 'Соусник крафт 30мл', 'sku' => 'ECO-SAU-001', 'price' => 2.80, 'compare_price' => null, 'categories' => ['Соусники'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '30 мл']]],
            ['name' => 'Соусник крафт 60мл', 'sku' => 'ECO-SAU-002', 'price' => 3.40, 'compare_price' => null, 'categories' => ['Соусники'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '60 мл']]],
            ['name' => 'Соусник крафт 90мл с крышкой', 'sku' => 'ECO-SAU-003', 'price' => 4.50, 'compare_price' => 5.40, 'categories' => ['Соусники', 'Крышки'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '90 мл']]],
            ['name' => 'Соусник прозрачный PLA 60мл', 'sku' => 'ECO-SAU-004', 'price' => 3.20, 'compare_price' => null, 'categories' => ['Соусники'], 'attrs' => [['Материал', 'PLA-пластик'], ['Объём', '60 мл']]],

            ['name' => 'Вилка деревянная 160мм', 'sku' => 'ECO-CTL-001', 'price' => 2.50, 'compare_price' => null, 'categories' => ['Столовые приборы'], 'attrs' => [['Материал', 'Берёзовое дерево'], ['Длина', '160 мм']]],
            ['name' => 'Нож деревянный 165мм', 'sku' => 'ECO-CTL-002', 'price' => 2.50, 'compare_price' => null, 'categories' => ['Столовые приборы'], 'attrs' => [['Материал', 'Берёзовое дерево'], ['Длина', '165 мм']]],
            ['name' => 'Ложка деревянная 160мм', 'sku' => 'ECO-CTL-003', 'price' => 2.50, 'compare_price' => null, 'categories' => ['Столовые приборы'], 'attrs' => [['Материал', 'Берёзовое дерево'], ['Длина', '160 мм']]],
            ['name' => 'Набор столовых приборов 3 в 1', 'sku' => 'ECO-CTL-004', 'price' => 8.90, 'compare_price' => 10.70, 'categories' => ['Столовые приборы'], 'attrs' => [['Материал', 'Берёзовое дерево'], ['Комплектация', 'Вилка + нож + ложка + салфетка']]],
            ['name' => 'Палочки бамбуковые в бумажной упаковке', 'sku' => 'ECO-CTL-005', 'price' => 3.20, 'compare_price' => null, 'categories' => ['Столовые приборы', 'Sushi Box'], 'attrs' => [['Материал', 'Бамбук'], ['Длина', '230 мм']]],
            ['name' => 'Мешалка деревянная 140мм', 'sku' => 'ECO-CTL-006', 'price' => 1.50, 'compare_price' => null, 'categories' => ['Столовые приборы'], 'attrs' => [['Материал', 'Берёзовое дерево'], ['Длина', '140 мм']]],

            ['name' => 'Коробка для торта 210x210x100мм', 'sku' => 'ECO-BAK-001', 'price' => 18.50, 'compare_price' => null, 'categories' => ['Упаковка для выпечки'], 'attrs' => [['Материал', 'Крафт-картон с окном'], ['Размер', '210x210x100 мм']]],
            ['name' => 'Коробка для торта 300x300x120мм', 'sku' => 'ECO-BAK-002', 'price' => 25.80, 'compare_price' => null, 'categories' => ['Упаковка для выпечки'], 'attrs' => [['Материал', 'Крафт-картон с окном'], ['Размер', '300x300x120 мм']]],
            ['name' => 'Коробка для маффинов 6 шт', 'sku' => 'ECO-BAK-003', 'price' => 15.40, 'compare_price' => 18.50, 'categories' => ['Упаковка для выпечки'], 'attrs' => [['Материал', 'Крафт-картон'], ['Вместимость', '6 шт']]],
            ['name' => 'Коробка для пончиков 260x185мм', 'sku' => 'ECO-BAK-004', 'price' => 14.20, 'compare_price' => null, 'categories' => ['Упаковка для выпечки'], 'attrs' => [['Материал', 'Крафт-картон с окном'], ['Размер', '260x185x60 мм']]],
            ['name' => 'Коробка для эклеров 230x150мм', 'sku' => 'ECO-BAK-005', 'price' => 12.60, 'compare_price' => null, 'categories' => ['Упаковка для выпечки'], 'attrs' => [['Материал', 'Крафт-картон с окном'], ['Размер', '230x150x60 мм']]],
            ['name' => 'Лоток для круассанов крафт', 'sku' => 'ECO-BAK-006', 'price' => 8.90, 'compare_price' => 10.70, 'categories' => ['Упаковка для выпечки', 'Лотки'], 'attrs' => [['Материал', 'Крафт-картон'], ['Размер', '250x170x50 мм']]],
            ['name' => 'Коробка для печенья 150x150мм', 'sku' => 'ECO-BAK-007', 'price' => 9.40, 'compare_price' => null, 'categories' => ['Упаковка для выпечки'], 'attrs' => [['Материал', 'Крафт-картон с PLA-окном'], ['Размер', '150x150x45 мм']]],
            ['name' => 'Контейнер для салата с крышкой 1000мл', 'sku' => 'ECO-SAL-006', 'price' => 11.30, 'compare_price' => null, 'categories' => ['Salad Bowl', 'Контейнеры'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '1000 мл']]],
            ['name' => 'Тарелка бумажная круглая 180мм', 'sku' => 'ECO-PLT-001', 'price' => 3.80, 'compare_price' => null, 'categories' => ['Лотки'], 'attrs' => [['Материал', 'Целлюлоза'], ['Диаметр', '180 мм']]],
            ['name' => 'Тарелка крафт глубокая 500мл', 'sku' => 'ECO-PLT-002', 'price' => 5.60, 'compare_price' => 6.70, 'categories' => ['Лотки', 'Salad Bowl'], 'attrs' => [['Материал', 'Крафт-картон'], ['Объём', '500 мл']]],
        ];

        $categoryMap = Category::pluck('id', 'name');

        foreach ($products as $productData) {
            $product = Product::create([
                'sku' => $productData['sku'],
                'name' => $productData['name'],
                'description' => $this->generateDescription($productData['name']),
                'price' => $productData['price'],
                'compare_price' => $productData['compare_price'],
                'stock' => fake()->numberBetween(100, 5000),
                'min_order_qty' => fake()->randomElement([50, 100, 150, 200, 250, 300, 500]),
                'unit' => fake()->randomElement(['шт', 'уп']),
                'is_published' => true,
                'meta_title' => $productData['name'].' — купить оптом | EcoShop',
                'meta_description' => 'Купить '.mb_strtolower($productData['name']).' оптом по выгодной цене. Экологичная упаковка с доставкой по России.',
            ]);

            $categoryIds = [];
            foreach ($productData['categories'] as $categoryName) {
                if (isset($categoryMap[$categoryName])) {
                    $categoryIds[] = $categoryMap[$categoryName];
                }
            }
            $product->categories()->syncWithoutDetaching($categoryIds);

            foreach ($productData['attrs'] as $sortOrder => $attr) {
                ProductAttribute::create([
                    'product_id' => $product->id,
                    'name' => $attr[0],
                    'value' => $attr[1],
                    'sort_order' => ($sortOrder + 1) * 10,
                ]
                );
            }
        }

        $this->command->info('Products seeded: '.Product::count().' total');
    }

    private function generateDescription(string $name): string
    {
        $descriptions = [
            'Высококачественная экологичная упаковка, изготовленная из сертифицированных материалов. Подходит для горячих и холодных блюд. Полностью биоразлагаемая.',
            'Экологичная упаковка из натуральных материалов. Устойчива к влаге и жиру. Идеально подходит для ресторанов, кафе и служб доставки.',
            'Биоразлагаемая упаковка премиум-класса. Сохраняет температуру и свежесть продуктов. Сертифицирована по стандартам FSC.',
            'Упаковка из возобновляемого сырья. Безопасна для контакта с пищевыми продуктами. Компостируется в течение 90 дней.',
            'Стильная экологичная упаковка для вашего бизнеса. Возможность нанесения логотипа. Оптимальное соотношение цены и качества.',
        ];

        return $name.'. '.fake()->randomElement($descriptions);
    }
}
