<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F0;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E0E0E0">
<tr><td style="background:#8BC34A;padding:24px 32px;color:#fff;font-size:18px;font-weight:bold">
🛒 Новый заказ {{ $order->number }}
</td></tr>
<tr><td style="padding:32px">
<table width="100%" style="border-collapse:collapse">
<tr><td style="padding:8px 0;font-size:13px;color:#666">Клиент</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a1a;text-align:right">{{ $order->customer_name }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#666">Email</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;text-align:right">{{ $order->customer_email }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#666">Телефон</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;text-align:right">{{ $order->customer_phone ?: '—' }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#666">Доставка</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;text-align:right">{{ $order->shipping_method->label() }}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#666">Оплата</td><td style="padding:8px 0;font-size:14px;color:#1a1a1a;text-align:right">{{ $order->payment_method->label() }}</td></tr>
</table>
<div style="margin-top:16px;padding:16px;background:#F5F5F0;border-radius:8px">
<div style="font-size:14px;color:#666">Сумма заказа</div>
<div style="font-size:24px;font-weight:bold;color:#2E7D32;margin-top:4px">{{ number_format($order->total, 0, ',', ' ') }} ₽</div>
<div style="font-size:12px;color:#999;margin-top:4px">{{ $order->items->count() }} товар(ов)</div>
</div>
<p style="margin-top:16px;font-size:13px;color:#666">
<a href="{{ url('/admin/orders/' . $order->id) }}" style="color:#2E7D32;font-weight:600">Открыть в админке →</a>
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
