import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';
import { useCrossModuleIntegration } from '@/lib/dataIntegration';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import {
  Building,
  Users,
  Wrench,
  Plus,
  MapPin,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type { Property, Resident, MaintenanceRequest } from '@shared/schema';

export default function Housing() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { triggerUpdate } = useRealTimeUpdates();
  const { invalidateRelated } = useCrossModuleIntegration();

  const { data: properties = [], isLoading: propertiesLoading } = useQuery<
    Property[]
  >({
    queryKey: ['/api/properties'],
  });

  const { data: residents = [], isLoading: residentsLoading } = useQuery<
    Resident[]
  >({
    queryKey: ['/api/residents'],
  });

  const { data: maintenanceRequests = [], isLoading: maintenanceLoading } =
    useQuery<MaintenanceRequest[]>({
      queryKey: ['/api/maintenance-requests'],
    });

  // Filter properties based on search term
  const filteredProperties = properties.filter(
    property =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOccupancyRate = (property: Property) => {
    return property.totalUnits > 0
      ? (property.occupiedUnits / property.totalUnits) * 100
      : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'shared_housing':
        return 'Shared Housing';
      case 'studio_units':
        return 'Studio Units';
      case 'transition_units':
        return 'Transition Units';
      default:
        return type;
    }
  };

  return (
    <div className='flex h-screen bg-background'>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className='flex-1 lg:ml-64 flex flex-col'>
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className='flex-1 overflow-y-auto p-4 sm:p-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Housing Management
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage properties, track occupancy, and coordinate maintenance
              requests
            </p>
          </div>

          <Tabs defaultValue='properties' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='properties'>Properties</TabsTrigger>
              <TabsTrigger value='residents'>Residents</TabsTrigger>
              <TabsTrigger value='maintenance'>Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value='properties' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <div className='flex-1 max-w-md'>
                  <Input
                    type='search'
                    inputMode='search'
                    autoComplete='off'
                    placeholder='Search properties...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full touch-target'
                  />
                </div>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Property
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredProperties.map(property => (
                  <Card
                    key={property.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-primary/10 rounded-lg'>
                            <Building className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-lg'>
                              {property.name}
                            </CardTitle>
                            <CardDescription className='flex items-center gap-1'>
                              <MapPin className='h-3 w-3' />
                              {property.address}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(property.status)}>
                          {property.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Type
                          </span>
                          <span className='text-sm font-medium'>
                            {getPropertyTypeLabel(property.propertyType)}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Occupancy
                          </span>
                          <span className='text-sm font-medium'>
                            {property.occupiedUnits}/{property.totalUnits} (
                            {getOccupancyRate(property).toFixed(0)}%)
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-primary h-2 rounded-full transition-all duration-300'
                            style={{ width: `${getOccupancyRate(property)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='residents' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Current Residents
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Resident
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {residents.map(resident => (
                  <Card
                    key={resident.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-primary/10 rounded-lg'>
                            <Users className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-lg'>
                              {resident.firstName} {resident.lastName}
                            </CardTitle>
                            <CardDescription>
                              {resident.propertyId &&
                                properties.find(
                                  p => p.id === resident.propertyId
                                )?.name}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          className={
                            resident.riskLevel === 'high'
                              ? 'bg-red-100 text-red-800'
                              : resident.riskLevel === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }
                        >
                          {resident.riskLevel} risk
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Unit
                          </span>
                          <span className='text-sm font-medium'>
                            {resident.unitNumber || 'N/A'}
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Independence Level
                          </span>
                          <span className='text-sm font-medium'>
                            {resident.independenceLevel}/5
                          </span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Move-in Date
                          </span>
                          <span className='text-sm font-medium'>
                            {resident.moveInDate
                              ? new Date(
                                  resident.moveInDate
                                ).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='maintenance' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Maintenance Requests
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  New Request
                </Button>
              </div>

              <div className='space-y-4'>
                {maintenanceRequests.length === 0 ? (
                  <Card>
                    <CardContent className='flex items-center justify-center py-8'>
                      <div className='text-center'>
                        <Wrench className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-500'>
                          No maintenance requests at this time
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  maintenanceRequests.map(request => (
                    <Card
                      key={request.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-lg'>
                              <Wrench className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                              <CardTitle className='text-lg'>
                                {request.title}
                              </CardTitle>
                              <CardDescription className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3' />
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            className={
                              request.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : request.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }
                          >
                            {request.priority}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                          {request.description}
                        </p>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            Status
                          </span>
                          <Badge variant='outline'>{request.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
