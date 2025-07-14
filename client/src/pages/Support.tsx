import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { useCrossModuleIntegration } from "@/lib/dataIntegration";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Users, Calendar, CheckCircle, Clock, Plus, FileText, User } from "lucide-react";
import type { SupportPlan, Resident, User as UserType } from "@shared/schema";

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { triggerUpdate } = useRealTimeUpdates();
  const { invalidateRelated } = useCrossModuleIntegration();

  const { data: supportPlans = [], isLoading: plansLoading } = useQuery<SupportPlan[]>({
    queryKey: ["/api/support-plans"],
  });

  const { data: residents = [], isLoading: residentsLoading } = useQuery<Resident[]>({
    queryKey: ["/api/residents"],
  });

  const { data: staffMembers = [], isLoading: staffLoading } = useQuery<UserType[]>({
    queryKey: ["/api/staff-members"],
  });

  // Filter support plans based on search term
  const filteredPlans = supportPlans.filter(plan => {
    const resident = residents.find(r => r.id === plan.residentId);
    return resident && (
      `${resident.firstName} ${resident.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.goals.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getResidentName = (residentId: number) => {
    const resident = residents.find(r => r.id === residentId);
    return resident ? `${resident.firstName} ${resident.lastName}` : "Unknown";
  };

  const getKeyWorkerName = (keyWorkerId: string) => {
    const staff = staffMembers.find(s => s.id === keyWorkerId);
    return staff ? `${staff.firstName || ''} ${staff.lastName || ''}`.trim() : "Unassigned";
  };

  const activePlans = supportPlans.filter(plan => plan.status === "active");
  const completedPlans = supportPlans.filter(plan => plan.status === "completed");
  const pausedPlans = supportPlans.filter(plan => plan.status === "paused");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Support Services</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage support plans, coordinate services, and track resident progress
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 sm:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active support plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedPlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully completed plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paused Plans</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pausedPlans.length}</div>
                <p className="text-xs text-muted-foreground">
                  Temporarily paused plans
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="plans" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plans">Support Plans</TabsTrigger>
              <TabsTrigger value="residents">Residents</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Search support plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Plan
                </Button>
              </div>

              <div className="space-y-4">
                {filteredPlans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{getResidentName(plan.residentId)}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Key Worker: {getKeyWorkerName(plan.keyWorkerId)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(plan.status)}>
                          {plan.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-1">Goals</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{plan.goals}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-1">Objectives</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{plan.objectives}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Review Date</span>
                          <span className="text-sm font-medium">
                            {new Date(plan.reviewDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="residents" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Resident Support Overview</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Resident
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {residents.map((resident) => {
                  const residentPlans = supportPlans.filter(plan => plan.residentId === resident.id);
                  const activePlan = residentPlans.find(plan => plan.status === "active");
                  
                  return (
                    <Card key={resident.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{resident.firstName} {resident.lastName}</CardTitle>
                              <CardDescription>
                                Independence Level: {resident.independenceLevel}/5
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={resident.riskLevel === "high" ? "bg-red-100 text-red-800" : 
                                         resident.riskLevel === "medium" ? "bg-yellow-100 text-yellow-800" : 
                                         "bg-green-100 text-green-800"}>
                            {resident.riskLevel} risk
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Active Plans</span>
                            <span className="text-sm font-medium">{residentPlans.filter(p => p.status === "active").length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Plans</span>
                            <span className="text-sm font-medium">{residentPlans.length}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Key Worker</span>
                            <span className="text-sm font-medium">
                              {activePlan ? getKeyWorkerName(activePlan.keyWorkerId) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Staff Members</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Staff
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffMembers.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No staff members found</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  staffMembers.map((staff) => {
                    const assignedPlans = supportPlans.filter(plan => plan.keyWorkerId === staff.id);
                    
                    return (
                      <Card key={staff.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {staff.firstName || ''} {staff.lastName || ''}
                              </CardTitle>
                              <CardDescription>{staff.email}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Role</span>
                              <span className="text-sm font-medium">{staff.role}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Active Plans</span>
                              <span className="text-sm font-medium">
                                {assignedPlans.filter(p => p.status === "active").length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Total Plans</span>
                              <span className="text-sm font-medium">{assignedPlans.length}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}