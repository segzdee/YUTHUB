import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Home, Bed, Users, Wrench, FileText } from "lucide-react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

export default function Housing() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } = useQuery({
    queryKey: ['/api/maintenance-requests'],
  });

  const { data: tenancyAgreements = [], isLoading: tenancyLoading } = useQuery({
    queryKey: ['/api/tenancy-agreements'],
  });

  if (propertiesLoading || maintenanceLoading || tenancyLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading housing data...</p>
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
            <h1 className="text-2xl font-bold text-foreground">Housing Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage properties, rooms, maintenance, and tenancy agreements
            </p>
          </div>

          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="tenancy">Tenancy</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Properties</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </div>

              <div className="grid gap-4">
                {properties.map((property: any) => (
                  <Card key={property.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Home className="h-5 w-5" />
                            {property.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {property.address}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {property.propertyType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Rooms</p>
                          <p className="font-medium">{property.totalRooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Occupied</p>
                          <p className="font-medium">{property.occupiedRooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium">{property.totalRooms - property.occupiedRooms}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Occupancy Rate</p>
                          <p className="font-medium">
                            {Math.round((property.occupiedRooms / property.totalRooms) * 100)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Room Management</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Room
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Room Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Room allocation and management functionality coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Maintenance Requests</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </div>

              <div className="grid gap-4">
                {maintenanceRequests.map((request: any) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="flex items-center gap-2">
                          <Wrench className="h-5 w-5" />
                          {request.title}
                        </CardTitle>
                        <Badge variant={request.priority === 'high' ? 'destructive' : 'secondary'}>
                          {request.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {request.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Status: {request.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tenancy" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Tenancy Agreements</h2>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Agreement
                </Button>
              </div>

              <div className="grid gap-4">
                {tenancyAgreements.map((agreement: any) => (
                  <Card key={agreement.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Tenancy Agreement #{agreement.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">
                            {new Date(agreement.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">
                            {new Date(agreement.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Weekly Rent</p>
                          <p className="font-medium">£{agreement.weeklyRent}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge variant={agreement.status === 'active' ? 'default' : 'secondary'}>
                            {agreement.status}
                          </Badge>
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