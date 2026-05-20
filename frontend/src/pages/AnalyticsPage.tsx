import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights and metrics about your tasks</p>
      </div>
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
          <BarChart3 className="h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">Analytics coming soon</p>
          <p className="text-sm">This section will include detailed charts and reports.</p>
        </CardContent>
      </Card>
    </div>
  );
}