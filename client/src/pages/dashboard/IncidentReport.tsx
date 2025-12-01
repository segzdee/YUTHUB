import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Plus } from "lucide-react";
import { useState } from "react";
import IncidentReportForm from '@/components/Forms/IncidentReportForm';

export default function IncidentReport() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incident Reports</h1>
          <p className="text-muted-foreground">
            Report and track incidents for safeguarding compliance
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} variant="destructive">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>New Incident Report</CardTitle>
            <CardDescription>
              Document incident details for investigation and compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IncidentReportForm />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                No incidents reported yet
              </p>
              <Button onClick={() => setShowForm(true)} variant="destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Your First Incident
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
