<?php

namespace App\Http\Controllers;

use App\Events\ContactFormSubmitted;
use App\Http\Requests\ContactFormRequest;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function submit(ContactFormRequest $request): JsonResponse
    {
        ContactFormSubmitted::dispatch(
            senderName: (string) $request->input('name'),
            senderEmail: (string) $request->input('email'),
            senderPhone: (string) $request->input('phone', ''),
            messageText: (string) $request->input('message'),
        );

        return response()->json([
            'message' => 'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.',
        ]);
    }
}
