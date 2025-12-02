import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useDashboardStore } from '@/store/dashboardStore';
import { Loader2, Settings } from 'lucide-react';

interface CustomizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_WIDGETS = [
  { id: 'metrics', title: 'Key Metrics', icon: '📊', description: 'View essential performance metrics' },
  { id: 'overview', title: 'System Overview', icon: '📈', description: 'High-level system status' },
  { id: 'risk-assessment', title: 'Risk Assessment', icon: '⚠️', description: 'Risk monitoring and alerts' },
  { id: 'financial-summary', title: 'Financial Summary', icon: '💰', description: 'Financial performance overview' },
  { id: 'occupancy-chart', title: 'Occupancy Trends', icon: '📉', description: 'Historical occupancy data' },
  { id: 'activity-feed', title: 'Recent Activity', icon: '🔔', description: 'Latest system activities' },
  { id: 'occupancy-status', title: 'Occupancy Status', icon: '🏠', description: 'Current occupancy details' },
  { id: 'support-progress', title: 'Support Progress', icon: '🎯', description: 'Support plan tracking' },
];

export function CustomizeModal({ open, onOpenChange }: CustomizeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { visibleWidgets, setVisibleWidgets } = useDashboardStore();
  const [localWidgets, setLocalWidgets] = useState<string[]>(visibleWidgets);

  const savePreferencesMutation = useMutation({
    mutationFn: async (widgets: string[]) => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      // Update user metadata with widget preferences
      const { error } = await supabase.auth.updateUser({
        data: {
          dashboard_preferences: {
            visible_widgets: widgets,
            updated_at: new Date().toISOString(),
          },
        },
      });

      if (error) throw error;

      return widgets;
    },
    onSuccess: (widgets) => {
      setVisibleWidgets(widgets);
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast({
        title: 'Preferences Saved',
        description: 'Your dashboard layout has been updated',
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save preferences',
        variant: 'destructive',
      });
    },
  });

  const handleToggle = (widgetId: string) => {
    setLocalWidgets(prev =>
      prev.includes(widgetId)
        ? prev.filter(id => id !== widgetId)
        : [...prev, widgetId]
    );
  };

  const handleSave = () => {
    savePreferencesMutation.mutate(localWidgets);
  };

  const handleReset = () => {
    const defaultWidgets = AVAILABLE_WIDGETS.map(w => w.id);
    setLocalWidgets(defaultWidgets);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Dashboard
          </SheetTitle>
          <SheetDescription>
            Choose which widgets to display on your dashboard. Changes are saved automatically.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <p className="text-sm font-medium">
                {localWidgets.length} of {AVAILABLE_WIDGETS.length} widgets selected
              </p>
              <p className="text-xs text-muted-foreground">
                Enable at least one widget for your dashboard
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset to Default
            </Button>
          </div>

          <div className="grid gap-3">
            {AVAILABLE_WIDGETS.map((widget) => {
              const isEnabled = localWidgets.includes(widget.id);

              return (
                <div
                  key={widget.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                    isEnabled
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl" role="img" aria-label={widget.title}>
                    {widget.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`widget-${widget.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {widget.title}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {widget.description}
                    </p>
                  </div>

                  <Switch
                    id={`widget-${widget.id}`}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(widget.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <SheetFooter className="gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setLocalWidgets(visibleWidgets);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={savePreferencesMutation.isPending || localWidgets.length === 0}
          >
            {savePreferencesMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
