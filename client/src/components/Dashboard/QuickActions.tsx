import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  Wrench, 
  DollarSign, 
  Download 
} from "lucide-react";

const quickActions = [
  {
    name: "New Placement",
    icon: Plus,
    color: "bg-primary bg-opacity-5 hover:bg-opacity-10",
    iconColor: "text-primary",
    action: "placement"
  },
  {
    name: "Support Plan",
    icon: FileText,
    color: "bg-secondary bg-opacity-5 hover:bg-opacity-10",
    iconColor: "text-secondary",
    action: "support-plan"
  },
  {
    name: "Assessment",
    icon: TrendingUp,
    color: "bg-purple-50 hover:bg-purple-100",
    iconColor: "text-purple-600",
    action: "assessment"
  },
  {
    name: "Maintenance",
    icon: Wrench,
    color: "bg-orange-50 hover:bg-orange-100",
    iconColor: "text-orange-600",
    action: "maintenance"
  },
  {
    name: "Financial Review",
    icon: DollarSign,
    color: "bg-green-50 hover:bg-green-100",
    iconColor: "text-green-600",
    action: "financial"
  },
  {
    name: "Export Data",
    icon: Download,
    color: "bg-gray-50 hover:bg-gray-100",
    iconColor: "text-gray-600",
    action: "export"
  }
];

export default function QuickActions() {
  const handleAction = (action: string) => {
    // TODO: Implement navigation to respective modules
    console.log(`Navigating to ${action}`);
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
                onClick={() => handleAction(action.action)}
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
