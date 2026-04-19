# Signal Lab — Submission Checklist

Заполни этот файл перед сдачей. Он поможет интервьюеру быстро проверить решение.

---

## Репозиторий

- **URL**: `https://github.com/stack-by-ti/signal-lab`
- **Ветка**: `main`
- **Время работы** (приблизительно): `___` часов *(укажи сам по факту)*

---

## Запуск

```bash
# Команда запуска:
docker compose up -d --build

# Команда проверки:
curl -s http://localhost:3001/health
curl -s http://localhost:3001/metrics | head
curl -s -X POST http://localhost:3001/api/scenarios -H 'Content-Type: application/json' -d '{"scenario":"success"}'
# UI: http://localhost:3000
# Prometheus: http://localhost:9090/targets
# Grafana: http://localhost:3002 (admin / admin) → дашборд «Signal Lab»

# Команда остановки:
docker compose down
```

**Предусловия**: Docker Desktop (или Docker Engine) + Docker Compose v2; образы и `npm install` выполняются внутри контейнеров (**отдельный локальный Node не обязателен** для базового запуска). Порты свободны: `3000`, `3001`, `3002`, `5432`, `9090`, `3100`.

---

## Стек — подтверждение использования

| Технология | Используется? | Где посмотреть |
|-----------|:------------:|----------------|
| Next.js (App Router) | ✅ | `frontend/app/` (`layout.tsx`, `page.tsx`), `frontend/next.config.ts` |
| shadcn/ui | ☐ | В проекте не подключён (нет `components/ui`, нет зависимостей shadcn) |
| Tailwind CSS | ✅ | `frontend/tailwind.config.ts`, `frontend/app/globals.css` |
| TanStack Query | ✅ | `frontend/package.json`, `frontend/app/page.tsx` |
| React Hook Form | ✅ | `frontend/package.json`, `frontend/app/page.tsx` |
| NestJS | ✅ | `backend/src/`, `backend/package.json` |
| PostgreSQL | ✅ | `docker-compose.yml` → сервис `postgres`, `DATABASE_URL` у backend |
| Prisma | ✅ | `prisma/schema.prisma`, `backend` → `npx prisma generate` в команде контейнера |
| Sentry | ☐ | В README указан как опциональный; SDK и DSN в коде **не подключены** |
| Prometheus | ✅ | `prometheus/prometheus.yml`, сервис `prometheus` в compose, scrape `backend:3000/metrics` |
| Grafana | ✅ | `grafana/provisioning/`, сервис `grafana`, порт **3002** |
| Loki | ✅ | `loki/loki-config.yaml`, сервис `loki`, Promtail шлёт логи в Loki |

---

## Observability Verification

Опиши, как интервьюер может проверить каждый сигнал:

| Сигнал | Как воспроизвести | Где посмотреть результат |
|--------|-------------------|------------------------|
| Prometheus metric | Поднять compose, дождаться healthy backend; несколько раз вызвать `POST /api/scenarios` | `http://localhost:9090` → **Status → Targets** → job `signal-lab-backend` **UP**; **Graph** → метрики `process_*`, `nodejs_*` и др. с `/metrics` |
| Grafana dashboard | Зайти в Grafana, открыть дашборд **Signal Lab** | `http://localhost:3002` → login **admin/admin** → Dashboards → **Signal Lab** (панель scrape + логи) |
| Loki log | Запустить любой сценарий из UI или `curl` на `POST /api/scenarios` | В том же дашборде панель логов **или** Explore → Loki → `{job="signal-lab"}`; строки JSON из `logs/app.log` (поля `level`, `scenario`, `status`) |
| Sentry exception | — | **Не настроено.** Для проверки нужен был бы DSN и `@sentry/nestjs` + провокация ошибки с отправкой в проект Sentry |

---

## Cursor AI Layer

### Custom Skills

| # | Skill name | Назначение |
|---|-----------|-----------|
| 1 | `add-scenario-skill` | Добавление/изменение демо-сценариев с цепочкой API → БД → логи → метрики |
| 2 | `observability-audit-skill` | Чеклист аудита Prometheus / Loki / Grafana после изменений |
| 3 | `orchestrator-skill` | Порядок слоёв для крупных изменений (Prisma → Nest → API → UI → compose → README) |

*(Файлы: `.cursor/skills/add-scenario-skill.md`, `observability-audit-skill.md`, `orchestrator-skill.md`.)*

### Commands

