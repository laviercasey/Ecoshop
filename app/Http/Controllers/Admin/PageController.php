<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = Page::latest()->get();

        return response()->json([
            'pages' => PageResource::collection($pages),
        ]);
    }

    public function store(StorePageRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['content'])) {
            $data['content'] = $this->sanitizeHtml($data['content']);
        }

        $page = Page::create($data);

        return response()->json([
            'message' => 'Страница создана',
            'page' => new PageResource($page),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);

        return response()->json([
            'page' => new PageResource($page),
        ]);
    }

    public function update(UpdatePageRequest $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $data = $request->validated();

        if (isset($data['content'])) {
            $data['content'] = $this->sanitizeHtml($data['content']);
        }

        $page->update($data);

        return response()->json([
            'message' => 'Страница обновлена',
            'page' => new PageResource($page),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        $page->delete();

        return response()->json(null, 204);
    }

    private function sanitizeHtml(string $html): string
    {
        $allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'section', 'a'];

        $html = strip_tags($html, '<' . implode('><', $allowedTags) . '>');

        return preg_replace_callback(
            '/<(\w+)(\s[^>]*)?>/',
            function ($matches) {
                $tag = $matches[1];
                $attrs = $matches[2] ?? '';

                $safe = '';
                if (preg_match('/\bclass\s*=\s*"([^"]*)"/', $attrs, $m)) {
                    $safe .= ' class="' . htmlspecialchars($m[1], ENT_QUOTES) . '"';
                }
                if ($tag === 'a' && preg_match('/\bhref\s*=\s*"([^"]*)"/', $attrs, $m)) {
                    if (preg_match('#^(https?://|/)#', $m[1])) {
                        $safe .= ' href="' . htmlspecialchars($m[1], ENT_QUOTES) . '"';
                    }
                }

                return "<{$tag}{$safe}>";
            },
            $html,
        );
    }
}
