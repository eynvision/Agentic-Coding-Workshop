import { api, type Task } from "@/api";
import { useEffect, useState, useCallback } from "react";
import { TaskTable } from "@/components/TaskTable";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { TaskModal } from "@/components/TaskModal";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await api.listTasks());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">View and manage all your tasks</p>
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
      <TaskTable
        tasks={tasks}
        loading={loading}
        onEdit={(task) => { setEditTask(task); setModalOpen(true); }}
        onDelete={async (id) => { await api.deleteTask(id); await fetchData(); }}
        onStatusToggle={async (task) => { await api.updateTask(task.id, { status: task.status === "done" ? "todo" : "done" }); await fetchData(); }}
      />
      <TaskModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTask(null); }} onSubmit={editTask ? async (data) => { await api.updateTask(editTask.id, data); setEditTask(null); await fetchData(); } : async (data) => { await api.createTask(data as Parameters<typeof api.createTask>[0]); await fetchData(); }} task={editTask} mode={editTask ? "edit" : "create"} />
    </div>
  );
}