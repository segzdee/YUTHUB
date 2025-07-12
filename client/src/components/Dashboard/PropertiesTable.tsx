import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Property {
  id: number;
  name: string;
  address: string;
  propertyType: string;
  totalUnits: number;
  occupiedUnits: number;
  status: string;
}

export default function PropertiesTable() {
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success bg-opacity-10 text-success";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatPropertyType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Properties Overview</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-gray-700 font-medium">Property</th>
                <th className="text-left p-3 text-gray-700 font-medium">Type</th>
                <th className="text-left p-3 text-gray-700 font-medium">Occupancy</th>
                <th className="text-left p-3 text-gray-700 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties?.slice(0, 3).map((property) => (
                <tr key={property.id}>
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-slate">{property.name}</p>
                      <p className="text-xs text-gray-500">{property.address}</p>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{formatPropertyType(property.propertyType)}</td>
                  <td className="p-3 text-gray-600">{property.occupiedUnits}/{property.totalUnits}</td>
                  <td className="p-3">
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
