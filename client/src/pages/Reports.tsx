import Header from '@/components/Layout/Header';
import Sidebar from '@/components/Layout/Sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import type { Property } from '@shared/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Building,
  CalendarIcon,
  DollarSign,
  Download,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: {
      type: string;
      dateRange: { from: Date; to: Date };
      propertyId?: string;
      filters?: any;
    }) => {
      const response = await apiRequest(
        'POST',
        '/api/reports/generate',
        reportData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Report Generated',
        description: 'Your report has been generated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const reportTemplates = [
    {
      id: 'occupancy',
      title: 'Occupancy Report',
      description: 'Track property occupancy rates and trends',
      icon: Building,
      category: 'housing',
      frequency: 'Monthly',
      estimatedTime: '5 minutes',
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Revenue, expenses, and budget analysis',
      icon: DollarSign,
      category: 'financial',
      frequency: 'Monthly',
      estimatedTime: '8 minutes',
    },
    {
      id: 'incident',
      title: 'Incident Report',
      description: 'Safety incidents and resolution tracking',
      icon: AlertTriangle,
      category: 'safeguarding',
      frequency: 'Weekly',
      estimatedTime: '3 minutes',
    },
    {
      id: 'progress',
      title: 'Progress Report',
      description: 'Resident progress and goal achievements',
      icon: TrendingUp,
      category: 'outcomes',
      frequency: 'Monthly',
      estimatedTime: '10 minutes',
    },
    {
      id: 'compliance',
      title: 'Compliance Report',
      description: 'Regulatory compliance and audit trail',
      icon: FileText,
      category: 'compliance',
      frequency: 'Quarterly',
      estimatedTime: '15 minutes',
    },
    {
      id: 'risk',
      title: 'Risk Assessment Report',
      description: 'Risk levels and mitigation strategies',
      icon: AlertTriangle,
      category: 'safeguarding',
      frequency: 'Monthly',
      estimatedTime: '12 minutes',
    },
    {
      id: 'maintenance',
      title: 'Maintenance Report',
      description: 'Property maintenance and repair tracking',
      icon: Building,
      category: 'maintenance',
      frequency: 'Monthly',
      estimatedTime: '6 minutes',
    },
    {
      id: 'staff',
      title: 'Staff Performance Report',
      description: 'Staff productivity and performance metrics',
      icon: Users,
      category: 'staff',
      frequency: 'Monthly',
      estimatedTime: '8 minutes',
    },
  ];

  const recentReports = [
    {
      id: 1,
      title: 'Monthly Occupancy Report - December 2023',
      type: 'Occupancy',
      generatedAt: '2024-01-15 10:30',
      generatedBy: 'Sarah Johnson',
      status: 'Completed',
      size: '2.4 MB',
      format: 'PDF',
    },
    {
      id: 2,
      title: 'Q4 2023 Financial Report',
      type: 'Financial',
      generatedAt: '2024-01-14 15:45',
      generatedBy: 'David Lee',
      status: 'Completed',
      size: '3.1 MB',
      format: 'Excel',
    },
    {
      id: 3,
      title: 'Weekly Incident Report - Week 2',
      type: 'Incident',
      generatedAt: '2024-01-12 09:15',
      generatedBy: 'Emma Wilson',
      status: 'Completed',
      size: '1.8 MB',
      format: 'PDF',
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'housing':
        return 'bg-blue-100 text-blue-800';
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'safeguarding':
        return 'bg-red-100 text-red-800';
      case 'outcomes':
        return 'bg-purple-100 text-purple-800';
      case 'compliance':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800';
      case 'staff':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true);
    try {
      await generateReportMutation.mutateAsync({
        type: reportId,
        dateRange: selectedDateRange,
        propertyId: selectedProperty !== 'all' ? selectedProperty : undefined,
        filters: { reportType },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTemplates = reportTemplates.filter(
    template => reportType === 'all' || template.category === reportType
  );

  return (
    <div className='flex h-screen bg-background'>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className='flex-1 lg:ml-64 flex flex-col'>
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className='flex-1 overflow-y-auto p-4 sm:p-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Reports
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Generate comprehensive reports for housing, financial, and outcome
              tracking
            </p>
          </div>

          {/* Report Configuration */}
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>
                Configure date range and filters for your reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDateRange && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {selectedDateRange?.from ? (
                          selectedDateRange.to ? (
                            <>
                              {format(selectedDateRange.from, 'LLL dd, y')} -{' '}
                              {format(selectedDateRange.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(selectedDateRange.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        initialFocus
                        mode='range'
                        defaultMonth={selectedDateRange?.from}
                        selected={selectedDateRange}
                        onSelect={range => {
                          if (range?.from && range?.to) {
                            setSelectedDateRange({
                              from: range.from,
                              to: range.to,
                            });
                          }
                        }}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className='text-sm font-medium'>Property</label>
                  <Select
                    value={selectedProperty}
                    onValueChange={setSelectedProperty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select property' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Properties</SelectItem>
                      {properties.map(property => (
                        <SelectItem
                          key={property.id}
                          value={property.id.toString()}
                        >
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className='text-sm font-medium'>Category</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Categories</SelectItem>
                      <SelectItem value='housing'>Housing</SelectItem>
                      <SelectItem value='financial'>Financial</SelectItem>
                      <SelectItem value='safeguarding'>Safeguarding</SelectItem>
                      <SelectItem value='outcomes'>Outcomes</SelectItem>
                      <SelectItem value='compliance'>Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-end'>
                  <Button className='w-full'>
                    <Download className='h-4 w-4 mr-2' />
                    Export All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Templates */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredTemplates.map(template => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-primary/10 rounded-lg'>
                          <Icon className='h-5 w-5 text-primary' />
                        </div>
                        <div>
                          <CardTitle className='text-lg'>
                            {template.title}
                          </CardTitle>
                          <CardDescription>
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Frequency
                          </span>
                          <div className='font-medium'>
                            {template.frequency}
                          </div>
                        </div>
                        <div>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Est. Time
                          </span>
                          <div className='font-medium'>
                            {template.estimatedTime}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleGenerateReport(template.id)}
                        disabled={isGenerating}
                        className='w-full'
                      >
                        <Download className='h-3 w-3 mr-1' />
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
