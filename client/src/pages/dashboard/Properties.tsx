import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Home, Search } from "lucide-react";

export default function Properties() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Properties</h1>
          <p className="text-muted-foreground">
            Manage housing properties and units
          </p>
        </div>
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search properties..."
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Property {String.fromCharCode(64 + i)}</CardTitle>
                <Badge variant="outline">{5 + i} Units</Badge>
              </div>
              <CardDescription>
                123 Main Street, Unit {i}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="mr-2 h-4 w-4" />
                {3 + i} Occupied / {5 + i} Total
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
