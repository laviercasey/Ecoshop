<?php

use App\Models\Page;

describe('PageController', function () {
    describe('GET /api/pages/{slug}', function () {
        it('returns a published page', function () {
            $page = Page::factory()->create([
                'title' => 'О компании',
                'slug' => 'about',
                'content' => '<p>Текст страницы</p>',
                'meta_title' => 'О нас',
                'meta_description' => 'Описание страницы',
            ]);

            $this->getJson('/api/pages/about')
                ->assertOk()
                ->assertJsonPath('page.title', 'О компании')
                ->assertJsonPath('page.slug', 'about')
                ->assertJsonPath('page.content', '<p>Текст страницы</p>')
                ->assertJsonPath('page.meta.title', 'О нас')
                ->assertJsonPath('page.meta.description', 'Описание страницы')
                ->assertJsonPath('page.is_published', true);
        });

        it('returns correct response structure', function () {
            Page::factory()->create(['slug' => 'delivery']);

            $this->getJson('/api/pages/delivery')
                ->assertOk()
                ->assertJsonStructure([
                    'page' => [
                        'id',
                        'title',
                        'slug',
                        'content',
                        'meta' => ['title', 'description'],
                        'is_published',
                        'created_at',
                        'updated_at',
                    ],
                ]);
        });

        it('returns 404 for unpublished page', function () {
            Page::factory()->unpublished()->create(['slug' => 'hidden']);

            $this->getJson('/api/pages/hidden')
                ->assertNotFound();
        });

        it('returns 404 for non-existent slug', function () {
            $this->getJson('/api/pages/non-existent')
                ->assertNotFound();
        });
    });
});
