# 🚀 Полное руководство по деплою Booking Platform

В этом файле собраны все шаги по настройке сервера, исправлению ошибок и быстрой автоматизации.

---

## ⚡️ БЫСТРОЕ ОБНОВЛЕНИЕ (Для ежедневной работы)

Если ты изменил код на Макбуке и хочешь быстро обновить сайт:

### 1. На Макбуке (Local)
```bash
# В папке фронтенда:
git add . && git commit -m "update" && git push origin main

# В папке бэкенда:
git add . && git commit -m "update" && git push origin main
```

### 2. На сервере (Автоматически через скрипт)
Если ты создал `update.sh` (см. ниже), просто запусти его:
```bash
~/update.sh
```

---

## 🤖 АВТОМАТИЗАЦИЯ (Скрипт обновления)

Чтобы обновлять всё одной командой, создай на сервере файл `update.sh`:
```bash
nano ~/update.sh
```
Вставь туда этот код:
```bash
#!/bin/bash
echo "--- Обновление Бэкенда ---"
cd ~/booking04 && git pull && pm2 restart booking-api

echo "--- Обновление Фронтенда ---"
cd ~/front-back && git pull && rm -rf .next && npm run build && pm2 restart front-back

echo "✅ Все системы обновлены и перезапущены!"
```
Дай права: `chmod +x ~/update.sh`. Теперь запуск через `~/update.sh`.

---

## 🛠 ПОДРОБНАЯ НАСТРОЙКА СЕРВЕРА

### 1. Подготовка сервера (Memory & Storage)
Если процесс сборки (`npm run build`) вылетает с ошибкой `Killed`, создай **SWAP (файл подкачки)**:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Бэкенд (FastAPI + PM2)
Мы используем порт **9001**.
Запуск через виртуальное окружение:
```bash
cd ~/booking04
pm2 start .venv/bin/python3 --name "booking-api" -- -m uvicorn app.main:app --host 0.0.0.0 --port 9001
```

### 3. Настройка Nginx (Reverse Proxy)
Файл: `/etc/nginx/sites-enabled/booking`
**Важно:** Используй `127.0.0.1` вместо `localhost`, чтобы избежать ошибок подключения (IPv6 bug).
```nginx
location / {
    proxy_pass http://127.0.0.1:3000; # К фронтенду
}

location /api/ {
    proxy_pass http://127.0.0.1:9001/; # К бэкенду
}
```
После правок: `sudo systemctl restart nginx`

### 4. Настройка Stripe Webhook (Авто-подтверждение брони)
1. В Stripe Dashboard (Test Mode) добавь URL: `https://student1.softclub.tj/api/payment/payments/webhook`
2. Выбери событие: `checkout.session.completed`.
3. Скопируй `Signing secret` (whsec_...).
4. Добавь его в `.env` бэкенда: `STRIPE_WEBHOOK_SECRET=whsec_...`
5. Перезапусти бэкенд: `pm2 restart booking-api`.

### 5. CORS и Google OAuth
- В бэкенде (`main.py`) в `allow_origins` должен быть `https://student1.softclub.tj`.
- В Google Console в Redirect URIs добавь: `https://student1.softclub.tj/api/auth/google/callback`.

### 6. Сжатие картинок (Оптимизация)
В проекте реализовано сжатие на стороне клиента (библиотека `browser-image-compression`). 
- Фото сжимаются до 1200px перед отправкой.
- Это экономит место на диске сервера и ускоряет загрузку.

---

## 📊 Полезные команды
- `pm2 status` — список всех процессов.
- `pm2 logs booking-api` — логи бэкенда (ошибки оплаты смотреть тут).
- `pm2 logs front-back` — логи фронтенда.
- `sqlite3 ~/booking04/booking.db` — база данных (если используется SQLite).
- `psql` — если используется PostgreSQL.

### 7. Безопасность и Сеть (UFW)
Если сайт не открывается, проверь порты:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 9001/tcp
sudo ufw reload
```

---
*Обновлено: 08.05.2024. Сохранено для Amonsho.* 🥂
