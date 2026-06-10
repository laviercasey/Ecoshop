<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use HTMLPurifier;
use HTMLPurifier_Config;
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
        $config = HTMLPurifier_Config::createDefault();
        $config->set('Cache.DefinitionImpl', null);
        $config->set('HTML.DefinitionID', 'ecoshop-pages');
        $config->set('HTML.AllowedElements', ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'section', 'a']);
        $config->set('HTML.AllowedAttributes', ['a.href', '*.class']);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true]);

        $definition = $config->maybeGetRawHTMLDefinition();
        if ($definition !== null) {
            $definition->addElement('section', 'Block', 'Flow', 'Common');
        }

        return (new HTMLPurifier($config))->purify($html);
    }
}
