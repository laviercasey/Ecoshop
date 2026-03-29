<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBannerRequest;
use App\Http\Requests\Admin\UpdateBannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = Banner::orderBy('position')->get();

        return response()->json([
            'banners' => BannerResource::collection($banners),
        ]);
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('banners');
        }

        $banner = Banner::create($data);

        return response()->json([
            'message' => 'Баннер создан',
            'banner' => new BannerResource($banner),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);

        return response()->json([
            'banner' => new BannerResource($banner),
        ]);
    }

    public function update(UpdateBannerRequest $request, int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($banner->image);
            $data['image'] = $request->file('image')->store('banners');
        }

        $banner->update($data);

        return response()->json([
            'message' => 'Баннер обновлён',
            'banner' => new BannerResource($banner),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $banner = Banner::findOrFail($id);
        $this->deleteStoredImage($banner->image);
        $banner->delete();

        return response()->json(null, 204);
    }

    private function deleteStoredImage(?string $imagePath): void
    {
        if ($imagePath && preg_match('#^banners/[^/]+$#', $imagePath)) {
            Storage::delete($imagePath);
        }
    }
}
