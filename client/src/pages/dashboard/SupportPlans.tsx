import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import FormWizard from '@/components/Forms/FormWizard';

export default function SupportPlans() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>New Support Plan</CardTitle>
            <CardDescription>
              Create a comprehensive support plan with goals and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormWizard />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
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
      )}
    </div>
  );
}
