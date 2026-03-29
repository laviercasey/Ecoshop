<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::with(['children' => fn ($q) => $q->orderBy('sort_order')])
            ->withCount('products');

        if ($request->boolean('roots_only', false)) {
            $query->roots();
        }

        $categories = $query->orderBy('sort_order')->get();

        return response()->json([
            'categories' => CategoryResource::collection($categories),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = Category::create($request->validated());
        $category->loadCount('products');
        $category->load('children');

        return response()->json([
            'message' => 'Категория создана',
            'category' => new CategoryResource($category),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = Category::with(['children' => fn ($q) => $q->orderBy('sort_order')])
            ->withCount('products')
            ->findOrFail($id);

        return response()->json([
            'category' => new CategoryResource($category),
        ]);
    }

    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $category = DB::transaction(function () use ($data, $id) {
            $category = Category::lockForUpdate()->findOrFail($id);

            if (isset($data['parent_id'])) {
                $this->validateNoCyclicNesting($id, $data['parent_id']);
            }

            $category->update($data);
            $category->loadCount('products');
            $category->load('children');

            return $category;
        });

        return response()->json([
            'message' => 'Категория обновлена',
            'category' => new CategoryResource($category),
        ]);
    }

    public function destroy(int $id): JsonResponse|Response
    {
        $category = Category::findOrFail($id);

        if ($category->children()->exists()) {
            return response()->json([
                'message' => 'Невозможно удалить категорию с подкатегориями',
            ], 422);
        }

        $category->products()->detach();
        $category->delete();

        return response()->noContent();
    }

    private function validateNoCyclicNesting(int $categoryId, int $parentId): void
    {
        $visited = [];
        $currentParentId = $parentId;
        $maxDepth = 20;

        while ($currentParentId !== null) {
            if ($currentParentId === $categoryId || in_array($currentParentId, $visited)) {
                abort(422, 'Нельзя создать циклическую вложенность категорий');
            }
            if (count($visited) >= $maxDepth) {
                abort(422, 'Превышена максимальная глубина вложенности категорий');
            }
            $visited[] = $currentParentId;
            $currentParentId = Category::where('id', $currentParentId)->value('parent_id');
        }
    }
}
