<?php

use App\Events\ContactFormSubmitted;
use Illuminate\Support\Facades\Event;

describe('ContactController', function () {
    describe('POST /api/contacts', function () {
        it('sends a contact form successfully', function () {
            Event::fake();

            $this->postJson('/api/contacts', [
                'name' => 'Иван Иванов',
                'email' => 'ivan@example.com',
                'phone' => '+7 (999) 123-45-67',
                'message' => 'Хочу узнать о доставке.',
            ])
                ->assertOk()
                ->assertJsonStructure(['message']);

            Event::assertDispatched(ContactFormSubmitted::class, function ($event) {
                return $event->senderName === 'Иван Иванов'
                    && $event->senderEmail === 'ivan@example.com'
                    && $event->senderPhone === '+7 (999) 123-45-67'
                    && $event->messageText === 'Хочу узнать о доставке.';
            });
        });

        it('sends without phone', function () {
            Event::fake();

            $this->postJson('/api/contacts', [
                'name' => 'Анна',
                'email' => 'anna@example.com',
                'message' => 'Вопрос по ассортименту.',
            ])->assertOk();

            Event::assertDispatched(ContactFormSubmitted::class);
        });

        it('requires name', function () {
            $this->postJson('/api/contacts', [
                'email' => 'test@example.com',
                'message' => 'Текст сообщения.',
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['name']);
        });

        it('requires email', function () {
            $this->postJson('/api/contacts', [
                'name' => 'Иван',
                'message' => 'Текст сообщения.',
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });

        it('validates email format', function () {
            $this->postJson('/api/contacts', [
                'name' => 'Иван',
                'email' => 'not-an-email',
                'message' => 'Текст.',
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['email']);
        });

        it('requires message', function () {
            $this->postJson('/api/contacts', [
                'name' => 'Иван',
                'email' => 'test@example.com',
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['message']);
        });

        it('rejects message exceeding max length', function () {
            $this->postJson('/api/contacts', [
                'name' => 'Иван',
                'email' => 'test@example.com',
                'message' => str_repeat('А', 5001),
            ])->assertUnprocessable()
                ->assertJsonValidationErrors(['message']);
        });
    });
});
