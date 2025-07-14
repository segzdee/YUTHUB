import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useCrossModuleIntegration } from "@/lib/dataIntegration";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Shield, AlertTriangle, FileText, Clock, CheckCircle, Plus, User, Calendar } from "lucide-react";
import type { Incident, Resident, Property } from "@shared/schema";

export default function Safeguarding() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { triggerUpdate } = useRealTimeUpdates();
  const { invalidateRelated } = useCrossModuleIntegration();

  const { data: incidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents"],
  });

  const { data: residents = [] } = useQuery<Resident[]>({
    queryKey: ["/api/residents"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Filter incidents based on search term
  const filteredIncidents = incidents.filter(incident =>
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIncidentTypeColor = (type: string) => {
    switch (type) {
      case "safety": return "bg-red-100 text-red-800";
      case "behavioral": return "bg-yellow-100 text-yellow-800";
      case "medical": return "bg-blue-100 text-blue-800";
      case "maintenance": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "investigating": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getResidentName = (residentId: number | null) => {
    if (!residentId) return "N/A";
    const resident = residents.find(r => r.id === residentId);
    return resident ? `${resident.firstName} ${resident.lastName}` : "Unknown";
  };

  const getPropertyName = (propertyId: number | null) => {
    if (!propertyId) return "N/A";
    const property = properties.find(p => p.id === propertyId);
    return property ? property.name : "Unknown";
  };

  // Calculate metrics
  const openIncidents = incidents.filter(i => i.status === "open").length;
  const investigatingIncidents = incidents.filter(i => i.status === "investigating").length;
  const resolvedIncidents = incidents.filter(i => i.status === "resolved").length;
  const closedIncidents = incidents.filter(i => i.status === "closed").length;

  const criticalIncidents = incidents.filter(i => i.severity === "critical").length;
  const highSeverityIncidents = incidents.filter(i => i.severity === "high").length;
  const mediumSeverityIncidents = incidents.filter(i => i.severity === "medium").length;
  const lowSeverityIncidents = incidents.filter(i => i.severity === "low").length;

  const safetyIncidents = incidents.filter(i => i.incidentType === "safety").length;
  const behavioralIncidents = incidents.filter(i => i.incidentType === "behavioral").length;
  const medicalIncidents = incidents.filter(i => i.incidentType === "medical").length;
  const maintenanceIncidents = incidents.filter(i => i.incidentType === "maintenance").length;

  const highRiskResidents = residents.filter(r => r.riskLevel === "high");
  const mediumRiskResidents = residents.filter(r => r.riskLevel === "medium");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Safeguarding</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor safety protocols, track incidents, and manage risk assessments
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openIncidents}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investigating</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{investigatingIncidents}</div>
                <p className="text-xs text-muted-foreground">
                  Currently under investigation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resolvedIncidents}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully resolved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Residents</CardTitle>
                <Shield className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highRiskResidents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring enhanced support
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="incidents" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
              <TabsTrigger value="protocols">Safety Protocols</TabsTrigger>
            </TabsList>

            <TabsContent value="incidents" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Search incidents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Report Incident
                </Button>
              </div>

              {/* Incident Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Incident Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Safety</span>
                        <Badge className={getIncidentTypeColor("safety")}>{safetyIncidents}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Behavioral</span>
                        <Badge className={getIncidentTypeColor("behavioral")}>{behavioralIncidents}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Medical</span>
                        <Badge className={getIncidentTypeColor("medical")}>{medicalIncidents}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Maintenance</span>
                        <Badge className={getIncidentTypeColor("maintenance")}>{maintenanceIncidents}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Severity Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Critical</span>
                        <Badge className={getSeverityColor("critical")}>{criticalIncidents}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">High</span>
                        <Badge className={getSeverityColor("high")}>{highSeverityIncidents}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Medium</span>
                        <Badge className={getSeverityColor("medium")}>{mediumSeverityIncidents}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Low</span>
                        <Badge className={getSeverityColor("low")}>{lowSeverityIncidents}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Incident List */}
              <div className="space-y-4">
                {filteredIncidents.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No incidents found</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredIncidents.map((incident) => (
                    <Card key={incident.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{incident.title}</CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                {new Date(incident.createdAt).toLocaleDateString()}
                                <span>•</span>
                                <User className="h-3 w-3" />
                                {getResidentName(incident.residentId)}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getIncidentTypeColor(incident.incidentType)}>
                              {incident.incidentType}
                            </Badge>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                            <Badge className={getStatusColor(incident.status)}>
                              {incident.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {incident.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Property</span>
                              <div className="text-sm font-medium">{getPropertyName(incident.propertyId)}</div>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">Resident</span>
                              <div className="text-sm font-medium">{getResidentName(incident.residentId)}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="risk-assessment" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Risk Assessment</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Assessment
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">High Risk Residents</CardTitle>
                    <CardDescription>Residents requiring enhanced monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {highRiskResidents.length === 0 ? (
                        <p className="text-center text-gray-500">No high risk residents</p>
                      ) : (
                        highRiskResidents.map((resident) => (
                          <div key={resident.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <User className="h-4 w-4 text-red-600" />
                              </div>
                              <div>
                                <div className="font-medium">{resident.firstName} {resident.lastName}</div>
                                <div className="text-sm text-gray-600">
                                  {properties.find(p => p.id === resident.propertyId)?.name || "N/A"}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-red-100 text-red-800">High Risk</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Medium Risk Residents</CardTitle>
                    <CardDescription>Residents requiring regular monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mediumRiskResidents.length === 0 ? (
                        <p className="text-center text-gray-500">No medium risk residents</p>
                      ) : (
                        mediumRiskResidents.map((resident) => (
                          <div key={resident.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-yellow-100 rounded-lg">
                                <User className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div>
                                <div className="font-medium">{resident.firstName} {resident.lastName}</div>
                                <div className="text-sm text-gray-600">
                                  {properties.find(p => p.id === resident.propertyId)?.name || "N/A"}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="protocols" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Protocols</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Protocol
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Emergency Procedures</CardTitle>
                    <CardDescription>Critical response protocols</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="font-medium">Fire Emergency</div>
                          <div className="text-sm text-gray-600">Immediate evacuation procedures</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="font-medium">Medical Emergency</div>
                          <div className="text-sm text-gray-600">First aid and emergency services</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <div>
                          <div className="font-medium">Security Breach</div>
                          <div className="text-sm text-gray-600">Lockdown and security protocols</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Standard Procedures</CardTitle>
                    <CardDescription>Regular safety protocols</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Daily Safety Checks</div>
                          <div className="text-sm text-gray-600">Routine property inspections</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Incident Reporting</div>
                          <div className="text-sm text-gray-600">Documentation and follow-up</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Risk Assessment</div>
                          <div className="text-sm text-gray-600">Regular evaluation procedures</div>
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