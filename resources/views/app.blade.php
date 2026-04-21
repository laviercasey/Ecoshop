@php
    $seoTitle = App\Models\Setting::get('general', 'meta_title', config('app.name', 'EcoShop'));
    $seoDescription = App\Models\Setting::get('general', 'meta_description', 'Экологичная одноразовая упаковка для пищевой промышленности. Контейнеры, стаканы, тарелки из биоразлагаемых материалов. Доставка по России.');
    $seoKeywords = App\Models\Setting::get('general', 'meta_keywords');
    $storeName = App\Models\Setting::get('general', 'store_name', 'EcoShop');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $seoTitle }}</title>
        <meta name="description" content="{{ $seoDescription }}">
        @if($seoKeywords)
        <meta name="keywords" content="{{ $seoKeywords }}">
        @endif
        <meta name="robots" content="index, follow">

        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="icon" type="image/svg+xml" href="{{ asset('icons/icon.svg') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16.png') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('favicon-180.png') }}">
        <meta name="theme-color" content="#16a34a">

        <!-- Open Graph -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $seoDescription }}">
        <meta property="og:site_name" content="{{ $storeName }}">
        <meta property="og:locale" content="ru_RU">
        <meta property="og:url" content="{{ request()->url() }}">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    </head>
    <body class="font-sans antialiased">
        <div id="app"></div>
    </body>
</html>
