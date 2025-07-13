import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, FileText, Calendar, UserCheck } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Support() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: residents = [], isLoading: residentsLoading } = useQuery({
    queryKey: ['/api/residents'],
  });

  const { data: supportPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['/api/support-plans'],
  });

  const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
    queryKey: ['/api/staff-members'],
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['/api/assessment-forms'],
  });

  if (residentsLoading || plansLoading || staffLoading || assessmentsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading support services...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Support Services</h1>
            <p className="text-muted-foreground mt-2">
              Manage resident support plans, assessments, and staff assignments
            </p>
          </div>

          <Tabs defaultValue="residents" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="residents">Residents</TabsTrigger>
              <TabsTrigger value="plans">Support Plans</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="residents" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Residents</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resident
                </Button>
              </div>

              <div className="grid gap-4">
                {residents.map((resident: any) => (
                  <Card key={resident.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {resident.firstName} {resident.lastName}
                        </CardTitle>
                        <Badge variant={resident.supportLevel === 'high' ? 'destructive' : 'secondary'}>
                          {resident.supportLevel} support
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Age</p>
                          <p className="font-medium">{resident.age}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Move-in Date</p>
                          <p className="font-medium">
                            {new Date(resident.moveInDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Support Worker</p>
                          <p className="font-medium">{resident.supportWorker || 'Not assigned'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Emergency Contact</p>
                          <p className="font-medium">{resident.emergencyContact || 'Not provided'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="plans" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Support Plans</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Plan
                </Button>
              </div>

              <div className="grid gap-4">
                {supportPlans.map((plan: any) => (
                  <Card key={plan.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {plan.planType} Plan
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Goals</p>
                          <p className="font-medium">{plan.goals}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interventions</p>
                          <p className="font-medium">{plan.interventions}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Status: {plan.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Last updated: {new Date(plan.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Assessments</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </div>

              <div className="grid gap-4">
                {assessments.map((assessment: any) => (
                  <Card key={assessment.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {assessment.assessmentType} Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Status: {assessment.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">
                          {assessment.findings || 'Assessment in progress...'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Staff Members</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </div>

              <div className="grid gap-4">
                {staffMembers.map((staff: any) => (
                  <Card key={staff.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        {staff.firstName} {staff.lastName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-medium">{staff.role}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Department</p>
                          <p className="font-medium">{staff.department}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{staff.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{staff.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}