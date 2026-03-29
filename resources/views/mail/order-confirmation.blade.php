<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F0;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E0E0E0">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#0D1F0D,#1A3A1A);padding:32px;text-align:center">
<div style="display:inline-block;width:40px;height:40px;background:#8BC34A;border-radius:10px;line-height:40px;text-align:center">
<span style="color:#fff;font-weight:bold;font-size:18px">🌿</span>
</div>
<div style="color:#fff;font-size:20px;font-weight:bold;margin-top:8px">EcoShop</div>
</td></tr>

<!-- Main content -->
<tr><td style="padding:32px">
<h1 style="margin:0;font-size:24px;color:#1a1a1a">Спасибо за заказ!</h1>
<p style="color:#666;font-size:14px;margin-top:8px">Ваш заказ <strong style="color:#2E7D32">{{ $order->number }}</strong> успешно создан и принят в обработку.</p>

<table width="100%" style="margin-top:24px;border-collapse:collapse">
<tr>
<td style="padding:12px;background:#F5F5F0;border-radius:8px 8px 0 0;font-size:13px;color:#666">Имя</td>
<td style="padding:12px;background:#F5F5F0;border-radius:8px 8px 0 0;font-size:13px;text-align:right;font-weight:600;color:#1a1a1a">{{ $order->customer_name }}</td>
</tr>
<tr>
<td style="padding:12px;font-size:13px;color:#666">Email</td>
<td style="padding:12px;font-size:13px;text-align:right;color:#1a1a1a">{{ $order->customer_email }}</td>
</tr>
<tr>
<td style="padding:12px;background:#F5F5F0;font-size:13px;color:#666">Доставка</td>
<td style="padding:12px;background:#F5F5F0;font-size:13px;text-align:right;color:#1a1a1a">{{ $order->shipping_method->label() }}</td>
</tr>
<tr>
<td style="padding:12px;font-size:13px;color:#666">Оплата</td>
<td style="padding:12px;font-size:13px;text-align:right;color:#1a1a1a">{{ $order->payment_method->label() }}</td>
</tr>
</table>

<!-- Items -->
<h2 style="font-size:16px;color:#1a1a1a;margin-top:24px">Товары</h2>
<table width="100%" style="border-collapse:collapse;margin-top:8px">
<thead>
<tr style="border-bottom:2px solid #E0E0E0">
<th style="padding:8px 0;text-align:left;font-size:12px;color:#666;font-weight:600">Товар</th>
<th style="padding:8px 0;text-align:center;font-size:12px;color:#666;font-weight:600">Кол-во</th>
<th style="padding:8px 0;text-align:right;font-size:12px;color:#666;font-weight:600">Сумма</th>
</tr>
</thead>
<tbody>
@foreach($order->items as $item)
<tr style="border-bottom:1px solid #f0f0f0">
<td style="padding:12px 0;font-size:13px;color:#1a1a1a">
{{ $item->product_name }}
@if($item->product_sku)<br><span style="color:#999;font-size:11px">{{ $item->product_sku }}</span>@endif
</td>
<td style="padding:12px 0;text-align:center;font-size:13px;color:#666">{{ $item->quantity }}</td>
<td style="padding:12px 0;text-align:right;font-size:13px;font-weight:600;color:#1a1a1a">{{ number_format($item->quantity * $item->price, 0, ',', ' ') }} ₽</td>
</tr>
@endforeach
</tbody>
</table>

<!-- Total -->
<table width="100%" style="margin-top:16px">
<tr>
<td style="padding:12px;background:#F5F5F0;border-radius:8px;font-size:16px;font-weight:bold;color:#1a1a1a">Итого</td>
<td style="padding:12px;background:#F5F5F0;border-radius:8px;font-size:20px;font-weight:bold;color:#2E7D32;text-align:right">{{ number_format($order->total, 0, ',', ' ') }} ₽</td>
</tr>
</table>

@if($order->shipping_address)
<h2 style="font-size:16px;color:#1a1a1a;margin-top:24px">Адрес доставки</h2>
<p style="font-size:13px;color:#666;margin-top:4px">
{{ $order->shipping_address['city'] ?? '' }},
{{ $order->shipping_address['street'] ?? '' }}
{{ $order->shipping_address['building'] ?? '' }}
@if(!empty($order->shipping_address['apartment'])), кв. {{ $order->shipping_address['apartment'] }}@endif
@if(!empty($order->shipping_address['postal_code'])), {{ $order->shipping_address['postal_code'] }}@endif
</p>
@endif

<p style="font-size:13px;color:#666;margin-top:24px">Наш менеджер свяжется с вами для уточнения деталей.</p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;background:#F5F5F0;text-align:center;border-top:1px solid #E0E0E0">
<p style="margin:0;font-size:12px;color:#999">&copy; {{ date('Y') }} EcoShop. Все права защищены.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>
