import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Plus, Search, Calendar, User, Building, AlertTriangle, TrendingUp } from "lucide-react";
import type { FormDraft } from "@shared/schema";

export default function Forms() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: formDrafts = [] } = useQuery<FormDraft[]>({
    queryKey: ["/api/forms/drafts"],
  });

  const formTemplates = [
    {
      id: "property-registration",
      title: "Property Registration",
      description: "Register new housing properties in the system",
      icon: Building,
      category: "housing",
      estimatedTime: "15-20 minutes",
      requiredFields: 12,
      route: "/forms/property-registration",
    },
    {
      id: "resident-intake",
      title: "Resident Intake",
      description: "Complete intake assessment for new residents",
      icon: User,
      category: "residents",
      estimatedTime: "30-45 minutes",
      requiredFields: 25,
      route: "/forms/resident-intake",
    },
    {
      id: "incident-report",
      title: "Incident Report",
      description: "Document safety and behavioral incidents",
      icon: AlertTriangle,
      category: "safeguarding",
      estimatedTime: "10-15 minutes",
      requiredFields: 15,
      route: "/forms/incident-report",
    },
    {
      id: "progress-tracking",
      title: "Progress Tracking",
      description: "Track resident progress and goal achievements",
      icon: TrendingUp,
      category: "support",
      estimatedTime: "15-25 minutes",
      requiredFields: 18,
      route: "/forms/progress-tracking",
    },
    {
      id: "support-plan",
      title: "Support Plan",
      description: "Create and update individual support plans",
      icon: FileText,
      category: "support",
      estimatedTime: "45-60 minutes",
      requiredFields: 30,
      route: "/forms/support-plan",
    },
  ];

  const filteredTemplates = formTemplates.filter(template =>
    template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "housing": return "bg-blue-100 text-blue-800";
      case "residents": return "bg-green-100 text-green-800";
      case "safeguarding": return "bg-red-100 text-red-800";
      case "support": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFormStatus = (formId: string) => {
    const draft = formDrafts.find(d => d.formType === formId);
    return draft ? "draft" : "new";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "new": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const recentForms = [
    {
      id: 1,
      formType: "Incident Report",
      title: "Safety Incident - Kitchen Fire",
      status: "Completed",
      lastModified: "2024-01-15 14:30",
      submittedBy: "Sarah Johnson",
    },
    {
      id: 2,
      formType: "Resident Intake",
      title: "New Resident - Michael Thompson",
      status: "Draft",
      lastModified: "2024-01-15 11:45",
      submittedBy: "Current User",
    },
    {
      id: 3,
      formType: "Progress Tracking",
      title: "Monthly Review - Emma Wilson",
      status: "Completed",
      lastModified: "2024-01-14 16:20",
      submittedBy: "David Lee",
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forms</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Access all forms, manage drafts, and track submissions
            </p>
          </div>

          <Tabs defaultValue="templates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Form Templates</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                  <Input
                    type="search"
                    inputMode="search"
                    autoComplete="off"
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full touch-target"
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Custom Form
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  const status = getFormStatus(template.id);
                  
                  return (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{template.title}</CardTitle>
                              <CardDescription>{template.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                            <Badge className={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Est. Time</span>
                              <div className="font-medium">{template.estimatedTime}</div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Fields</span>
                              <div className="font-medium">{template.requiredFields}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild size="sm" className="flex-1">
                              <Link href={template.route}>
                                {status === "draft" ? "Continue" : "Start Form"}
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              Preview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="drafts" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Draft Forms</h2>
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Drafts
                </Button>
              </div>

              <div className="space-y-4">
                {formDrafts.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No draft forms found</p>
                        <p className="text-sm text-gray-400 mt-1">Start a new form to create a draft</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  formDrafts.map((draft) => (
                    <Card key={draft.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{draft.formType}</CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                Last saved: {new Date(draft.updatedAt).toLocaleString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Draft
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Form progress: {Math.round(Math.random() * 100)}% complete
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">
                              Continue
                            </Button>
                            <Button variant="outline" size="sm">
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Forms</h2>
                <Button variant="outline" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {recentForms.map((form) => (
                  <Card key={form.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{form.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <span>{form.formType}</span>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              {form.lastModified}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(form.status.toLowerCase())}>
                          {form.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted by: {form.submittedBy}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          {form.status === "Draft" && (
                            <Button size="sm">
                              Continue
                            </Button>
                          )}
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