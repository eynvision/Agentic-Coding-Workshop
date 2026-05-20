from fastapi import APIRouter, HTTPException
from .database import get_connection
from .models import TaskCreate, TaskUpdate, TaskResponse, StatsResponse
from datetime import datetime

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/tasks/stats", response_model=StatsResponse)
def get_stats():
    conn = get_connection()
    total = conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
    todo = conn.execute("SELECT COUNT(*) FROM tasks WHERE status='todo'").fetchone()[0]
    done = conn.execute("SELECT COUNT(*) FROM tasks WHERE status='done'").fetchone()[0]
    conn.close()
    return StatsResponse(total=total, todo=todo, done=done)


@router.get("/tasks", response_model=list[TaskResponse])
def list_tasks():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate):
    conn = get_connection()
    now = datetime.utcnow().isoformat()
    cursor = conn.execute(
        "INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (task.title, task.description, task.status, now, now),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM tasks WHERE id=?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(row)


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int):
    conn = get_connection()
    row = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    return dict(row)


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate):
    conn = get_connection()
    existing = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")

    updates = {k: v for k, v in task.model_dump().items() if v is not None}
    if not updates:
        conn.close()
        return dict(existing)

    updates["updated_at"] = datetime.utcnow().isoformat()
    set_clause = ", ".join(f"{k}=?" for k in updates)
    values = list(updates.values()) + [task_id]
    conn.execute(f"UPDATE tasks SET {set_clause} WHERE id=?", values)
    conn.commit()
    row = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    conn.close()
    return dict(row)


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    conn = get_connection()
    existing = conn.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    conn.execute("DELETE FROM tasks WHERE id=?", (task_id,))
    conn.commit()
    conn.close()