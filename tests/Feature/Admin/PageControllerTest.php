<?php

use App\Models\Page;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::create(['name' => 'admin']);
});

function makePageAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

describe('Admin\PageController', function () {

    describe('POST /api/admin/pages', function () {

        it('requires admin role', function () {
            $user = User::factory()->create();

            $this->actingAs($user, 'sanctum')
                ->postJson('/api/admin/pages', ['title' => 'Тест'])
                ->assertStatus(403);
        });

        it('keeps allowed markup in content', function () {
            $admin = makePageAdmin();

            $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/pages', [
                    'title' => 'О компании',
                    'content' => '<h2 class="title">Заголовок</h2><p>Текст <strong>жирный</strong></p>',
                ])
                ->assertStatus(201)
                ->assertJsonPath('page.content', '<h2 class="title">Заголовок</h2><p>Текст <strong>жирный</strong></p>');
        });

        it('strips script tags and event handlers from content', function () {
            $admin = makePageAdmin();

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/pages', [
                    'title' => 'XSS',
                    'content' => '<p onclick="alert(1)">Текст</p><script>alert(1)</script>',
                ])
                ->assertStatus(201);

            $content = (string) $response->json('page.content');
            expect($content)->not->toContain('<script')
                ->and($content)->not->toContain('onclick')
                ->and($content)->toContain('Текст');
        });

        it('strips javascript urls from links', function () {
            $admin = makePageAdmin();

            $response = $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/pages', [
                    'title' => 'XSS',
                    'content' => '<a href="javascript:alert(1)">Ссылка</a>',
                ])
                ->assertStatus(201);

            expect((string) $response->json('page.content'))->not->toContain('javascript:');
        });

        it('keeps https and relative links', function () {
            $admin = makePageAdmin();

            $this->actingAs($admin, 'sanctum')
                ->postJson('/api/admin/pages', [
                    'title' => 'Ссылки',
                    'content' => '<p><a href="https://example.com">Внешняя</a> <a href="/catalog">Каталог</a></p>',
                ])
                ->assertStatus(201)
                ->assertJsonPath('page.content', '<p><a href="https://example.com">Внешняя</a> <a href="/catalog">Каталог</a></p>');
        });
    });

    describe('PUT /api/admin/pages/{id}', function () {

        it('sanitizes content on update', function () {
            $admin = makePageAdmin();
            $page = Page::factory()->create();

            $response = $this->actingAs($admin, 'sanctum')
                ->putJson("/api/admin/pages/{$page->id}", [
                    'title' => $page->title,
                    'content' => '<p>Ок</p><iframe src="https://evil.example"></iframe>',
                ])
                ->assertOk();

            $content = (string) $response->json('page.content');
            expect($content)->not->toContain('<iframe')
                ->and($content)->toContain('<p>Ок</p>');
        });
    });
});
