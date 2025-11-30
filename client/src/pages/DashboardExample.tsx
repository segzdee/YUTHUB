import * as React from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { ResidentsTable, type Resident } from "@/components/residents-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Building2, AlertTriangle, TrendingUp } from "lucide-react"
import { toast } from "sonner"

const mockResidents: Resident[] = [
  {
    id: "1",
    name: "John Smith",
    age: 28,
    room: "A101",
    status: "active",
    supportLevel: "medium",
    moveInDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    age: 32,
    room: "A102",
    status: "active",
    supportLevel: "high",
    moveInDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Michael Brown",
    age: 25,
    room: "B201",
    status: "pending",
    supportLevel: "low",
    moveInDate: "2024-03-10",
  },
]

export default function DashboardExample() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = React.useState(false)

  const handleResidentClick = (resident: Resident) => {
    toast.success(`Viewing ${resident.name}`, {
      description: `Room: ${resident.room} | Support Level: ${resident.supportLevel}`,
    })
  }

  const handleRefresh = () => {
    setIsLoading(true)
    toast.info("Refreshing dashboard data...")
    setTimeout(() => {
      setIsLoading(false)
      toast.success("Dashboard refreshed successfully")
    }, 1500)
  }

  return (
    <DashboardShell
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Overview" },
      ]}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your housing management platform.
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          Refresh Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">92%</div>
                <p className="text-xs text-muted-foreground">
                  48 of 52 rooms occupied
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">98%</div>
                <Badge variant="success" className="mt-1">
                  Excellent
                </Badge>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Tasks
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">7</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-amber-600">3 urgent</span>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="residents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="residents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Residents</CardTitle>
              <CardDescription>
                Manage and view all residents in the system. Click on a row to view details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <ResidentsTable
                  data={mockResidents}
                  onRowClick={handleResidentClick}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Deadlines</CardTitle>
              <CardDescription>
                Track important dates, assessments, and deadlines.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports Overview</CardTitle>
              <CardDescription>
                Generate and view compliance reports, audit trails, and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Monthly Compliance Report</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated on Nov 25, 2024
                    </p>
                  </div>
                  <Button variant="outline">View Report</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Incident Log Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated on Nov 20, 2024
                    </p>
                  </div>
                  <Button variant="outline">View Report</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Financial Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      Generated on Nov 15, 2024
                    </p>
                  </div>
                  <Button variant="outline">View Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
