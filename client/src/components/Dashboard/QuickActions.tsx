import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  Wrench, 
  DollarSign, 
  Download,
  Home,
  UserPlus,
  AlertTriangle,
  BarChart3
} from "lucide-react";

const quickActions = [
  {
    name: "Register Property",
    icon: Home,
    color: "bg-blue-50 hover:bg-blue-100",
    iconColor: "text-blue-600",
    path: "/forms/property-registration"
  },
  {
    name: "Resident Intake",
    icon: UserPlus,
    color: "bg-green-50 hover:bg-green-100",
    iconColor: "text-green-600",
    path: "/forms/resident-intake"
  },
  {
    name: "Incident Report",
    icon: AlertTriangle,
    color: "bg-red-50 hover:bg-red-100",
    iconColor: "text-red-600",
    path: "/forms/incident-report"
  },
  {
    name: "Progress Tracking",
    icon: BarChart3,
    color: "bg-purple-50 hover:bg-purple-100",
    iconColor: "text-purple-600",
    path: "/forms/progress-tracking"
  },
  {
    name: "Support Plan",
    icon: FileText,
    color: "bg-secondary bg-opacity-5 hover:bg-opacity-10",
    iconColor: "text-secondary",
    path: "/forms/support-plan"
  },
  {
    name: "Maintenance",
    icon: Wrench,
    color: "bg-orange-50 hover:bg-orange-100",
    iconColor: "text-orange-600",
    action: "maintenance"
  }
];

export default function QuickActions() {
  const handleAction = (action: any) => {
    if (action.path) {
      window.location.href = action.path;
    } else {
      // Handle other actions that aren't forms
      console.log(`Handling action: ${action.name}`);
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
