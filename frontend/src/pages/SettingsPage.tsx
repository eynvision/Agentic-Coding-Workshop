import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your TaskFlow preferences</p>
      </div>
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
          <Settings className="h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">Settings coming soon</p>
          <p className="text-sm">This section will include app configuration options.</p>
        </CardContent>
      </Card>
    </div>
  );
}