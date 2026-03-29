<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Enums\ShippingMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $rules = [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:20', 'regex:/^[\d\s\+\-\(\)]+$/'],
            'shipping_method' => ['required', Rule::enum(ShippingMethod::class)],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'customer_note' => ['nullable', 'string', 'max:5000'],
        ];

        if ((string) $this->input('shipping_method') !== ShippingMethod::Pickup->value) {
            $rules['city'] = ['required', 'string', 'max:255'];
            $rules['street'] = ['required', 'string', 'max:255'];
            $rules['building'] = ['nullable', 'string', 'max:50'];
            $rules['apartment'] = ['nullable', 'string', 'max:50'];
            $rules['postal_code'] = ['nullable', 'string', 'max:10'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'customer_name.required' => 'Укажите ваше имя',
            'customer_email.required' => 'Укажите email',
            'customer_email.email' => 'Укажите корректный email',
            'shipping_method.required' => 'Выберите способ доставки',
            'payment_method.required' => 'Выберите способ оплаты',
            'city.required' => 'Укажите город',
            'street.required' => 'Укажите улицу',
        ];
    }
}
