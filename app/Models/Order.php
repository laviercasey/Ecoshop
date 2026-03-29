<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\ShippingMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Order extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'number',
        'user_id',
        'status',
        'subtotal',
        'shipping_cost',
        'total',
        'payment_method',
        'shipping_method',
        'tracking_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_note',
        'shipping_address',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_method' => PaymentMethod::class,
            'shipping_method' => ShippingMethod::class,
            'subtotal' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'total' => 'decimal:2',
            'shipping_address' => 'array',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'tracking_number'])
            ->logOnlyDirty();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderByDesc('created_at');
    }

    public function scopeByStatus($query, OrderStatus $status)
    {
        return $query->where('status', $status);
    }

    public static function generateNumber(): string
    {
        $attempts = 0;
        do {
            if (++$attempts > 10) {
                throw new \RuntimeException('Could not generate a unique order number after 10 attempts');
            }
            $prefix = 'ECO';
            $date = now()->format('ymd');
            $random = str_pad((string) random_int(1, 9999999), 7, '0', STR_PAD_LEFT);
            $number = "{$prefix}-{$date}-{$random}";
        } while (self::where('number', $number)->exists());

        return $number;
    }
}
