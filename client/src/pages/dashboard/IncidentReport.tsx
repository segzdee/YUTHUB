import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IncidentReportForm from '@/components/Forms/IncidentReportForm';

interface Incident {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "closed";
  reportedBy: string;
  reportedDate: string;
  residentName: string;
  property: string;
  description: string;
  actionsTaken?: string;
}

const mockIncidents: Incident[] = [
  {
    id: "INC-001",
    title: "Minor altercation between residents",
    severity: "medium",
    status: "investigating",
    reportedBy: "Sarah Smith",
    reportedDate: "2024-11-28",
    residentName: "Alice Johnson",
    property: "Maple House",
    description: "Verbal disagreement during communal dinner",
    actionsTaken: "Residents separated, individual meetings scheduled",
  },
  {
    id: "INC-002",
    title: "Medication administration error",
    severity: "high",
    status: "resolved",
    reportedBy: "John Davis",
    reportedDate: "2024-11-25",
    residentName: "Ben Williams",
    property: "Oak Lodge",
    description: "Wrong dosage administered, corrected immediately",
    actionsTaken: "Medical review completed, training refresher scheduled",
  },
  {
    id: "INC-003",
    title: "Property damage - broken window",
    severity: "low",
    status: "closed",
    reportedBy: "Emma Wilson",
    reportedDate: "2024-11-20",
    residentName: "Charlie Brown",
    property: "Pine Court",
    description: "Window damaged during activities",
    actionsTaken: "Window replaced, behavior support plan reviewed",
  },
];

const severityColors = {
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  critical: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const statusIcons = {
  open: AlertTriangle,
  investigating: Clock,
  resolved: CheckCircle,
  closed: XCircle,
};

export default function IncidentReport() {
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const { data: incidents = mockIncidents, isLoading } = useQuery({
    queryKey: ["/api/incidents"],
    placeholderData: mockIncidents,
  });

  const filterByStatus = (status: string) => {
    if (status === "all") return incidents;
    return incidents.filter((inc) => inc.status === status);
  };

  const renderIncidentCard = (incident: Incident) => {
    const StatusIcon = statusIcons[incident.status];
    return (
      <Card key={incident.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{incident.id}</CardTitle>
                <Badge className={severityColors[incident.severity]} variant="outline">
                  {incident.severity}
                </Badge>
              </div>
              <CardDescription>{incident.title}</CardDescription>
            </div>
            <StatusIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Resident:</span>
              <p className="font-medium">{incident.residentName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Property:</span>
              <p className="font-medium">{incident.property}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Reported by:</span>
              <p className="font-medium">{incident.reportedBy}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <p className="font-medium">{new Date(incident.reportedDate).toLocaleDateString("en-GB")}</p>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {incident.description}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setSelectedIncident(incident)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      {incidents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({incidents.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({filterByStatus("open").length})</TabsTrigger>
            <TabsTrigger value="investigating">Investigating ({filterByStatus("investigating").length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({filterByStatus("resolved").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {incidents.map(renderIncidentCard)}
            </div>
          </TabsContent>

          <TabsContent value="open" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterByStatus("open").map(renderIncidentCard)}
            </div>
          </TabsContent>

          <TabsContent value="investigating" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterByStatus("investigating").map(renderIncidentCard)}
            </div>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filterByStatus("resolved").map(renderIncidentCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Incident Report</DialogTitle>
            <DialogDescription>
              Document incident details for investigation and safeguarding compliance
            </DialogDescription>
          </DialogHeader>
          <IncidentReportForm />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Incident Details - {selectedIncident?.id}</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Incident Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="font-medium">{selectedIncident.title}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <Badge className={severityColors[selectedIncident.severity]} variant="outline">
                      {selectedIncident.severity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">{selectedIncident.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">
                      {new Date(selectedIncident.reportedDate).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">People Involved</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Resident:</span>
                    <p className="font-medium">{selectedIncident.residentName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reported by:</span>
                    <p className="font-medium">{selectedIncident.reportedBy}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Property:</span>
                    <p className="font-medium">{selectedIncident.property}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
              </div>
              {selectedIncident.actionsTaken && (
                <div>
                  <h3 className="font-semibold mb-2">Actions Taken</h3>
                  <p className="text-sm text-muted-foreground">{selectedIncident.actionsTaken}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
