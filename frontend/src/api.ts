const API_BASE = "/api";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "done";
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total: number;
  todo: number;
  done: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: "todo" | "done";
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: "todo" | "done";
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  health: () => request<{ status: string }>("/health"),
  getStats: () => request<Stats>("/tasks/stats"),
  listTasks: () => request<Task[]>("/tasks"),
  getTask: (id: number) => request<Task>(`/tasks/${id}`),
  createTask: (data: TaskCreate) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: number, data: TaskUpdate) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id: number) =>
    request<void>(`/tasks/${id}`, { method: "DELETE" }),
};