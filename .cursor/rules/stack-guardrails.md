---
description: Ограничения стека и архитектуры Signal Lab для агента
alwaysApply: true
---

# Stack guardrails (Signal Lab)

## Разрешённый стек

- **Frontend**: Next.js (App Router), React Hook Form, TanStack Query, Tailwind CSS.
- **Backend**: NestJS.
- **Данные**: PostgreSQL, Prisma ORM.
- **Observability**: Prometheus, Grafana, Loki, Promtail; Sentry — только если уже подключён в проекте.
- **Инфра**: Docker Compose для локального запуска.

## Запреты и осторожность

- Не добавлять альтернативные ORM, БД или фронтенд-фреймворки «на пробу» без явного запроса.
- Не отключать structured logging, метрики и корреляцию запросов там, где они уже есть — только улучшать.
- Сценарии демо (`success`, `slow_request`, `system_error`) должны оставаться предсказуемыми: явные имена, документированное поведение.

## Изменения в Docker / compose

- Сохранять совместимость с `docker compose up -d --build`.
- Новые сервисы observability — только если они вписываются в текущую схему и задокументированы.

## Качество кода

- Соответствовать существующим паттернам репозитория (именование, слои NestJS, структура App Router).
- Минимальный дифф: не рефакторить несвязанные модули.
