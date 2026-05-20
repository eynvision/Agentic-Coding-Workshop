# Backend Guide

## Current Schema

```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Path | Description | Request Body | Response |
|--------|------|-------------|--------------|----------|
| GET | `/health` | Health check | — | `{"status": "ok"}` |
| GET | `/tasks` | List all tasks | — | `TaskResponse[]` |
| GET | `/tasks/stats` | Get stats | — | `{"total", "todo", "done"}` |
| GET | `/tasks/{id}` | Get single task | — | `TaskResponse` |
| POST | `/tasks` | Create task | `TaskCreate` | `TaskResponse` (201) |
| PATCH | `/tasks/{id}` | Update task | `TaskUpdate` | `TaskResponse` |
| DELETE | `/tasks/{id}` | Delete task | — | 204 |

## Pydantic Models (`app/models.py`)

```python
class TaskCreate(BaseModel):
    title: str           # min 1, max 200 chars
    description: str     # default "", max 2000
    status: str          # default "todo", must match ^(todo|done)$

class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[str]   # must match ^(todo|done)$

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    status: str
    created_at: str
    updated_at: str

class StatsResponse(BaseModel):
    total: int
    todo: int
    done: int
```

## How to Add a New Field

When adding a new field (e.g., `priority`, `due_date`), you must update **3 places**:

### 1. Schema — `app/database.py`

Add the column to the `CREATE TABLE` statement (for fresh databases):

```sql
priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'))
```

Add a migration entry to `MIGRATIONS` list (for existing databases):

```python
MIGRATIONS = [
    "ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'",
]
```

`_run_migrations()` will silently skip already-applied migrations (catches `OperationalError`).

### 2. Models — `app/models.py`

Add the field to `TaskCreate`, `TaskUpdate`, and `TaskResponse`:

```python
class TaskCreate(BaseModel):
    # ... existing fields ...
    priority: str = Field(default="medium", pattern=r"^(low|medium|high)$")

class TaskUpdate(BaseModel):
    # ... existing fields ...
    priority: Optional[str] = Field(default=None, pattern=r"^(low|medium|high)$")

class TaskResponse(BaseModel):
    # ... existing fields ...
    priority: str
```

### 3. Routes — `app/routes.py`

Update `create_task` and `update_task` to include the new field in their SQL queries. Currently they use explicit column lists:

```python
# In create_task:
cursor = conn.execute(
    "INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    (task.title, task.description, task.status, now, now),
)
```

Add the new column and parameter here. Same for `update_task`'s UPDATE statement.

## How to Add a New Endpoint

Add a new function to `app/routes.py` decorated with `@router.get/post/...`:

```python
@router.get("/tasks/overdue", response_model=list[TaskResponse])
def get_overdue_tasks():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM tasks WHERE due_date < date('now') AND status != 'done'"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]
```

**Important**: Route ordering matters in FastAPI. Place specific paths like `/tasks/stats` and `/tasks/overdue` BEFORE the generic `/tasks/{task_id}` to avoid path conflicts.

## How to Add Query Parameters

For filtering endpoints, use FastAPI's query parameter syntax:

```python
@router.get("/tasks", response_model=list[TaskResponse])
def list_tasks(status: Optional[str] = None, priority: Optional[str] = None):
    conn = get_connection()
    query = "SELECT * FROM tasks"
    conditions = []
    params = []
    if status:
        conditions.append("status=?")
        params.append(status)
    if priority:
        conditions.append("priority=?")
        params.append(priority)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]
```

## Testing

### Run Tests

```bash
cd backend
pip install -r requirements.txt
pytest -q
```

### How Tests Work

Tests use FastAPI's `TestClient` which simulates HTTP requests **without starting a real server**. The test DB uses SQLite in-memory (`:memory:`).

Each test function gets a fresh `client` fixture (see `tests/conftest.py`) that:
1. Creates a fresh in-memory database via `init_db()`
2. Returns a `TestClient(app)` instance
3. Drops the tasks table after the test

### Writing New Tests

Add tests to `tests/test_tasks.py` (or create a new file in `tests/`).

Pattern:
```python
def test_my_new_feature(client):
    # Setup: create prerequisite data
    client.post("/api/tasks", json={"title": "Test"})

    # Exercise: hit the new endpoint
    response = client.get("/api/tasks?status=todo")

    # Assert: check status code and response body
    assert response.status_code == 200
    assert len(response.json()) == 1
```

For 422 validation tests:
```python
def test_invalid_priority(client):
    response = client.post("/api/tasks", json={"title": "Task", "priority": "urgent"})
    assert response.status_code == 422
```

## Validation Commands

```bash
cd backend
ruff check .          # Lint
python -m compileall . -q  # Syntax check
pytest -q            # Run tests
```