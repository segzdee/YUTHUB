import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import UKCouncilAnalytics from './UKCouncilAnalytics';

interface GovernmentClient {
  id: number;
  clientName: string;
  clientType: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  billingAddress: string;
  paymentTerms: number;
  defaultRate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CouncilData {
  region: string;
  area: string;
  population: number;
  socialHousingUnits: number;
  website: string;
  housingOfficer: string;
  partnershipStatus: string;
  joinDate: string | null;
}

export default function UKCouncilDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCouncil, setSelectedCouncil] =
    useState<GovernmentClient | null>(null);

  const {
    data: councils = [],
    isLoading,
    error,
  } = useQuery<GovernmentClient[]>({
    queryKey: ['/api/billing/government-clients'],
    queryFn: () => apiRequest('/api/billing/government-clients'),
    retry: false,
    select: data => data || [],
  });

  // Enhanced council data (this would typically come from your JSON file or additional API)
  const councilMetadata: Record<string, CouncilData> = {
    'Westminster City Council': {
      region: 'London',
      area: 'Westminster',
      population: 261000,
      socialHousingUnits: 12500,
      website: 'https://www.westminster.gov.uk',
      housingOfficer: 'James Richardson',
      partnershipStatus: 'Active Client',
      joinDate: '2024-03-15',
    },
    'Camden Council': {
      region: 'London',
      area: 'Camden',
      population: 270000,
      socialHousingUnits: 15200,
      website: 'https://www.camden.gov.uk',
      housingOfficer: 'Emma Thompson',
      partnershipStatus: 'Active Client',
      joinDate: '2024-01-22',
    },
    'Tower Hamlets Council': {
      region: 'London',
      area: 'Tower Hamlets',
      population: 324000,
      socialHousingUnits: 21800,
      website: 'https://www.towerhamlets.gov.uk',
      housingOfficer: 'David Kumar',
      partnershipStatus: 'Active Client',
      joinDate: '2024-02-08',
    },
    'Birmingham City Council': {
      region: 'West Midlands',
      area: 'Birmingham',
      population: 1141000,
      socialHousingUnits: 58400,
      website: 'https://www.birmingham.gov.uk',
      housingOfficer: 'Kevin Brown',
      partnershipStatus: 'Active Client',
      joinDate: '2024-02-12',
    },
    'Manchester City Council': {
      region: 'Greater Manchester',
      area: 'Manchester',
      population: 547000,
      socialHousingUnits: 31200,
      website: 'https://www.manchester.gov.uk',
      housingOfficer: 'Sarah Ahmed',
      partnershipStatus: 'Active Client',
      joinDate: '2024-01-08',
    },
    'Edinburgh Council': {
      region: 'Scotland',
      area: 'Edinburgh',
      population: 518000,
      socialHousingUnits: 21600,
      website: 'https://www.edinburgh.gov.uk',
      housingOfficer: 'Alasdair Campbell',
      partnershipStatus: 'Active Client',
      joinDate: '2024-01-30',
    },
    'Cardiff Council': {
      region: 'Wales',
      area: 'Cardiff',
      population: 366000,
      socialHousingUnits: 19500,
      website: 'https://www.cardiff.gov.uk',
      housingOfficer: 'Cerys Jones',
      partnershipStatus: 'Active Client',
      joinDate: '2024-03-30',
    },
  };

  const filteredCouncils = useMemo(() => {
    return councils.filter(council => {
      const matchesSearch =
        council.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        council.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        council.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const metadata = councilMetadata[council.clientName];
      const matchesRegion =
        regionFilter === 'all' ||
        (metadata && metadata.region === regionFilter);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && council.isActive) ||
        (statusFilter === 'inactive' && !council.isActive);

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [councils, searchTerm, regionFilter, statusFilter]);

  const regions = useMemo(() => {
    const regionSet = new Set(
      Object.values(councilMetadata).map(c => c.region)
    );
    return Array.from(regionSet);
  }, []);

  const totalPopulation = useMemo(() => {
    return filteredCouncils.reduce((sum, council) => {
      const metadata = councilMetadata[council.clientName];
      return sum + (metadata?.population || 0);
    }, 0);
  }, [filteredCouncils]);

  const totalHousingUnits = useMemo(() => {
    return filteredCouncils.reduce((sum, council) => {
      const metadata = councilMetadata[council.clientName];
      return sum + (metadata?.socialHousingUnits || 0);
    }, 0);
  }, [filteredCouncils]);

  const getStatusBadge = (council: GovernmentClient) => {
    const metadata = councilMetadata[council.clientName];
    const status = metadata?.partnershipStatus || 'Unknown';

    const colors = {
      'Active Client': 'bg-green-100 text-green-800',
      'Trial Period': 'bg-yellow-100 text-yellow-800',
      'Prospective Client': 'bg-blue-100 text-blue-800',
      Unknown: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge
        className={colors[status as keyof typeof colors] || colors.Unknown}
      >
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(parseFloat(amount));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading UK Council data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600'>
          Error loading council data. Please try again.
        </p>
      </div>
    );
  }

  const handleAddCouncil = () => {
    window.location.href = '/billing?tab=government-clients';
  };

  const handleEditCouncil = (councilId: number) => {
    window.location.href = `/billing/government-clients/${councilId}/edit`;
  };

  const handleViewCouncil = (council: GovernmentClient) => {
    setSelectedCouncil(council);
  };

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            UK Borough Council Management
          </h1>
          <p className='text-gray-600'>
            Manage partnerships with {councils.length} local authorities across
            the UK
          </p>
        </div>
        <Button onClick={handleAddCouncil}>
          <Building2 className='mr-2 h-4 w-4' />
          Add New Council
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Councils
            </CardTitle>
            <Building2 className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{filteredCouncils.length}</div>
            <p className='text-xs text-gray-600'>
              {councils.filter(c => c.isActive).length} active partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Population
            </CardTitle>
            <Users className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatNumber(totalPopulation)}
            </div>
            <p className='text-xs text-gray-600'>
              Across {regions.length} regions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Housing Units</CardTitle>
            <Building2 className='h-4 w-4 text-purple-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatNumber(totalHousingUnits)}
            </div>
            <p className='text-xs text-gray-600'>
              Social housing units managed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Monthly Revenue
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(
                filteredCouncils
                  .reduce(
                    (sum, council) => sum + parseFloat(council.defaultRate),
                    0
                  )
                  .toString()
              )}
            </div>
            <p className='text-xs text-gray-600'>Combined monthly rates</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <div className='flex-1 min-w-64'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search councils, contacts, or emails...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Filter by region' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue='directory' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='directory'>Council Directory</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value='directory'>
          <Card>
            <CardHeader>
              <CardTitle>Council Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Council</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Population</TableHead>
                    <TableHead>Housing Units</TableHead>
                    <TableHead>Monthly Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCouncils.map(council => {
                    const metadata = councilMetadata[council.clientName];
                    return (
                      <TableRow key={council.id}>
                        <TableCell className='font-medium'>
                          <div>
                            <div className='font-medium'>
                              {council.clientName}
                            </div>
                            <div className='text-sm text-gray-600'>
                              {metadata?.area}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <MapPin className='h-4 w-4 mr-1 text-gray-400' />
                            {metadata?.region || 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='flex items-center text-sm'>
                              <Mail className='h-3 w-3 mr-1 text-gray-400' />
                              {council.contactEmail}
                            </div>
                            <div className='flex items-center text-sm'>
                              <Phone className='h-3 w-3 mr-1 text-gray-400' />
                              {council.contactPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatNumber(metadata?.population || 0)}
                        </TableCell>
                        <TableCell>
                          {formatNumber(metadata?.socialHousingUnits || 0)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(council.defaultRate)}
                        </TableCell>
                        <TableCell>{getStatusBadge(council)}</TableCell>
                        <TableCell>
                          <div className='flex space-x-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleViewCouncil(council)}
                            >
                              <FileText className='h-3 w-3 mr-1' />
                              View
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleEditCouncil(council.id)}
                            >
                              <Settings className='h-3 w-3 mr-1' />
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics'>
          <UKCouncilAnalytics councils={councils} />
        </TabsContent>
      </Tabs>

      {/* Council Detail Modal would go here */}
      {selectedCouncil && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex justify-between items-start mb-6'>
                <h2 className='text-2xl font-bold'>
                  {selectedCouncil.clientName}
                </h2>
                <Button
                  variant='outline'
                  onClick={() => setSelectedCouncil(null)}
                >
                  Close
                </Button>
              </div>

              <Tabs defaultValue='overview' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='overview'>Overview</TabsTrigger>
                  <TabsTrigger value='contact'>Contact</TabsTrigger>
                  <TabsTrigger value='billing'>Billing</TabsTrigger>
                </TabsList>

                <TabsContent value='overview' className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          Basic Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        <p>
                          <strong>Type:</strong> {selectedCouncil.clientType}
                        </p>
                        <p>
                          <strong>Region:</strong>{' '}
                          {councilMetadata[selectedCouncil.clientName]?.region}
                        </p>
                        <p>
                          <strong>Population:</strong>{' '}
                          {formatNumber(
                            councilMetadata[selectedCouncil.clientName]
                              ?.population || 0
                          )}
                        </p>
                        <p>
                          <strong>Housing Units:</strong>{' '}
                          {formatNumber(
                            councilMetadata[selectedCouncil.clientName]
                              ?.socialHousingUnits || 0
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className='text-lg'>
                          Partnership Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-2'>
                        <p>
                          <strong>Status:</strong>{' '}
                          {getStatusBadge(selectedCouncil)}
                        </p>
                        <p>
                          <strong>Join Date:</strong>{' '}
                          {councilMetadata[selectedCouncil.clientName]
                            ?.joinDate || 'Not specified'}
                        </p>
                        <p>
                          <strong>Housing Officer:</strong>{' '}
                          {
                            councilMetadata[selectedCouncil.clientName]
                              ?.housingOfficer
                          }
                        </p>
                        <p>
                          <strong>Active:</strong>{' '}
                          {selectedCouncil.isActive ? 'Yes' : 'No'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value='contact' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='flex items-center space-x-2'>
                        <Mail className='h-4 w-4 text-gray-400' />
                        <span>{selectedCouncil.contactEmail}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Phone className='h-4 w-4 text-gray-400' />
                        <span>{selectedCouncil.contactPhone}</span>
                      </div>
                      <div className='flex items-start space-x-2'>
                        <MapPin className='h-4 w-4 text-gray-400 mt-1' />
                        <div>
                          <p className='font-medium'>Billing Address</p>
                          <p className='text-sm text-gray-600'>
                            {selectedCouncil.billingAddress}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='billing' className='space-y-4'>
                  <Card>
                    <CardHeader>
                      <CardTitle className='text-lg'>
                        Billing Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <p>
                        <strong>Default Rate:</strong>{' '}
                        {formatCurrency(selectedCouncil.defaultRate)}
                      </p>
                      <p>
                        <strong>Payment Terms:</strong>{' '}
                        {selectedCouncil.paymentTerms} days
                      </p>
                      <p>
                        <strong>Client Type:</strong>{' '}
                        {selectedCouncil.clientType}
                      </p>
                      <p>
                        <strong>Created:</strong>{' '}
                        {new Date(
                          selectedCouncil.createdAt
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Last Updated:</strong>{' '}
                        {new Date(
                          selectedCouncil.updatedAt
                        ).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
