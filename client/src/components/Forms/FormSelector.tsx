import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Home,
  FileText,
  AlertTriangle,
  Target,
  UserPlus,
  Wrench,
  Bed,
  DollarSign,
  ClipboardList,
  UserCog,
  TrendingUp,
} from 'lucide-react';

// Import all form components
import ResidentIntakeForm from './ResidentIntakeForm';
import PropertyRegistrationForm from './PropertyRegistrationForm';
// SupportPlanForm removed - consolidated into ProgressTrackingForm
import IncidentReportForm from './IncidentReportForm';
import ProgressTrackingForm from './ProgressTrackingForm';
import StaffMemberForm from './StaffMemberForm';
import MaintenanceRequestForm from './MaintenanceRequestForm';
import TenancyAgreementForm from './TenancyAgreementForm';
import AssessmentForm from './AssessmentForm';
import RoomAllocationForm from './RoomAllocationForm';
import FinancialRecordForm from './FinancialRecordForm';
import UserManagementForm from './UserManagementForm';

interface FormSelectorProps {
  onFormSelect?: (
    FormComponent: React.ComponentType<any>,
    formType: string
  ) => void;
}

export default function FormSelector({ onFormSelect }: FormSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const formCategories = [
    { id: 'all', label: 'All Forms', icon: FileText },
    { id: 'housing', label: 'Housing', icon: Home },
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'staff', label: 'Staff', icon: UserCog },
    { id: 'operations', label: 'Operations', icon: TrendingUp },
  ];

  const forms = [
    {
      id: 'resident-intake',
      title: 'Resident Intake',
      description: 'Register new residents and capture essential information',
      icon: Users,
      category: 'residents',
      component: ResidentIntakeForm,
      complexity: 'medium',
      estimatedTime: '15-20 min',
    },
    {
      id: 'property-registration',
      title: 'Property Registration',
      description: 'Add new properties to the system',
      icon: Home,
      category: 'housing',
      component: PropertyRegistrationForm,
      complexity: 'low',
      estimatedTime: '5-10 min',
    },
    {
      id: 'support-plan',
      title: 'Support Plan',
      description: 'Create comprehensive support plans for residents',
      icon: Target,
      category: 'residents',
      component: ProgressTrackingForm,
      complexity: 'high',
      estimatedTime: '20-30 min',
    },
    {
      id: 'incident-report',
      title: 'Incident Report',
      description: 'Report and track safety incidents',
      icon: AlertTriangle,
      category: 'operations',
      component: IncidentReportForm,
      complexity: 'medium',
      estimatedTime: '10-15 min',
    },
    {
      id: 'progress-tracking',
      title: 'Progress Tracking',
      description: 'Track resident progress and achievements',
      icon: TrendingUp,
      category: 'residents',
      component: ProgressTrackingForm,
      complexity: 'medium',
      estimatedTime: '10-15 min',
    },
    {
      id: 'staff-member',
      title: 'Staff Registration',
      description: 'Register new staff members with full details',
      icon: UserPlus,
      category: 'staff',
      component: StaffMemberForm,
      complexity: 'medium',
      estimatedTime: '15-20 min',
    },
    {
      id: 'maintenance-request',
      title: 'Maintenance Request',
      description: 'Submit maintenance and repair requests',
      icon: Wrench,
      category: 'operations',
      component: MaintenanceRequestForm,
      complexity: 'low',
      estimatedTime: '5-10 min',
    },
    {
      id: 'tenancy-agreement',
      title: 'Tenancy Agreement',
      description: 'Create formal tenancy agreements',
      icon: FileText,
      category: 'housing',
      component: TenancyAgreementForm,
      complexity: 'high',
      estimatedTime: '20-25 min',
    },
    {
      id: 'assessment-form',
      title: 'Assessment Form',
      description: 'Conduct resident assessments and evaluations',
      icon: ClipboardList,
      category: 'residents',
      component: AssessmentForm,
      complexity: 'high',
      estimatedTime: '25-35 min',
    },
    {
      id: 'room-allocation',
      title: 'Room Allocation',
      description: 'Allocate and manage room assignments',
      icon: Bed,
      category: 'housing',
      component: RoomAllocationForm,
      complexity: 'medium',
      estimatedTime: '10-15 min',
    },
    {
      id: 'financial-record',
      title: 'Financial Record',
      description: 'Record financial transactions and expenses',
      icon: DollarSign,
      category: 'operations',
      component: FinancialRecordForm,
      complexity: 'low',
      estimatedTime: '5-10 min',
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: UserCog,
      category: 'staff',
      component: UserManagementForm,
      complexity: 'medium',
      estimatedTime: '10-15 min',
    },
  ];

  const filteredForms =
    selectedCategory === 'all'
      ? forms
      : forms.filter(form => form.category === selectedCategory);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold mb-2'>Form Library</h2>
        <p className='text-muted-foreground'>
          Choose from our comprehensive collection of forms to streamline your
          housing management operations.
        </p>
      </div>

      {/* Category Filter */}
      <div className='flex flex-wrap gap-2'>
        {formCategories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className='flex items-center gap-2'
            >
              <Icon className='h-4 w-4' />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Forms Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredForms.map(form => {
          const Icon = form.icon;
          return (
            <Card
              key={form.id}
              className='cursor-pointer hover:shadow-md transition-shadow'
            >
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-primary/10 rounded-lg'>
                      <Icon className='h-5 w-5 text-primary' />
                    </div>
                    <div>
                      <CardTitle className='text-lg'>{form.title}</CardTitle>
                    </div>
                  </div>
                  <Badge className={getComplexityColor(form.complexity)}>
                    {form.complexity}
                  </Badge>
                </div>
                <CardDescription className='line-clamp-2'>
                  {form.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Est. {form.estimatedTime}
                  </span>
                  <Button
                    onClick={() => onFormSelect?.(form.component, form.id)}
                    size='sm'
                  >
                    Select Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredForms.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground'>
            No forms found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
