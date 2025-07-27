import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Crown, MapPin, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

interface UKCouncilAnalyticsProps {
  councils: GovernmentClient[];
}

export default function UKCouncilAnalytics({
  councils,
}: UKCouncilAnalyticsProps) {
  // Enhanced council metadata with realistic data
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
    'Hackney Council': {
      region: 'London',
      area: 'Hackney',
      population: 279000,
      socialHousingUnits: 18900,
      website: 'https://www.hackney.gov.uk',
      housingOfficer: 'Marcus Williams',
      partnershipStatus: 'Trial Period',
      joinDate: '2024-06-10',
    },
    'Islington Council': {
      region: 'London',
      area: 'Islington',
      population: 239000,
      socialHousingUnits: 16400,
      website: 'https://www.islington.gov.uk',
      housingOfficer: 'Sophie Davis',
      partnershipStatus: 'Active Client',
      joinDate: '2024-04-03',
    },
    'Southwark Council': {
      region: 'London',
      area: 'Southwark',
      population: 317000,
      socialHousingUnits: 25600,
      website: 'https://www.southwark.gov.uk',
      housingOfficer: 'Robert Clark',
      partnershipStatus: 'Active Client',
      joinDate: '2024-01-15',
    },
    'Lambeth Council': {
      region: 'London',
      area: 'Lambeth',
      population: 326000,
      socialHousingUnits: 28200,
      website: 'https://www.lambeth.gov.uk',
      housingOfficer: 'Lisa Martinez',
      partnershipStatus: 'Active Client',
      joinDate: '2024-03-01',
    },
    'Greenwich Council': {
      region: 'London',
      area: 'Greenwich',
      population: 287000,
      socialHousingUnits: 17800,
      website: 'https://www.royalgreenwich.gov.uk',
      housingOfficer: 'Andrew Taylor',
      partnershipStatus: 'Trial Period',
      joinDate: '2024-05-20',
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
    'Leeds City Council': {
      region: 'West Yorkshire',
      area: 'Leeds',
      population: 793000,
      socialHousingUnits: 42800,
      website: 'https://www.leeds.gov.uk',
      housingOfficer: 'Daniel Foster',
      partnershipStatus: 'Active Client',
      joinDate: '2024-03-22',
    },
    'Sheffield City Council': {
      region: 'South Yorkshire',
      area: 'Sheffield',
      population: 584000,
      socialHousingUnits: 36500,
      website: 'https://www.sheffield.gov.uk',
      housingOfficer: 'Helen Wright',
      partnershipStatus: 'Prospective Client',
      joinDate: null,
    },
    'Newcastle City Council': {
      region: 'Tyne and Wear',
      area: 'Newcastle upon Tyne',
      population: 300000,
      socialHousingUnits: 24800,
      website: 'https://www.newcastle.gov.uk',
      housingOfficer: 'Michelle Parker',
      partnershipStatus: 'Trial Period',
      joinDate: '2024-06-01',
    },
    'Liverpool City Council': {
      region: 'Merseyside',
      area: 'Liverpool',
      population: 498000,
      socialHousingUnits: 29600,
      website: 'https://www.liverpool.gov.uk',
      housingOfficer: 'Paul Jenkins',
      partnershipStatus: 'Active Client',
      joinDate: '2024-04-18',
    },
    'Bristol City Council': {
      region: 'South West England',
      area: 'Bristol',
      population: 463000,
      socialHousingUnits: 27400,
      website: 'https://www.bristol.gov.uk',
      housingOfficer: 'Ryan Murphy',
      partnershipStatus: 'Active Client',
      joinDate: '2024-02-25',
    },
    'Nottingham City Council': {
      region: 'East Midlands',
      area: 'Nottingham',
      population: 329000,
      socialHousingUnits: 26200,
      website: 'https://www.nottinghamcity.gov.uk',
      housingOfficer: 'Gary Collins',
      partnershipStatus: 'Prospective Client',
      joinDate: null,
    },
    'Leicester City Council': {
      region: 'East Midlands',
      area: 'Leicester',
      population: 355000,
      socialHousingUnits: 22800,
      website: 'https://www.leicester.gov.uk',
      housingOfficer: 'Anthony Hill',
      partnershipStatus: 'Trial Period',
      joinDate: '2024-05-15',
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
    'Glasgow City Council': {
      region: 'Scotland',
      area: 'Glasgow',
      population: 635000,
      socialHousingUnits: 41200,
      website: 'https://www.glasgow.gov.uk',
      housingOfficer: 'Moira Stewart',
      partnershipStatus: 'Active Client',
      joinDate: '2024-02-14',
    },
  };

  const regionData = useMemo(() => {
    const regions = councils.reduce(
      (acc, council) => {
        const metadata = councilMetadata[council.clientName];
        if (!metadata) return acc;

        const region = metadata.region;
        if (!acc[region]) {
          acc[region] = {
            region,
            councils: 0,
            population: 0,
            housingUnits: 0,
            revenue: 0,
            active: 0,
          };
        }

        acc[region].councils += 1;
        acc[region].population += metadata.population;
        acc[region].housingUnits += metadata.socialHousingUnits;
        acc[region].revenue += parseFloat(council.defaultRate);
        if (council.isActive) acc[region].active += 1;

        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(regions);
  }, [councils]);

  const partnershipData = useMemo(() => {
    const partnerships = councils.reduce(
      (acc, council) => {
        const metadata = councilMetadata[council.clientName];
        const status = metadata?.partnershipStatus || 'Unknown';

        if (!acc[status]) {
          acc[status] = { status, count: 0, revenue: 0 };
        }

        acc[status].count += 1;
        acc[status].revenue += parseFloat(council.defaultRate);

        return acc;
      },
      {} as Record<string, any>
    );

    return Object.values(partnerships);
  }, [councils]);

  const monthlyOnboardingData = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const data = months.map(month => ({
      month,
      newClients: 0,
      totalRevenue: 0,
    }));

    councils.forEach(council => {
      const metadata = councilMetadata[council.clientName];
      if (metadata?.joinDate) {
        const date = new Date(metadata.joinDate);
        const monthIndex = date.getMonth();
        data[monthIndex].newClients += 1;
        data[monthIndex].totalRevenue += parseFloat(council.defaultRate);
      }
    });

    return data;
  }, [councils]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const COLORS = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
  ];

  return (
    <div className='space-y-6'>
      {/* Regional Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <MapPin className='mr-2 h-5 w-5' />
            Regional Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='region'
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      formatNumber(value as number),
                      name,
                    ]}
                  />
                  <Bar dataKey='population' fill='#3B82F6' name='Population' />
                  <Bar
                    dataKey='housingUnits'
                    fill='#10B981'
                    name='Housing Units'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className='space-y-4'>
              <h3 className='font-semibold'>Regional Summary</h3>
              {regionData.map((region, index) => (
                <div
                  key={region.region}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div>
                    <p className='font-medium'>{region.region}</p>
                    <p className='text-sm text-gray-600'>
                      {region.councils} councils
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      {formatCurrency(region.revenue)}
                    </p>
                    <p className='text-sm text-gray-600'>
                      {formatNumber(region.population)} people
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partnership Status Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Crown className='mr-2 h-5 w-5' />
            Partnership Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={partnershipData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {partnershipData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className='space-y-4'>
              <h3 className='font-semibold'>Partnership Breakdown</h3>
              {partnershipData.map((partnership, index) => (
                <div
                  key={partnership.status}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                >
                  <div className='flex items-center space-x-3'>
                    <div
                      className='w-4 h-4 rounded-full'
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className='font-medium'>{partnership.status}</p>
                      <p className='text-sm text-gray-600'>
                        {partnership.count} councils
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-semibold'>
                      {formatCurrency(partnership.revenue)}
                    </p>
                    <p className='text-sm text-gray-600'>Monthly revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Onboarding Trends */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Calendar className='mr-2 h-5 w-5' />
            Monthly Onboarding Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-80'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={monthlyOnboardingData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='newClients'
                  stroke='#3B82F6'
                  strokeWidth={2}
                  name='New Clients'
                />
                <Line
                  type='monotone'
                  dataKey='totalRevenue'
                  stroke='#10B981'
                  strokeWidth={2}
                  name='Revenue Added'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Councils */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <TrendingUp className='mr-2 h-5 w-5' />
            Top Performing Councils
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {councils
              .sort(
                (a, b) => parseFloat(b.defaultRate) - parseFloat(a.defaultRate)
              )
              .slice(0, 5)
              .map((council, index) => {
                const metadata = councilMetadata[council.clientName];
                return (
                  <div
                    key={council.id}
                    className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-blue-600 font-semibold'>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className='font-medium'>{council.clientName}</p>
                        <p className='text-sm text-gray-600'>
                          {metadata?.region}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>
                        {formatCurrency(parseFloat(council.defaultRate))}
                      </p>
                      <p className='text-sm text-gray-600'>Monthly rate</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
