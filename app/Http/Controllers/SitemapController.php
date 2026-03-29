<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $products = Product::published()
            ->select('slug', 'updated_at')
            ->orderByDesc('updated_at')
            ->get();

        $categories = Category::where('is_active', true)
            ->select('slug', 'updated_at')
            ->get();

        $content = view('sitemap', [
            'products' => $products,
            'categories' => $categories,
        ])->render();

        return response($content, 200)
            ->header('Content-Type', 'application/xml');
    }
}
