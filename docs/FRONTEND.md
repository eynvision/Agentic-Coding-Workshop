# Frontend Guide

## Tech Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **shadcn/ui** — component library (source in `src/components/ui/`)
- **Recharts** — bar chart for task stats
- **Lucide React** — icons
- **React Router** — client-side routing

## Project Structure

```
frontend/src/
├── api.ts                    # API client — ALL backend calls go through here
├── App.tsx                   # Router (Routes → Pages)
├── main.tsx                  # Entry point (BrowserRouter wrapper)
├── index.css                 # Tailwind + shadcn theme variables
├── lib/utils.ts              # cn() helper for class merging
├── pages/
│   ├── DashboardPage.tsx     # / — Stats + TaskTable + Chart + Modal
│   ├── TasksPage.tsx         # /tasks — Full-width TaskTable + Modal
│   ├── AnalyticsPage.tsx     # /analytics — Placeholder
│   └── SettingsPage.tsx      # /settings — Placeholder
└── components/
    ├── Layout.tsx             # Sidebar + main content area
    ├── Sidebar.tsx            # Nav with NavLink (react-router)
    ├── StatsCards.tsx         # 4 metric cards (total, done, pending, overdue)
    ├── TaskTable.tsx          # Table with status badges, edit/delete actions
    ├── TaskModal.tsx          # Create/Edit dialog (Dialog + form)
    ├── TaskChart.tsx          # Recharts bar chart (todo vs done)
    └── ui/                    # shadcn/ui primitives (Button, Card, Table, etc.)
```

## API Layer (`src/api.ts`)

All backend communication goes through the `api` object in `src/api.ts`:

```typescript
export const api = {
  health: () => request<{ status: string }>("/health"),
  getStats: () => request<Stats>("/tasks/stats"),
  listTasks: () => request<Task[]>("/tasks"),
  getTask: (id: number) => request<Task>(`/tasks/${id}`),
  createTask: (data: TaskCreate) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (id: number, data: TaskUpdate) => request<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTask: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
```

**Important**: `request()` uses `fetch` with `/api` base path. The Vite dev server proxies `/api` to the backend (see `vite.config.ts`).

### How to Add a New API Method

1. Add the TypeScript interface(s) to `api.ts` (e.g., extend `Task`, `TaskCreate`, `Stats`)
2. Add the method to the `api` object
3. Use it in the relevant page/component

Example — adding overdue endpoint:
```typescript
// In api.ts:
export const api = {
  // ... existing methods ...
  getOverdueTasks: () => request<Task[]>("/tasks/overdue"),
};
```

### How to Add a New Field to Existing Types

When the backend adds a field (e.g., `priority`):

1. Update `Task` interface in `api.ts`:
   ```typescript
   export interface Task {
     id: number;
     title: string;
     description: string;
     status: "todo" | "done";
     priority: "low" | "medium" | "high";  // NEW
     created_at: string;
     updated_at: string;
   }
   ```

2. Update `TaskCreate` and `TaskUpdate` similarly

3. Update `TaskModal.tsx` — add a `<Select>` for the new field
4. Update `TaskTable.tsx` — add a column + badge for the new field
5. Update `StatsCards.tsx` — if the new field has a stat
6. Update `TaskChart.tsx` — if the chart needs new data

## Type Imports

This project uses `verbatimModuleSyntax` in TypeScript. **Always use `import type` for type-only imports:**

```typescript
// Correct:
import type { Task } from "@/api";
import { api } from "@/api";

// Wrong (will cause runtime error):
import { Task } from "@/api";
```

## Routing

Routes are defined in `App.tsx`:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | DashboardPage | Stats + table + chart |
| `/tasks` | TasksPage | Full task management |
| `/analytics` | AnalyticsPage | Placeholder |
| `/settings` | SettingsPage | Placeholder |

To add a new route:
1. Create the page component in `src/pages/`
2. Add a `<Route>` in `App.tsx`
3. Add a nav item in `Sidebar.tsx` (`navItems` array)

## shadcn/ui

Components are in `src/components/ui/`. To add a new shadcn component:

```bash
cd frontend
npx shadcn@latest add <component-name>
```

Available components already installed: badge, button, card, dialog, input, label, scroll-area, select, separator, sheet, table, textarea, tooltip.

## Validation Commands

```bash
cd frontend
npm run build   # Build check (TypeScript + Vite)
npm run lint    # ESLint
```