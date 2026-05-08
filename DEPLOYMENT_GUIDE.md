# 🚀 Полное руководство по деплою Booking Platform

В этом файле собраны все шаги по настройке сервера и быстрые команды для ежедневного обновления.

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

### 2. На сервере (Backend - Port 9001)
```bash
cd ~/booking04
git pull
# Если есть конфликты в main.py: git checkout app/main.py && git pull
pm2 restart booking-api
```

### 3. На сервере (Frontend - Port 3000)
```bash
cd ~/front-back
git pull
rm -rf .next
npm run build   # ДОЖДАТЬСЯ КОНЦА!
pm2 restart front-back
```

---

## 🛠 ПОДРОБНАЯ НАСТРОЙКА СЕРВЕРА (Архив)

### 1. Подготовка сервера (Memory & Storage)
Если процесс сборки вылетает с ошибкой `Killed`, создай **SWAP (файл подкачки)**:
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Бэкенд (FastAPI + PM2)
Мы используем порт **9001**, так как 9000 занят другим процессом.
Запуск через виртуальное окружение:
```bash
cd ~/booking04
pm2 start .venv/bin/python3 --name "booking-api" -- -m uvicorn app.main:app --host 0.0.0.0 --port 9001
```

### 3. Настройка Nginx (Reverse Proxy)
Файл: `/etc/nginx/sites-enabled/booking`
```nginx
location / {
    proxy_pass http://localhost:3000; # К фронтенду
}

location /api/ {
    proxy_pass http://localhost:9001/; # К нашему бэкенду
}
```
После правок: `sudo systemctl restart nginx`

### 4. CORS и Google OAuth
- В бэкенде (`main.py`) в `allow_origins` должен быть `https://student1.softclub.tj`.
- В Google Console в Redirect URIs добавь: `https://student1.softclub.tj/api/auth/google/callback`.

---

## 📊 Полезные команды
- `pm2 status` — список всех запущенных сайтов.
- `pm2 logs booking-api` — смотреть ошибки бэкенда в реальном времени.
- `sqlite3 ~/booking04/booking.db` — зайти в базу данных.

### 5. Безопасность и Сеть (Фаервол)
Если сайт не открывается, проверь открыты ли порты:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 9001/tcp
sudo ufw reload
```

---
*Сохранено для Amonsho. Удачного кодинга!* 🥂

