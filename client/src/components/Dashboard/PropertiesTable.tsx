import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileTable } from "@/components/ui/mobile-table";

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

  const columns = [
    {
      key: 'name',
      label: 'Property',
      render: (value: string, row: Property) => (
        <div>
          <p className="font-medium text-slate text-sm">{value}</p>
          <p className="text-xs text-gray-500 md:hidden">{formatPropertyType(row.propertyType)}</p>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">{row.address}</p>
        </div>
      )
    },
    {
      key: 'propertyType',
      label: 'Type',
      render: (value: string) => formatPropertyType(value),
      hideOnMobile: true
    },
    {
      key: 'occupancy',
      label: 'Occupancy',
      render: (value: any, row: Property) => `${row.occupiedUnits}/${row.totalUnits}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={`${getStatusColor(value)} text-xs`}>
          {value}
        </Badge>
      )
    }
  ];

  return (
    <MobileTable
      title="Properties Overview"
      data={properties?.slice(0, 3) || []}
      columns={columns}
      actions={
        <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800 text-sm">
          View All
        </Button>
      }
    />
  );
}
