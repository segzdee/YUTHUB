import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Home, Search, MapPin, Users, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Property {
  id: string;
  property_name: string;
  address: string;
  property_type: string;
  total_capacity: number;
  current_occupancy: number;
  status: string;
  last_inspection_date?: string;
  manager_id?: string;
  staff_members?: { first_name: string; last_name: string };
}

const mockProperties: Property[] = [
  {
    id: "1",
    name: "Maple House",
    address: "123 Oak Street, Manchester, M1 1AA",
    type: "Supported Housing",
    totalUnits: 8,
    occupiedUnits: 7,
    availableUnits: 1,
    complianceStatus: "compliant",
    lastInspection: "2024-10-15",
  },
  {
    id: "2",
    name: "Oak Lodge",
    address: "456 Elm Avenue, Manchester, M2 2BB",
    type: "Semi-Independent",
    totalUnits: 6,
    occupiedUnits: 5,
    availableUnits: 1,
    complianceStatus: "compliant",
    lastInspection: "2024-09-20",
  },
  {
    id: "3",
    name: "Pine Court",
    address: "789 Pine Road, Manchester, M3 3CC",
    type: "Independent Living",
    totalUnits: 10,
    occupiedUnits: 9,
    availableUnits: 1,
    complianceStatus: "warning",
    lastInspection: "2024-08-10",
  },
  {
    id: "4",
    name: "Birch Apartments",
    address: "321 Willow Lane, Manchester, M4 4DD",
    type: "Supported Housing",
    totalUnits: 12,
    occupiedUnits: 10,
    availableUnits: 2,
    complianceStatus: "compliant",
    lastInspection: "2024-11-01",
  },
];

const complianceColors = {
  active: "bg-green-500/10 text-green-700 dark:text-green-400",
  inactive: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  under_maintenance: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  compliant: "bg-green-500/10 text-green-700 dark:text-green-400",
  warning: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  overdue: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function Properties() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [complianceFilter, setComplianceFilter] = useState<string>("all");

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          staff_members:manager_id(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
      return data || [];
    },
  });

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesSearch =
        property.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property.address?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || property.property_type === typeFilter;
      const matchesCompliance =
        complianceFilter === "all" || property.status === complianceFilter;
      return matchesSearch && matchesType && matchesCompliance;
    });
  }, [properties, searchTerm, typeFilter, complianceFilter]);

  const propertyTypes = useMemo(() => {
    return Array.from(new Set(properties.map((p) => p.property_type).filter(Boolean)));
  }, [properties]);

  const totalStats = useMemo(() => {
    const total = properties.reduce(
      (acc, p) => {
        acc.totalUnits += p.total_capacity || 0;
        acc.occupiedUnits += p.current_occupancy || 0;
        acc.availableUnits += (p.total_capacity || 0) - (p.current_occupancy || 0);
        return acc;
      },
      { totalUnits: 0, occupiedUnits: 0, availableUnits: 0, occupancyRate: 0 }
    );
    // Fix NaN issue: only calculate if totalUnits > 0
    total.occupancyRate = total.totalUnits > 0
      ? (total.occupiedUnits / total.totalUnits) * 100
      : 0;
    return total;
  }, [properties]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Properties</h1>
          <p className="text-muted-foreground">
            Manage housing properties and units
          </p>
        </div>
        <Button onClick={() => navigate("/app/dashboard/properties/register")}>
          <Home className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.totalUnits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalStats.occupiedUnits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStats.occupancyRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or address..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={complianceFilter} onValueChange={setComplianceFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Compliance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No properties found matching your filters.
            </CardContent>
          </Card>
        ) : (
          filteredProperties.map((property) => {
            const total = property.total_capacity || 0;
            const occupied = property.current_occupancy || 0;
            const occupancyPercent = total > 0 ? (occupied / total) * 100 : 0;

            return (
              <Card key={property.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{property.property_name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {property.address || "No address"}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {property.property_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-medium">
                        {occupied} / {total} units
                      </span>
                    </div>
                    <Progress value={occupancyPercent} className="h-2" />
                    <div className="text-xs text-muted-foreground text-right">
                      {occupancyPercent.toFixed(1)}% occupied
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {property.status === "active" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <Badge className={complianceColors[property.status as keyof typeof complianceColors] || "bg-gray-500/10 text-gray-700"} variant="outline">
                        {property.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Last inspection: {property.last_inspection_date
                      ? new Date(property.last_inspection_date).toLocaleDateString("en-GB")
                      : "No inspection recorded"}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredProperties.length} of {properties.length} propert{properties.length === 1 ? "y" : "ies"}
        </div>
      </div>
    </div>
  );
}
