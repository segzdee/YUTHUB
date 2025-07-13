import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, TrendingUp, Target, CheckCircle, Clock } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Independence() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: progressTracking = [], isLoading: progressLoading } = useQuery({
    queryKey: ['/api/progress-tracking'],
  });

  const { data: residents = [], isLoading: residentsLoading } = useQuery({
    queryKey: ['/api/residents'],
  });

  if (progressLoading || residentsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading independence pathway data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const skillAreas = [
    { name: 'Life Skills', key: 'life_skills' },
    { name: 'Education', key: 'education' },
    { name: 'Employment', key: 'employment' },
    { name: 'Health & Wellbeing', key: 'health' },
    { name: 'Financial Management', key: 'financial' },
    { name: 'Social Skills', key: 'social' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Independence Pathway</h1>
            <p className="text-muted-foreground mt-2">
              Track and support young people's journey to independence
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {skillAreas.map((area) => (
                  <Card key={area.key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {area.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>3 completed</span>
                          <span>2 in progress</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Progress Tracking</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Progress Entry
                </Button>
              </div>

              <div className="grid gap-4">
                {progressTracking.map((entry: any) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          {entry.skillArea}
                        </CardTitle>
                        <Badge variant="secondary">
                          {entry.progressLevel}/5
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Progress Notes</p>
                          <p className="font-medium">{entry.notes}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Next Review: {new Date(entry.nextReview).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Last updated: {new Date(entry.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Independence Goals</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Set New Goal
                </Button>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      Complete cooking skills assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          Due: Next week
                        </Badge>
                        <span className="text-sm text-muted-foreground">Life Skills</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Budgeting workshop completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <div className="flex justify-between items-center">
                        <Badge variant="default">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Completed
                        </Badge>
                        <span className="text-sm text-muted-foreground">Financial Management</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Achievements</h2>
              </div>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      First Independent Shopping Trip
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Successfully completed first independent grocery shopping with budget management
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="default">Life Skills</Badge>
                        <span className="text-sm text-muted-foreground">3 days ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      CV Writing Workshop
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Completed CV writing workshop and created first professional CV
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge variant="default">Employment</Badge>
                        <span className="text-sm text-muted-foreground">1 week ago</span>
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