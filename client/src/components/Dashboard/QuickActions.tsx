import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import {
    AlertTriangle,
    BarChart3,
    FileText,
    Home,
    UserPlus,
    Wrench
} from "lucide-react";

const quickActions = [
  {
    name: "Register Property",
    icon: Home,
    color: "bg-primary-50 hover:bg-primary-100",
    iconColor: "text-primary-600",
    path: "/forms/property-registration"
  },
  {
    name: "Resident Intake",
    icon: UserPlus,
    color: "bg-success/10 hover:bg-success/20",
    iconColor: "text-success",
    path: "/forms/resident-intake"
  },
  {
    name: "Incident Report",
    icon: AlertTriangle,
    color: "bg-error/10 hover:bg-error/20",
    iconColor: "text-error",
    path: "/forms/incident-report"
  },
  {
    name: "Progress Tracking",
    icon: BarChart3,
    color: "bg-accent-50 hover:bg-accent-100",
    iconColor: "text-accent-600",
    path: "/forms/progress-tracking"
  },
  {
    name: "Support Plan",
    icon: FileText,
    color: "bg-secondary-50 hover:bg-secondary-100",
    iconColor: "text-secondary-600",
    path: "/forms/support-plan"
  },
  {
    name: "Maintenance",
    icon: Wrench,
    color: "bg-warning/10 hover:bg-warning/20",
    iconColor: "text-warning",
    action: "maintenance"
  }
];

export default function QuickActions() {
  const { toast } = useToast();

  const handleAction = (action: any) => {
    if (action.path) {
      window.location.href = action.path;
    } else if (action.action === 'maintenance') {
      toast({
        title: "Maintenance Portal",
        description: "Maintenance request system will be available soon.",
      });
    } else {
      toast({
        title: "Coming Soon",
        description: `${action.name} feature will be available soon.`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.name}
                variant="ghost"
                className={`flex flex-col items-center p-4 h-auto ${action.color} transition-colors`}
                onClick={() => handleAction(action)}
              >
                <Icon className={`${action.iconColor} h-6 w-6 mb-2`} />
                <span className="text-sm font-medium text-slate">{action.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
