# CRM — B2B продажи/лиды

Django REST Framework backend + React (Vite) frontend. Роли пользователей: `admin` (видит и
редактирует всё) и `manager` (видит и редактирует только свои записи).

## Модули

- Контакты и компании (с историей взаимодействий)
- Сделки / воронка продаж (канбан по этапам)
- Задачи и напоминания (email-уведомления через Celery)
- Аналитика/дашборд (конверсия воронки, выручка по месяцам, активность менеджеров)
- Импорт/экспорт контактов и сделок (CSV/Excel)

## Быстрый старт (Docker Compose — рекомендуется)

```bash
cp .env.example .env
docker compose up --build
```

- Backend: http://localhost:8000/api/
- Django admin: http://localhost:8000/admin/
- Frontend: http://localhost:5173/

При первом запуске накатите миграции и демо-данные (контейнер `backend` уже гоняет `migrate`
автоматически при старте; демо-данные — отдельной командой):

```bash
docker compose exec backend python manage.py seed_demo_data
```

Тестовые пользователи после сидинга: `admin` / `admin12345` (роль admin), `manager1` /
`manager12345` (роль manager).

## Локальный запуск без Docker

### Backend

```bash
cd backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt
venv/bin/python manage.py migrate
venv/bin/python manage.py seed_demo_data   # тестовые пользователи + демо-данные
venv/bin/python manage.py runserver 8000
```

По умолчанию (без `DB_ENGINE=postgres` в окружении) backend использует SQLite — Postgres не
обязателен для локальной разработки. Celery-задачи (email-уведомления, напоминания) по умолчанию
выполняются синхронно в процессе (`CELERY_TASK_ALWAYS_EAGER=True`), так что Redis тоже не
обязателен локально — они действительно асинхронные только при поднятом Redis+воркере
(как в docker-compose).

Тесты: `venv/bin/python -m pytest`

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8000/api
npm install
npm run dev
```

## Структура

```
backend/    Django + DRF API (apps/accounts, companies, contacts, deals, tasks, analytics, imports_export)
frontend/   React + Vite + TypeScript SPA
docker-compose.yml
.env.example
```

## Переменные окружения

См. `.env.example` — Django settings (`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, БД, CORS),
Celery/Redis, email backend и `VITE_API_BASE_URL` для фронтенда.

## Деплой

Конфигурация (env-based settings, отдельные Dockerfile для backend/frontend, Postgres +
Redis + gunicorn) готова к переносу на облачную инфраструктуру (Render, DigitalOcean,
AWS и т.п.) — замените значения в `.env` на продакшн (реальный `SECRET_KEY`, `DEBUG=False`,
домен в `ALLOWED_HOSTS`/`CORS_ALLOWED_ORIGINS`, SMTP для `EMAIL_BACKEND`) и разверните образы
из `backend/Dockerfile` и `frontend/Dockerfile`.