| # | Command | Что делает |
|---|---------|-----------|
| 1 | `add-scenario` | Промпт для агента: добавить сценарий по образцу существующих |
| 2 | `check-observability` | Промпт для агента: прогнать аудит observability по compose |

*(Файлы: `.cursor/commands/add-scenario.md`, `check-observability.md`.)*

### Hooks

| # | Hook | Какую проблему решает |
|---|------|----------------------|
| 1 | `pre-finalize-checklist.md` | Справочный чеклист перед финалом ответа (не executable hook) |
| 2 | `post-generation-consistency.md` | Справочная сверка имён Prisma/compose/README после генерации |

**Важно:** в репозитории **нет** `hooks.json` с `preToolUse` / `stop` и т.д. — это документирующие markdown в `.cursor/hooks/`. Чтобы хуки реально выполнялись в Cursor, нужен `.cursor/hooks.json` + при необходимости скрипты.

### Rules

| # | Rule file | Что фиксирует |
|---|----------|---------------|
| 1 | `stack-guardrails.md` | Разрешённый стек Signal Lab, без лишних фреймворков |
| 2 | `definition-of-done.md` | Критерии готовности: сборка, сценарии, observability, README |

### Marketplace Skills

| # | Skill | Зачем подключён |
|---|-------|----------------|
| 1 | — | В репозитории не зафиксированы подключения marketplace skills |
| 2 | — | *(персональные skills из `~/.cursor/skills-cursor/` в git не входят)* |
| 3 | — | |
| 4 | — | |
| 5 | — | |
| 6 | — | |

**Что закрыли custom skills, чего нет в marketplace:**

- Доменные правила Signal Lab: сценарии `success` / `slow_request` / `system_error`, связка с Prisma-таблицей запусков, пути логов под Promtail.
- Локальный порядок работ (orchestrator): миграции → backend → контракт → frontend → compose — в generic marketplace обычно нет.

---

## Orchestrator

- **Путь к skill**: `.cursor/skills/orchestrator-skill.md`
- **Путь к context file** (пример): отдельного единого context-файла нет; ориентиры — `README.md`, `prisma/schema.prisma`, `docker-compose.yml`
- **Сколько фаз**: **5** шагов в skill (чтение контекста → план файлов → изменения по слоям → локальный прогон → DoD/README)
- **Какие задачи для fast model**: короткие правки копирайта README, мелкие правки формулировок в `.cursor/commands/*`, простые grep по репо
- **Поддерживает resume**: **нет** (в skill не описан механизм resume; это текстовый гайд для агента)

---

## Скриншоты / видео

- [ ] UI приложения
- [ ] Grafana dashboard с данными
- [ ] Loki logs
- [ ] Sentry error

(Приложи файлы или ссылки ниже)

---

## Что не успел и что сделал бы первым при +4 часах

- Подключить **Sentry** (Nest + опционально frontend) с env DSN и проверкой `system_error`.
- Добавить **`.cursor/hooks.json`** с 1–2 реальными prompt/command hooks вместо только markdown-справочников.
- Вынести типы сценариев в **общий контракт** (или openapi), если интервьюер смотрит на согласованность FE/BE.
- **shadcn/ui** — только если требуется по ТЗ; сейчас UI на Tailwind без shadcn.

---

## Вопросы для защиты (подготовься)

1. Почему именно такая декомпозиция skills?
2. Какие задачи подходят для малой модели и почему?
3. Какие marketplace skills подключил, а какие заменил custom — и почему?
4. Какие hooks реально снижают ошибки в повседневной работе?
5. Как orchestrator экономит контекст по сравнению с одним большим промптом?

---

### Краткие ориентиры к ответам (черновик)

1. **Skills** разделены по типу задачи: сценарий (продукт), аудит (observability), оркестратор (порядок изменений) — меньше смешивания контекста в одном файле.
2. **Малая модель** — узкий diff, линт-стиль, переименования, поиск по репо; архитектура и сквозные сценарии — с полной моделью и оркестратором.
3. **Marketplace** в репо не версионируется; доменные сценарии Signal Lab вынесены в **custom** markdown в `.cursor/`.
4. **Hooks:** сейчас в основном **док-чеклисты**; реальные `hooks.json` снижают ошибки за счёт проверки перед `stop` / после правок критичных путей — это следующий шаг.
5. **Orchestrator** задаёт фазы и «где смотреть» без повторения всего README в каждом запросе — агент подгружает только нужный слой.
