import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import FormWizard from './FormWizard';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Please specify relationship'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
    email: z.string().email().optional(),
  }),
});

const housingNeedsSchema = z.object({
  propertyId: z.coerce.number().min(1, 'Please select a property'),
  preferredRoomType: z.enum(['single', 'double', 'studio', 'shared']),
  mobilityRequirements: z.array(z.string()).optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
});

const supportNeedsSchema = z.object({
  previousHousingHistory: z.string().optional(),
  currentBenefits: z.array(z.string()).optional(),
  supportServices: z.array(z.string()).optional(),
  healthConditions: z.string().optional(),
  medications: z.string().optional(),
  riskFactors: z.array(z.string()).optional(),
  independenceLevel: z.coerce.number().min(1).max(5).default(3),
});

// Step 1: Personal Information
function PersonalInfoStep({ data, onDataChange }: any) {
  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data || {},
  });

  const handleSubmit = (values: any) => {
    onDataChange(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='firstName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter first name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='lastName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter last name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='Enter email address'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder='Enter phone number' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='dateOfBirth'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Emergency Contact</CardTitle>
            <CardDescription>
              Primary contact in case of emergency
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='emergencyContact.name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Emergency contact name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='emergencyContact.relationship'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Parent, Guardian, Friend'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='emergencyContact.phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Emergency contact phone' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='emergencyContact.email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='Emergency contact email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

// Step 2: Housing Needs
function HousingNeedsStep({ data, onDataChange }: any) {
  const [properties, setProperties] = useState([]);
  const [mobilityRequirements, setMobilityRequirements] = useState<string[]>(
    data?.mobilityRequirements || []
  );
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>(
    data?.dietaryRequirements || []
  );

  const form = useForm({
    resolver: zodResolver(housingNeedsSchema),
    defaultValues: data || {},
  });

  const mobilityOptions = [
    'Wheelchair accessible',
    'Ground floor access',
    'Accessible bathroom',
    'Handrails',
    'Wide doorways',
    'Accessible parking',
    'Lift access',
  ];

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Halal',
    'Kosher',
    'Gluten-free',
    'Dairy-free',
    'Nut allergy',
    'Diabetic',
    'Low sodium',
  ];

  const toggleMobility = (requirement: string) => {
    const updated = mobilityRequirements.includes(requirement)
      ? mobilityRequirements.filter(r => r !== requirement)
      : [...mobilityRequirements, requirement];
    setMobilityRequirements(updated);
    onDataChange({ ...data, mobilityRequirements: updated });
  };

  const toggleDietary = (requirement: string) => {
    const updated = dietaryRequirements.includes(requirement)
      ? dietaryRequirements.filter(r => r !== requirement)
      : [...dietaryRequirements, requirement];
    setDietaryRequirements(updated);
    onDataChange({ ...data, dietaryRequirements: updated });
  };

  return (
    <Form {...form}>
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='propertyId'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Property</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a property' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='1'>Sunrise House</SelectItem>
                    <SelectItem value='2'>Green Valley Residence</SelectItem>
                    <SelectItem value='3'>City Centre Studios</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='preferredRoomType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Room Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select room type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='single'>Single Room</SelectItem>
                    <SelectItem value='double'>Double Room</SelectItem>
                    <SelectItem value='studio'>Studio Unit</SelectItem>
                    <SelectItem value='shared'>Shared Room</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Mobility Requirements</CardTitle>
            <CardDescription>
              Select any mobility accommodations needed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {mobilityOptions.map(requirement => (
                <Button
                  key={requirement}
                  type='button'
                  variant={
                    mobilityRequirements.includes(requirement)
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  onClick={() => toggleMobility(requirement)}
                  className='justify-start'
                >
                  {requirement}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Dietary Requirements</CardTitle>
            <CardDescription>
              Select any dietary needs or allergies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {dietaryOptions.map(requirement => (
                <Button
                  key={requirement}
                  type='button'
                  variant={
                    dietaryRequirements.includes(requirement)
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  onClick={() => toggleDietary(requirement)}
                  className='justify-start'
                >
                  {requirement}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name='specialRequirements'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Requirements</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Please describe any other special requirements or accommodations needed'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

// Step 3: Support Needs Assessment
function SupportNeedsStep({ data, onDataChange }: any) {
  const [currentBenefits, setCurrentBenefits] = useState<string[]>(
    data?.currentBenefits || []
  );
  const [supportServices, setSupportServices] = useState<string[]>(
    data?.supportServices || []
  );
  const [riskFactors, setRiskFactors] = useState<string[]>(
    data?.riskFactors || []
  );

  const form = useForm({
    resolver: zodResolver(supportNeedsSchema),
    defaultValues: data || {},
  });

  const benefitOptions = [
    'Universal Credit',
    'Job Seekers Allowance',
    'Personal Independence Payment',
    'Employment Support Allowance',
    'Housing Benefit',
    'Council Tax Support',
  ];

  const supportOptions = [
    'Mental Health Support',
    'Employment Support',
    'Education/Training',
    'Life Skills',
    'Addiction Support',
    'Family Support',
    'Financial Advice',
  ];

  const riskOptions = [
    'Mental Health Concerns',
    'Substance Use',
    'Self-Harm Risk',
    'Domestic Violence',
    'Criminal Justice System',
    'Homelessness History',
  ];

  const toggleBenefit = (benefit: string) => {
    const updated = currentBenefits.includes(benefit)
      ? currentBenefits.filter(b => b !== benefit)
      : [...currentBenefits, benefit];
    setCurrentBenefits(updated);
    onDataChange({ ...data, currentBenefits: updated });
  };

  const toggleSupport = (service: string) => {
    const updated = supportServices.includes(service)
      ? supportServices.filter(s => s !== service)
      : [...supportServices, service];
    setSupportServices(updated);
    onDataChange({ ...data, supportServices: updated });
  };

  const toggleRisk = (risk: string) => {
    const updated = riskFactors.includes(risk)
      ? riskFactors.filter(r => r !== risk)
      : [...riskFactors, risk];
    setRiskFactors(updated);
    onDataChange({ ...data, riskFactors: updated });
  };

  return (
    <Form {...form}>
      <div className='space-y-6'>
        <FormField
          control={form.control}
          name='previousHousingHistory'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Previous Housing History</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Please describe previous housing arrangements and experiences'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Current Benefits</CardTitle>
            <CardDescription>
              Select any benefits currently received
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {benefitOptions.map(benefit => (
                <Button
                  key={benefit}
                  type='button'
                  variant={
                    currentBenefits.includes(benefit) ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => toggleBenefit(benefit)}
                  className='justify-start'
                >
                  {benefit}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Support Services Needed</CardTitle>
            <CardDescription>
              Select areas where support would be helpful
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {supportOptions.map(service => (
                <Button
                  key={service}
                  type='button'
                  variant={
                    supportServices.includes(service) ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => toggleSupport(service)}
                  className='justify-start'
                >
                  {service}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='healthConditions'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Conditions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Please describe any health conditions or disabilities'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='medications'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Medications</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='List any current medications'
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Risk Factors</CardTitle>
            <CardDescription>
              Select any relevant risk factors (confidential)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {riskOptions.map(risk => (
                <Button
                  key={risk}
                  type='button'
                  variant={riskFactors.includes(risk) ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => toggleRisk(risk)}
                  className='justify-start'
                >
                  {risk}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name='independenceLevel'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Independence Level (1-5)</FormLabel>
              <FormControl>
                <Select
                  onValueChange={value => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select independence level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>
                      1 - Requires significant support
                    </SelectItem>
                    <SelectItem value='2'>
                      2 - Requires regular support
                    </SelectItem>
                    <SelectItem value='3'>3 - Requires some support</SelectItem>
                    <SelectItem value='4'>4 - Mostly independent</SelectItem>
                    <SelectItem value='5'>5 - Fully independent</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                Rate the resident's current level of independence
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}

export default function ResidentIntakeForm() {
  const { toast } = useToast();

  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic personal details and emergency contact',
      component: PersonalInfoStep,
      validation: (data: any) => {
        try {
          personalInfoSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      id: 'housing',
      title: 'Housing Needs',
      description: 'Accommodation preferences and requirements',
      component: HousingNeedsStep,
      validation: (data: any) => {
        try {
          housingNeedsSchema.parse(data);
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      id: 'support',
      title: 'Support Needs',
      description: 'Assessment of support requirements',
      component: SupportNeedsStep,
    },
  ];

  const handleComplete = async (data: any) => {
    try {
      // Process the combined data
      const residentData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        propertyId: data.propertyId,
        independenceLevel: data.independenceLevel,
        riskLevel:
          data.riskFactors?.length > 2
            ? 'high'
            : data.riskFactors?.length > 0
              ? 'medium'
              : 'low',
      };

      // Create the resident
      const response = await apiRequest('POST', '/api/residents', residentData);

      if (response.ok) {
        const resident = await response.json();

        // Create assessment form
        const assessmentData = {
          residentId: resident.id,
          assessmentType: 'intake',
          responses: data,
          assessorId: 1, // This would be the current staff member
        };

        await apiRequest('POST', '/api/assessment-forms', assessmentData);

        toast({
          title: 'Intake Assessment Complete',
          description:
            'The resident has been successfully registered and assessed.',
        });

        // Redirect to resident details or dashboard
        window.location.href = `/residents/${resident.id}`;
      } else {
        throw new Error('Failed to register resident');
      }
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'There was an error registering the resident.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <FormWizard
      formType='resident_intake'
      title='Resident Intake Assessment'
      description='Complete assessment for new resident registration'
      steps={steps}
      onComplete={handleComplete}
      allowSaveAndContinue={true}
    />
  );
}
