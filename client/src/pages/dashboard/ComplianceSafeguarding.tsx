import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, AlertTriangle, FileText } from "lucide-react";

export default function ComplianceSafeguarding() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Safeguarding</h1>
          <p className="text-muted-foreground">
            Monitor safeguarding concerns and compliance
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          New Concern
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Concern #{1000 + i}</CardTitle>
                    <Badge variant="destructive">High Priority</Badge>
                  </div>
                  <CardDescription>
                    Reported: {new Date().toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                      <span>Active monitoring required</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Assigned to: Safeguarding Team
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <p className="text-sm text-muted-foreground">No resolved concerns to display.</p>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <p className="text-sm text-muted-foreground">View all safeguarding concerns.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
