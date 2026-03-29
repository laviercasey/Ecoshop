<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsOrderManager
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Требуется авторизация'], 401);
        }
        if (!$request->user()->hasAnyRole([
            UserRole::Admin->value,
            UserRole::OrderManager->value,
        ])) {
            return response()->json(['message' => 'Доступ запрещён'], 403);
        }
        return $next($request);
    }
}
