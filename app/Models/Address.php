<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    protected $fillable = [
        'type',
        'city',
        'street',
        'building',
        'apartment',
        'postal_code',
        'region',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fullAddress(): string
    {
        $parts = array_filter([
            $this->postal_code,
            $this->region,
            $this->city,
            $this->street,
            $this->building ? "д. {$this->building}" : null,
            $this->apartment ? "кв. {$this->apartment}" : null,
        ]);

        return implode(', ', $parts);
    }
}
