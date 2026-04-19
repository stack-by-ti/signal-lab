# Add scenario

Добавь в Signal Lab новый демо-сценарий по образцу существующих (`success`, `slow_request`, `system_error`).

## Требования

- Имя сценария в `snake_case` и краткое описание.
- Прохождение через API → БД (если принято в проекте) → structured log → Prometheus metrics; для ошибок — корректный HTTP и лог error.
- Строка в таблице сценариев в README.

## Контекст

Следуй `.cursor/rules/stack-guardrails.md` и `.cursor/rules/definition-of-done.md`. Детали workflow — `.cursor/skills/add-scenario-skill.md`.
