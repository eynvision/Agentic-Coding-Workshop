import { StatsCards } from "@/components/StatsCards";
import { TaskTable } from "@/components/TaskTable";
import { TaskChart } from "@/components/TaskChart";
import { TaskModal } from "@/components/TaskModal";
import { api, type Task } from "@/api";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([api.listTasks(), api.getStats()]);
      setTasks(t);
      setStats(s);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (data: Parameters<typeof api.createTask>[0]) => {
    await api.createTask(data);
    await fetchData();
  };

  const handleUpdate = async (data: Parameters<typeof api.updateTask>[1]) => {
    if (!editTask) return;
    await api.updateTask(editTask.id, data);
    setEditTask(null);
    await fetchData();
  };

  const handleDelete = async (id: number) => {
    await api.deleteTask(id);
    await fetchData();
  };

  const handleStatusToggle = async (task: Task) => {
    await api.updateTask(task.id, {
      status: task.status === "done" ? "todo" : "done",
    });
    await fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage and track your tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditTask(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <StatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskTable tasks={tasks} loading={loading} onEdit={(task) => { setEditTask(task); setModalOpen(true); }} onDelete={handleDelete} onStatusToggle={handleStatusToggle} />
        </div>
        <div>
          <TaskChart stats={stats} />
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null); }}
        onSubmit={editTask ? handleUpdate : handleCreate}
        task={editTask}
        mode={editTask ? "edit" : "create"}
      />
    </div>
  );
}