<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 'regex:/^[^\r\n]+$/'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[\d\s\+\-\(\)]+$/'],
            'message' => ['required', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Укажите ваше имя.',
            'name.regex' => 'Имя содержит недопустимые символы.',
            'email.required' => 'Укажите email.',
            'email.email' => 'Введите корректный email.',
            'message.required' => 'Напишите сообщение.',
            'message.max' => 'Сообщение не должно превышать 5000 символов.',
        ];
    }
}
