<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    private const ALLOWED_KEYS = [
        'general' => [
            'store_name', 'store_email', 'store_phone', 'store_website',
            'phone', 'email', 'address', 'company_name', 'inn',
            'city', 'postal_code', 'legal_address', 'ogrn',
            'meta_title', 'meta_description', 'meta_keywords',
            'logo', 'notify_new_order', 'notify_status_change', 'notify_low_stock',
            'social_vk', 'social_telegram', 'social_instagram',
        ],
        'payment' => [
            'min_order_amount', 'free_shipping_threshold',
            'card_enabled', 'cash_enabled', 'sbp_enabled',
            'yukassa_shop_id', 'yukassa_secret_key', 'yukassa_test_mode', 'currency',
        ],
        'shipping' => [
            'default_method', 'cdek_api_key', 'cdek_rate', 'russian_post_rate',
            'pickup_enabled', 'cdek_enabled', 'russian_post_enabled', 'free_shipping_threshold',
            'cdek_description', 'pickup_address', 'pickup_schedule',
            'russian_post_description', 'free_delivery_enabled',
            'free_delivery_threshold', 'free_delivery_regions',
        ],
        'seo' => ['title', 'description', 'keywords', 'robots'],
        'notifications' => ['order_new_email', 'order_status_email', 'low_stock_email', 'low_stock_threshold'],
    ];

    public function index(Request $request): JsonResponse
    {
        $query = Setting::query();

        if ($group = $request->query('group')) {
            $allowed = ['general', 'seo', 'shipping', 'payment', 'notifications'];
            if (in_array($group, $allowed, true)) {
                $query->where('group', $group);
            }
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        return response()->json([
            'settings' => SettingResource::collection($settings),
        ]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $sensitiveKeys = ['yukassa_secret_key', 'cdek_api_key'];

        $rejected = [];
        $toWrite = [];

        foreach ($data['settings'] as $setting) {
            $group = $setting['group'];
            $key = $setting['key'];

            if (!in_array($key, self::ALLOWED_KEYS[$group] ?? [], true)) {
                $rejected[] = "{$group}.{$key}";
                continue;
            }

            if (in_array($key, $sensitiveKeys, true)
                && ($setting['value'] === '' || $setting['value'] === '***')) {
                continue;
            }

            $toWrite[] = $setting;
        }

        if (!empty($rejected)) {
            return response()->json([
                'message' => 'Некоторые ключи настроек не разрешены: ' . implode(', ', $rejected),
            ], 422);
        }

        foreach ($toWrite as $setting) {
            Setting::setValue($setting['group'], $setting['key'], $setting['value']);
        }

        $settings = Setting::orderBy('group')->orderBy('key')->get();

        return response()->json([
            'message' => 'Настройки обновлены',
            'settings' => SettingResource::collection($settings),
        ]);
    }
}
