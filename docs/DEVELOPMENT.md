# Development Guide

## Quick Reference

### Backend Commands (run from `backend/`)

```bash
pip install -r requirements.txt   # Install dependencies
pytest -q                         # Run tests
ruff check .                      # Lint
python -m compileall . -q         # Syntax check
uvicorn app.main:app --reload     # Dev server (port 8000)
```

### Frontend Commands (run from `frontend/`)

```bash
npm install                       # Install dependencies
npm run dev                       # Dev server (port 3000)
npm run build                     # Production build (also checks TypeScript)
npm run lint                      # ESLint
```

### Docker Commands (run from project root)

```bash
docker compose up --build         # Build and start everything
docker compose up -d               # Start in background
docker compose down                # Stop everything
docker compose logs -f backend    # Follow backend logs
docker compose logs -f frontend    # Follow frontend logs
```

## Adding a New Backend Field — Checklist

When adding a field like `priority` or `due_date`:

- [ ] **`app/database.py`** — Add column to `CREATE TABLE` statement
- [ ] **`app/database.py`** — Add `ALTER TABLE` migration to `MIGRATIONS` list
- [ ] **`app/models.py`** — Update `TaskCreate`, `TaskUpdate`, `TaskResponse`
- [ ] **`app/routes.py`** — Update `create_task` and `update_task` SQL queries to include new column
- [ ] **`tests/test_tasks.py`** — Add tests for the new field (default value, valid values, invalid values → 422)

## Adding a New Backend Endpoint — Checklist

- [ ] **`app/routes.py`** — Add new route function. **Place specific paths BEFORE `/tasks/{task_id}`** to avoid conflicts
- [ ] **`app/models.py`** — Add response model if needed
- [ ] **`tests/test_tasks.py`** — Add tests for the new endpoint

## Adding Query Parameter Filtering — Checklist

- [ ] **`app/routes.py`** — Update `list_tasks` to accept optional query params with `WHERE` + `AND` construction
- [ ] **`app/models.py`** — No model changes needed (query params, not body)
- [ ] **`tests/test_tasks.py`** — Test filtering with valid and invalid params

## Frontend Changes When Backend Adds a Field

- [ ] **`src/api.ts`** — Update TypeScript interfaces (`Task`, `TaskCreate`, `TaskUpdate`, `Stats` if applicable). Use `import type` syntax.
- [ ] **`src/components/TaskModal.tsx`** — Add form field (Select, Input, etc.) for the new field
- [ ] **`src/components/TaskTable.tsx`** — Add table column + badge/styling
- [ ] **`src/components/StatsCards.tsx`** — Update stats if new stats field exists
- [ ] **`src/components/TaskChart.tsx`** — Update chart data if applicable
- [ ] **`src/pages/DashboardPage.tsx`** / **`TasksPage.tsx`** — Update if new API calls or state needed

## PR Conventions

- Branch name: `feature/<ticket-description>` or `fix/<description>`
- Commits: concise, imperative mood (e.g., "add priority field to tasks")
- Always run validation before pushing:
  ```bash
  # Backend
  cd backend && ruff check . && python -m compileall . -q && pytest -q

  # Frontend
  cd frontend && npm run build
  ```