# AGENTS.md

## What Is This?

TaskFlow — a task management app with a FastAPI backend and React frontend. Docker Compose runs both services.

## Docs

Detailed documentation lives in `docs/`:

- `docs/ARCHITECTURE.md` — project structure, tech stack, how frontend/backend connect
- `docs/BACKEND.md` — API reference, DB schema, migration pattern, how to add fields/endpoints, testing guide
- `docs/FRONTEND.md` — component tree, API layer, routing, how to add fields/pages
- `docs/DEVELOPMENT.md` — command reference, checklists for each type of change, PR conventions

**Read the relevant doc before making changes.**

## Before You Code

1. Read the doc that matches your change area (`BACKEND.md` for API/DB, `FRONTEND.md` for UI, `DEVELOPMENT.md` for checklists)
2. Understand the existing patterns — follow the same style, naming, and conventions
3. Check `app/database.py` for the `MIGRATIONS` list pattern when adding DB columns

## Before You Push / Create PR

Run validation:

```bash
# Backend — from backend/
ruff check .
python -m compileall . -q
pytest -q

# Frontend — from frontend/
npm run build
```

All must pass with zero errors.

## Adding a New Field to Tasks

Three places must be updated in the backend:

1. `app/database.py` — column in `CREATE TABLE` + migration in `MIGRATIONS` list
2. `app/models.py` — add to `TaskCreate`, `TaskUpdate`, `TaskResponse`
3. `app/routes.py` — update SQL queries in `create_task` and `update_task`

Then update frontend (`src/api.ts` interfaces + relevant components).

See `docs/BACKEND.md` and `docs/FRONTEND.md` for full details.