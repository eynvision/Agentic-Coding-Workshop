def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_task(client):
    response = client.post("/api/tasks", json={"title": "Test task"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test task"
    assert data["status"] == "todo"
    assert "id" in data


def test_create_task_with_all_fields(client):
    response = client.post(
        "/api/tasks", json={"title": "Full task", "description": "Desc", "status": "done"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Full task"
    assert data["description"] == "Desc"
    assert data["status"] == "done"


def test_create_task_invalid_status(client):
    response = client.post("/api/tasks", json={"title": "Task", "status": "invalid"})
    assert response.status_code == 422


def test_list_tasks(client):
    client.post("/api/tasks", json={"title": "Task 1"})
    client.post("/api/tasks", json={"title": "Task 2"})
    response = client.get("/api/tasks")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_get_task(client):
    create = client.post("/api/tasks", json={"title": "Task"})
    task_id = create.json()["id"]
    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Task"


def test_get_task_not_found(client):
    response = client.get("/api/tasks/999")
    assert response.status_code == 404


def test_update_task(client):
    create = client.post("/api/tasks", json={"title": "Task"})
    task_id = create.json()["id"]
    response = client.patch(f"/api/tasks/{task_id}", json={"status": "done"})
    assert response.status_code == 200
    assert response.json()["status"] == "done"


def test_delete_task(client):
    create = client.post("/api/tasks", json={"title": "Task"})
    task_id = create.json()["id"]
    response = client.delete(f"/api/tasks/{task_id}")
    assert response.status_code == 204
    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 404


def test_stats(client):
    client.post("/api/tasks", json={"title": "Todo task", "status": "todo"})
    client.post("/api/tasks", json={"title": "Done task", "status": "done"})
    response = client.get("/api/tasks/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["todo"] == 1
    assert data["done"] == 1