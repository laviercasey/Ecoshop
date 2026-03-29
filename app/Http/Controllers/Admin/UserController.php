<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($search = $request->query('search')) {
            $search = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $search);
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"));
        }

        if ($role = $request->query('role')) {
            $query->role($role);
        }

        $perPage = min((int) $request->query('per_page', 15), 100);
        $users = $query->latest()->paginate($perPage);

        return response()->json([
            'users' => UserResource::collection($users),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'phone'    => $data['phone'] ?? null,
        ]);

        $user->assignRole($data['role']);
        $user->load('roles');

        return response()->json([
            'message' => 'Пользователь создан',
            'user'    => new UserResource($user),
        ], 201);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $data = $request->validated();

        if (isset($data['role']) && $user->id === $request->user()->id) {
            return response()->json(['message' => 'Нельзя изменить собственную роль'], 422);
        }

        $originalEmail = $user->email;
        $user->update(collect($data)->except('role')->toArray());

        if (isset($data['email']) && $data['email'] !== $originalEmail) {
            $user->update(['email_verified_at' => null]);
        }

        if (isset($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        $user->load('roles');

        return response()->json([
            'message' => 'Пользователь обновлён',
            'user' => new UserResource($user),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse|Response
    {
        return DB::transaction(function () use ($request, $id) {
            $user = User::lockForUpdate()->findOrFail($id);

            if ($user->id === $request->user()->id) {
                return response()->json(['message' => 'Нельзя удалить собственный аккаунт'], 422);
            }

            if ($user->orders()->exists()) {
                return response()->json(['message' => 'Нельзя удалить пользователя с историей заказов'], 422);
            }

            if ($user->hasRole(\App\Enums\UserRole::Admin->value)) {
                $adminCount = User::role(\App\Enums\UserRole::Admin->value)->count();
                if ($adminCount <= 1) {
                    return response()->json(['message' => 'Нельзя удалить последнего администратора'], 422);
                }
            }

            $user->delete();

            return response()->noContent();
        });
    }
}
