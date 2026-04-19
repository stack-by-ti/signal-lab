# Check observability

Проведи аудит observability для Signal Lab после последних изменений или для указанного сценария/endpoint.

## Сделай

1. Подтверди локальный запуск через Docker Compose (как в README).
2. Прогони релевантный сценарий и проверь цепочку: HTTP → логи (Loki/Promtail) → метрики (Prometheus) → релевантные панели Grafana; Sentry — если подключён.

## Выход

Краткий отчёт: ок / проблемы с указанием файлов конфигов или кода. Используй `.cursor/skills/observability-audit-skill.md`.
