<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
    ];

    protected function casts(): array
    {
        return [
            'value' => 'json',
        ];
    }

    public static function get(string $group, string $key, mixed $default = null): mixed
    {
        return static::group($group)[$key] ?? $default;
    }

    public static function group(string $group): array
    {
        return Cache::remember("setting_group.{$group}", 300, function () use ($group) {
            return self::where('group', $group)
                ->get()
                ->pluck('value', 'key')
                ->toArray();
        });
    }

    public static function setValue(string $group, string $key, mixed $value): void
    {
        self::updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['value' => $value],
        );

        Cache::forget("setting_group.{$group}");
    }
}
