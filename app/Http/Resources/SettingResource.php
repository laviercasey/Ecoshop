<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    private const SENSITIVE_KEYS = ['yukassa_secret_key', 'cdek_api_key'];

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'group' => $this->group,
            'key' => $this->key,
            'value' => in_array($this->key, self::SENSITIVE_KEYS, true) ? '***' : $this->value,
        ];
    }
}
