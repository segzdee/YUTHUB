import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Eye, Edit, Target, Calendar } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface SupportPlan {
  id: string;
  residentName: string;
  createdDate: string;
  reviewDate: string;
  status: "active" | "review_due" | "completed";
  goalsTotal: number;
  goalsCompleted: number;
  keyWorker: string;
}

const mockPlans: SupportPlan[] = [
  {
    id: "1",
    residentName: "Alice Johnson",
    createdDate: "2024-01-15",
    reviewDate: "2024-04-15",
    status: "active",
    goalsTotal: 8,
    goalsCompleted: 6,
    keyWorker: "Sarah Smith",
  },
  {
    id: "2",
    residentName: "Ben Williams",
    createdDate: "2024-02-20",
    reviewDate: "2024-05-20",
    status: "active",
    goalsTotal: 10,
    goalsCompleted: 4,
    keyWorker: "John Davis",
  },
  {
    id: "3",
    residentName: "Charlie Brown",
    createdDate: "2023-11-10",
    reviewDate: "2024-02-10",
    status: "review_due",
    goalsTotal: 6,
    goalsCompleted: 5,
    keyWorker: "Emma Wilson",
  },
];

const statusColors = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  review_due: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

export default function SupportPlans() {
  const [showForm, setShowForm] = useState(false);

  const { data: plans = mockPlans, isLoading } = useQuery({
    queryKey: ["/api/support-plans"],
    placeholderData: mockPlans,
  });

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Plans</h1>
          <p className="text-muted-foreground">
            Create and manage individual support plans for residents
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No support plans created yet
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Support Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const completionPercent = (plan.goalsCompleted / plan.goalsTotal) * 100;
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{plan.residentName}</CardTitle>
                      <CardDescription className="text-sm">
                        Key Worker: {plan.keyWorker}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[plan.status]} variant="outline">
                      {plan.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Goal Progress</span>
                      <span className="font-medium">
                        {plan.goalsCompleted} / {plan.goalsTotal} completed
                      </span>
                    </div>
                    <Progress value={completionPercent} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {completionPercent.toFixed(0)}% complete
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Review due: {new Date(plan.reviewDate).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
