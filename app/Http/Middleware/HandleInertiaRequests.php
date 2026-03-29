<?php

namespace App\Http\Middleware;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? new \App\Http\Resources\UserResource($request->user()) : null,
            ],
            'settings' => fn () => [
                'store_name' => 'EcoShop',
                'phone' => null,
                'email' => null,
                'address' => null,
                'company_name' => null,
                ...array_intersect_key(
                    Setting::group('general'),
                    array_flip(['store_name', 'phone', 'email', 'address', 'company_name']),
                ),
            ],
            'categories' => fn () => Cache::remember('nav_categories', 60, fn () =>
                CategoryResource::collection(
                    Category::active()
                        ->roots()
                        ->with(['children' => fn ($q) => $q->active()->orderBy('sort_order')])
                        ->orderBy('sort_order')
                        ->get()
                )
            ),
            'cartCount' => fn () => (int) collect(session('cart', []))->sum(),
            'seo' => [
                'title' => 'EcoShop — экологичная упаковка для бизнеса',
                'description' => 'Экологичная одноразовая упаковка для пищевой промышленности. Контейнеры, стаканы, тарелки из биоразлагаемых материалов. Доставка по России.',
                'url' => $request->url(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
