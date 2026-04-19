# Signal Lab

Signal Lab — локальная демонстрационная система observability для запуска сценариев, проверки метрик, логов, ошибок и истории выполнения.

Проект показывает, как production-oriented сервис может быть быстро развёрнут локально и предоставлять прозрачную диагностику через стандартный стек мониторинга.

---

# Используемый стек

## Frontend
- Next.js (App Router)
- React Hook Form
- TanStack Query
- Tailwind CSS

## Backend
- NestJS

## Data Layer
- PostgreSQL
- Prisma ORM

## Observability
- Prometheus
- Grafana
- Loki
- Promtail
- Sentry (опционально)

## Infra
- Docker Compose

---

# Что демонстрирует проект

Signal Lab позволяет запускать тестовые сценарии и наблюдать сигналы системы.

| Сценарий | Описание |
|--------|----------|
| success | успешное выполнение |
| slow_request | искусственная задержка ответа |
| system_error | контролируемая ошибка backend |

Каждый запуск формирует:

- HTTP API response
- запись в базе данных
- structured log
- обновление Prometheus metrics
- данные для Grafana dashboard
- событие ошибки (если подключён Sentry)

---

# Быстрый запуск

## Требования

- Docker Desktop запущен
- Docker Compose доступен

## Запуск проекта

```bash
docker compose up -d --build