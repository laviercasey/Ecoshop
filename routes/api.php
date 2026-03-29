<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/home', HomeController::class);
Route::get('/catalog', [CatalogController::class, 'index']);
Route::get('/catalog/all', [CatalogController::class, 'all']);
Route::get('/catalog/{slug}', [CatalogController::class, 'show']);
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::post('/contacts', [ContactController::class, 'submit'])->middleware('throttle:5,1');

Route::prefix('cart')->middleware('throttle:60,1')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/', [CartController::class, 'add']);
    Route::patch('/{product}', [CartController::class, 'update']);
    Route::delete('/{product}', [CartController::class, 'remove']);
});

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,60');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

Route::middleware('auth:sanctum')->prefix('account')->group(function () {
    Route::get('/orders', [AccountController::class, 'index']);
    Route::get('/orders/{orderId}', [AccountController::class, 'showOrder']);
});

Route::middleware(['auth:sanctum', 'throttle:10,1'])->prefix('checkout')->group(function () {
    Route::get('/', [CheckoutController::class, 'options']);
    Route::post('/', [CheckoutController::class, 'store']);
    Route::get('/success/{order}', [CheckoutController::class, 'success']);
});

Route::middleware(['auth:sanctum', 'staff', 'throttle:120,1'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [Admin\DashboardController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'order_manager', 'throttle:120,1'])->prefix('admin')->group(function () {
    Route::get('/orders', [Admin\OrderController::class, 'index']);
    Route::get('/orders/{id}', [Admin\OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [Admin\OrderController::class, 'updateStatus']);
});

Route::middleware(['auth:sanctum', 'content_manager', 'throttle:60,1'])->prefix('admin')->group(function () {
    Route::apiResource('products', Admin\ProductController::class);
    Route::apiResource('categories', Admin\CategoryController::class);
    Route::apiResource('banners', Admin\BannerController::class);
    Route::apiResource('pages', Admin\PageController::class);
});

Route::middleware(['auth:sanctum', 'admin', 'throttle:60,1'])->prefix('admin')->group(function () {
    Route::get('/users', [Admin\UserController::class, 'index']);
    Route::post('/users', [Admin\UserController::class, 'store']);
    Route::put('/users/{id}', [Admin\UserController::class, 'update']);
    Route::delete('/users/{id}', [Admin\UserController::class, 'destroy']);
    Route::get('/settings', [Admin\SettingController::class, 'index']);
    Route::put('/settings', [Admin\SettingController::class, 'update']);
});
