import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Shield, AlertTriangle, FileText, Clock, Users, Eye } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Safeguarding() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/incidents'],
  });

  const { data: riskyResidents = [], isLoading: riskLoading } = useQuery({
    queryKey: ['/api/residents/at-risk'],
  });

  if (incidentsLoading || riskLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading safeguarding data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Safeguarding</h1>
            <p className="text-muted-foreground mt-2">
              Monitor and manage safeguarding concerns, incidents, and risk assessments
            </p>
          </div>

          <Tabs defaultValue="incidents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
              <TabsTrigger value="policies">Policies</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
            </TabsList>

            <TabsContent value="incidents" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Incident Management</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Report Incident
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {incidents.filter((i: any) => i.status === 'open').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Under Investigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {incidents.filter((i: any) => i.status === 'investigating').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Critical Severity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {incidents.filter((i: any) => i.severity === 'critical').length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Resolved This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {incidents.filter((i: any) => i.status === 'resolved').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Incidents List */}
              <div className="grid gap-4">
                {incidents.map((incident: any) => (
                  <Card key={incident.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          {incident.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge variant={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge variant={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm">{incident.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Type</p>
                            <p className="font-medium">{incident.incidentType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reported By</p>
                            <p className="font-medium">{incident.reportedBy}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">
                              {new Date(incident.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Location</p>
                            <p className="font-medium">{incident.location || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="risk" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Risk Assessment</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </div>

              <div className="grid gap-4">
                {riskyResidents.map((resident: any) => (
                  <Card key={resident.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {resident.firstName} {resident.lastName}
                        </CardTitle>
                        <Badge variant="destructive">
                          High Risk
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Age</p>
                            <p className="font-medium">{resident.age}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Support Level</p>
                            <p className="font-medium">{resident.supportLevel}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Last Assessment</p>
                            <p className="font-medium">
                              {new Date(resident.lastAssessment).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Review</p>
                            <p className="font-medium">
                              {new Date(resident.nextReview).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Risk Factors</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {resident.riskFactors?.map((factor: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {factor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Safeguarding Policies</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Policy
                </Button>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Child Protection Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Comprehensive guidelines for child protection procedures
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="default">Active</Badge>
                        <span className="text-sm text-muted-foreground">
                          Last updated: 2 months ago
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Incident Reporting Procedure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Step-by-step guide for reporting and managing incidents
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="default">Active</Badge>
                        <span className="text-sm text-muted-foreground">
                          Last updated: 3 weeks ago
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="training" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Training & Compliance</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Training
                </Button>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mandatory Training Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Safeguarding Awareness</span>
                        <Badge variant="default">95% Complete</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Child Protection</span>
                        <Badge variant="secondary">80% Complete</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Risk Assessment</span>
                        <Badge variant="destructive">60% Complete</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Training Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Advanced Risk Assessment</p>
                          <p className="text-xs text-muted-foreground">Next week - 2 hours</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">De-escalation Techniques</p>
                          <p className="text-xs text-muted-foreground">Next month - 3 hours</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}