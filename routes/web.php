<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

Route::get('/{any?}', function () {
    $buildIndex = public_path('build/index.html');
    if (file_exists($buildIndex)) {
        return response(file_get_contents($buildIndex), 200, ['Content-Type' => 'text/html; charset=UTF-8']);
    }

    return view('app');
})->where('any', '^(?!api).*$')->name('spa');
