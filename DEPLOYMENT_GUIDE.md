# Руководство по деплою Booking Platform

В этом файле собраны все шаги, которые мы предприняли для успешного запуска проекта на Ubuntu сервере.

---

## 1. Подготовка сервера (Memory & Storage)
Если сервер слабый (4GB RAM) и процесс сборки вылетает с ошибкой `Killed`, нужно создать **SWAP (файл подкачки)**.
```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
# Чтобы swap работал после перезагрузки:
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. Развертывание Фронтенда (Next.js)
Мы используем **PM2** для управления процессом.

### Основные шаги:
1. `git pull origin main` — скачать свежий код.
2. `npm install` — установить библиотеки.
3. `nano .env` — настроить адрес бэкенда:
   `NEXT_PUBLIC_API_URL=https://student1.softclub.tj/api`
4. `npm run build` — собрать проект.
5. `pm2 restart front-booking` — перезапустить процесс.

### Команды PM2:
- `pm2 status` — статус процессов.
- `pm2 logs front-booking` — просмотр логов.
- `pm2 save` — сохранить список процессов для автозапуска.

---

## 3. Развертывание Бэкенда (FastAPI)
Бэкенд работает как системная служба **systemd**.

### Конфигурация службы:
Путь: `/etc/systemd/system/booking.service`
Ключевой момент: использование `--bind 0.0.0.0:9000` для доступа извне.

### Управление службой:
- `sudo systemctl daemon-reload` — обновить конфиги.
- `sudo systemctl restart booking` — перезагрузить бэкенд.
- `sudo systemctl status booking` — проверить, запущен ли.
- `sudo journalctl -u booking -f` — смотреть ошибки бэкенда в реальном времени.

---

## 4. Настройка Nginx (Reverse Proxy & SSL)
Nginx принимает запросы на 80/443 портах и распределяет их.

### Конфигурация:
Файл: `/etc/nginx/sites-available/booking`
```nginx
server {
    listen 80;
    server_name student1.softclub.tj;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name student1.softclub.tj;

    ssl_certificate /etc/letsencrypt/live/student1.softclub.tj/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/student1.softclub.tj/privkey.pem;

    location / {
        proxy_pass http://localhost:3000; # К фронтенду
    }

    location /api/ {
        proxy_pass http://localhost:9000/; # К бэкенду
    }
}
```

---

## 5. Безопасность и Сеть
### Фаервол (UFW):
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 9000/tcp
sudo ufw reload
```

### CORS в FastAPI (app/main.py):
Всегда добавляйте домен в список разрешенных:
```python
allow_origins=[
    "https://student1.softclub.tj",
    "http://student1.softclub.tj",
]
```

---

## 6. Сторонние интеграции (Google OAuth)
1. В **Google Cloud Console** добавьте ваш домен `https://student1.softclub.tj` в:
   - Authorized JavaScript origins
   - Authorized redirect URIs (`/en/auth/callback` и `/ru/auth/callback`)
2. Google НЕ принимает IP-адреса, поэтому домен обязателен.

---
*Сохранено для Amonsho. Удачного кодинга!*
