<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F0;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E0E0E0">
<tr><td style="background:linear-gradient(135deg,#0D1F0D,#1A3A1A);padding:24px 32px;color:#fff;font-size:18px;font-weight:bold">
Новое сообщение с сайта
</td></tr>
<tr><td style="padding:32px">
<table width="100%" style="border-collapse:collapse">
<tr>
<td style="padding:8px 0;font-size:13px;color:#666;width:100px">Имя</td>
<td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a1a1a">{{ $senderName }}</td>
</tr>
<tr>
<td style="padding:8px 0;font-size:13px;color:#666">Email</td>
<td style="padding:8px 0;font-size:14px;color:#1a1a1a"><a href="mailto:{{ $senderEmail }}" style="color:#2E7D32">{{ $senderEmail }}</a></td>
</tr>
@if($senderPhone)
<tr>
<td style="padding:8px 0;font-size:13px;color:#666">Телефон</td>
<td style="padding:8px 0;font-size:14px;color:#1a1a1a">{{ $senderPhone }}</td>
</tr>
@endif
</table>
<div style="margin-top:16px;padding:16px;background:#F5F5F0;border-radius:8px;font-size:14px;color:#1a1a1a;line-height:1.6">
{!! nl2br(e($messageText)) !!}
</div>
</td></tr>
<tr><td style="padding:16px 32px;background:#F5F5F0;text-align:center;font-size:12px;color:#999">
EcoShop — форма обратной связи
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
