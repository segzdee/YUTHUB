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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">Properties Overview</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800 text-sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 sm:p-3 text-gray-700 font-medium text-xs sm:text-sm">Property</th>
                <th className="text-left p-2 sm:p-3 text-gray-700 font-medium text-xs sm:text-sm hidden sm:table-cell">Type</th>
                <th className="text-left p-2 sm:p-3 text-gray-700 font-medium text-xs sm:text-sm">Occupancy</th>
                <th className="text-left p-2 sm:p-3 text-gray-700 font-medium text-xs sm:text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties?.slice(0, 3).map((property) => (
                <tr key={property.id}>
                  <td className="p-2 sm:p-3">
                    <div>
                      <p className="font-medium text-slate text-xs sm:text-sm">{property.name}</p>
                      <p className="text-xs text-gray-500 sm:hidden">{formatPropertyType(property.propertyType)}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{property.address}</p>
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 text-gray-600 text-xs sm:text-sm hidden sm:table-cell">{formatPropertyType(property.propertyType)}</td>
                  <td className="p-2 sm:p-3 text-gray-600 text-xs sm:text-sm">{property.occupiedUnits}/{property.totalUnits}</td>
                  <td className="p-2 sm:p-3">
                    <Badge className={`${getStatusColor(property.status)} text-xs`}>
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
