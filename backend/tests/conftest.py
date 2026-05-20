import pytest
from fastapi.testclient import TestClient
from app.main import app
import os

os.environ["DB_PATH"] = ":memory:"


@pytest.fixture(scope="function")
def client():
    from app.database import init_db, get_connection

    init_db()
    yield TestClient(app)
    conn = get_connection()
    conn.execute("DROP TABLE IF EXISTS tasks")
    conn.commit()
    conn.close()