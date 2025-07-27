import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Phone,
  Clock,
  Shield,
  MessageSquare,
  User,
  Plus,
  CheckCircle,
} from 'lucide-react';

export default function Crisis() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCall, setActiveCall] = useState(false);

  const emergencyContacts = [
    {
      id: 1,
      name: 'Emergency Services',
      number: '999',
      type: 'emergency',
      description: 'Police, Fire, Ambulance',
      available: '24/7',
    },
    {
      id: 2,
      name: 'Crisis Support Line',
      number: '0800 123 4567',
      type: 'crisis',
      description: '24/7 mental health crisis support',
      available: '24/7',
    },
    {
      id: 3,
      name: 'On-Call Manager',
      number: '0771 234 5678',
      type: 'internal',
      description: 'Out-of-hours management support',
      available: '24/7',
    },
    {
      id: 4,
      name: 'Safeguarding Team',
      number: '0800 987 6543',
      type: 'safeguarding',
      description: 'Child and adult safeguarding',
      available: '24/7',
    },
    {
      id: 5,
      name: 'NHS 111',
      number: '111',
      type: 'medical',
      description: 'Non-emergency medical advice',
      available: '24/7',
    },
    {
      id: 6,
      name: 'Social Services',
      number: '0800 555 1234',
      type: 'social',
      description: 'Social services emergency line',
      available: '24/7',
    },
  ];

  const crisisProtocols = [
    {
      id: 1,
      title: 'Mental Health Crisis',
      description: 'Immediate response for mental health emergencies',
      steps: [
        'Ensure immediate safety of resident and others',
        'Call crisis support line: 0800 123 4567',
        'Contact on-call manager',
        'Document incident in system',
        'Arrange follow-up support',
      ],
      priority: 'high',
    },
    {
      id: 2,
      title: 'Medical Emergency',
      description: 'Response to serious medical incidents',
      steps: [
        'Call 999 for immediate medical assistance',
        'Provide first aid if trained',
        "Contact resident's next of kin",
        'Notify on-call manager',
        'Complete incident report',
      ],
      priority: 'critical',
    },
    {
      id: 3,
      title: 'Safeguarding Concern',
      description: 'Response to potential abuse or neglect',
      steps: [
        'Ensure immediate safety',
        'Contact safeguarding team: 0800 987 6543',
        'Document all observations',
        'Report to local authority',
        'Implement protection measures',
      ],
      priority: 'high',
    },
    {
      id: 4,
      title: 'Missing Person',
      description: 'Response when resident goes missing',
      steps: [
        'Check property and immediate area',
        'Contact known associates and family',
        'Call police if not found within 2 hours',
        'Alert all staff members',
        'Monitor usual locations',
      ],
      priority: 'high',
    },
  ];

  const recentCrises = [
    {
      id: 1,
      type: 'Mental Health',
      resident: 'John D.',
      status: 'Resolved',
      timestamp: '2024-01-15 14:30',
      responder: 'Crisis Team',
      outcome: 'Resident stabilized, ongoing support arranged',
    },
    {
      id: 2,
      type: 'Medical',
      resident: 'Sarah M.',
      status: 'Ongoing',
      timestamp: '2024-01-15 09:15',
      responder: 'Emergency Services',
      outcome: 'Transported to hospital, stable condition',
    },
  ];

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'crisis':
        return 'bg-orange-100 text-orange-800';
      case 'internal':
        return 'bg-blue-100 text-blue-800';
      case 'safeguarding':
        return 'bg-purple-100 text-purple-800';
      case 'medical':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Escalated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEmergencyCall = (number: string) => {
    setActiveCall(true);
    // Simulate call duration
    setTimeout(() => {
      setActiveCall(false);
    }, 3000);

    // In a real app, this would initiate the call
    // Initiating call to ${number}
  };

  return (
    <div className='flex h-screen bg-background'>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className='flex-1 lg:ml-64 flex flex-col'>
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className='flex-1 overflow-y-auto p-4 sm:p-6'>
          <div className='mb-6 sm:mb-8'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Crisis Connect
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              24/7 emergency response, crisis support, and rapid intervention
              tools
            </p>
          </div>

          {/* Emergency Alert */}
          {activeCall && (
            <Alert className='mb-6 border-red-200 bg-red-50'>
              <AlertTriangle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-800'>
                <strong>Emergency Call Active</strong> - Connected to emergency
                services
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue='emergency' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='emergency'>Emergency</TabsTrigger>
              <TabsTrigger value='protocols'>Protocols</TabsTrigger>
              <TabsTrigger value='support'>Support</TabsTrigger>
              <TabsTrigger value='history'>History</TabsTrigger>
            </TabsList>

            <TabsContent value='emergency' className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {emergencyContacts.map(contact => (
                  <Card
                    key={contact.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-primary/10 rounded-lg'>
                            <Phone className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-lg'>
                              {contact.name}
                            </CardTitle>
                            <CardDescription className='font-mono text-lg font-bold'>
                              {contact.number}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getContactTypeColor(contact.type)}>
                          {contact.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {contact.description}
                        </p>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-1'>
                            <Clock className='h-3 w-3 text-green-600' />
                            <span className='text-sm text-green-600'>
                              {contact.available}
                            </span>
                          </div>
                          <Button
                            size='sm'
                            variant={
                              contact.type === 'emergency'
                                ? 'destructive'
                                : 'default'
                            }
                            onClick={() => handleEmergencyCall(contact.number)}
                            className='flex items-center gap-1'
                          >
                            <Phone className='h-3 w-3' />
                            Call Now
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='protocols' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Crisis Response Protocols
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  New Protocol
                </Button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {crisisProtocols.map(protocol => (
                  <Card
                    key={protocol.id}
                    className='hover:shadow-md transition-shadow'
                  >
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='p-2 bg-primary/10 rounded-lg'>
                            <Shield className='h-5 w-5 text-primary' />
                          </div>
                          <div>
                            <CardTitle className='text-lg'>
                              {protocol.title}
                            </CardTitle>
                            <CardDescription>
                              {protocol.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(protocol.priority)}>
                          {protocol.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-3'>
                        <h4 className='font-medium text-sm'>Response Steps:</h4>
                        <ol className='space-y-2'>
                          {protocol.steps.map((step, index) => (
                            <li
                              key={index}
                              className='flex items-start gap-2 text-sm'
                            >
                              <span className='flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium'>
                                {index + 1}
                              </span>
                              <span className='text-gray-600 dark:text-gray-400'>
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='support' className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      24/7 Support Services
                    </CardTitle>
                    <CardDescription>
                      Always available support resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-lg'>
                        <MessageSquare className='h-5 w-5 text-blue-600' />
                        <div>
                          <div className='font-medium'>Crisis Chat</div>
                          <div className='text-sm text-gray-600'>
                            Live chat support available
                          </div>
                        </div>
                        <Button size='sm' className='ml-auto'>
                          Start Chat
                        </Button>
                      </div>
                      <div className='flex items-center gap-3 p-3 bg-green-50 rounded-lg'>
                        <Phone className='h-5 w-5 text-green-600' />
                        <div>
                          <div className='font-medium'>Support Hotline</div>
                          <div className='text-sm text-gray-600'>
                            0800 123 4567
                          </div>
                        </div>
                        <Button size='sm' className='ml-auto'>
                          Call
                        </Button>
                      </div>
                      <div className='flex items-center gap-3 p-3 bg-purple-50 rounded-lg'>
                        <User className='h-5 w-5 text-purple-600' />
                        <div>
                          <div className='font-medium'>On-Call Worker</div>
                          <div className='text-sm text-gray-600'>
                            Emergency support worker
                          </div>
                        </div>
                        <Button size='sm' className='ml-auto'>
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className='text-lg'>
                      Self-Help Resources
                    </CardTitle>
                    <CardDescription>
                      Immediate coping strategies and tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='p-3 bg-gray-50 rounded-lg'>
                        <h4 className='font-medium mb-2'>
                          Breathing Exercises
                        </h4>
                        <p className='text-sm text-gray-600'>
                          4-7-8 breathing technique for anxiety
                        </p>
                      </div>
                      <div className='p-3 bg-gray-50 rounded-lg'>
                        <h4 className='font-medium mb-2'>
                          Grounding Techniques
                        </h4>
                        <p className='text-sm text-gray-600'>
                          5-4-3-2-1 sensory grounding method
                        </p>
                      </div>
                      <div className='p-3 bg-gray-50 rounded-lg'>
                        <h4 className='font-medium mb-2'>Crisis Safety Plan</h4>
                        <p className='text-sm text-gray-600'>
                          Personal safety planning template
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='history' className='space-y-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Crisis Response History
                </h2>
                <Button className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Log Incident
                </Button>
              </div>

              <div className='space-y-4'>
                {recentCrises.length === 0 ? (
                  <Card>
                    <CardContent className='flex items-center justify-center py-8'>
                      <div className='text-center'>
                        <CheckCircle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-500'>
                          No crisis incidents recorded
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  recentCrises.map(crisis => (
                    <Card
                      key={crisis.id}
                      className='hover:shadow-md transition-shadow'
                    >
                      <CardHeader>
                        <div className='flex items-start justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 bg-primary/10 rounded-lg'>
                              <AlertTriangle className='h-5 w-5 text-primary' />
                            </div>
                            <div>
                              <CardTitle className='text-lg'>
                                {crisis.type} Crisis
                              </CardTitle>
                              <CardDescription>
                                Resident: {crisis.resident} • {crisis.timestamp}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={getStatusColor(crisis.status)}>
                            {crisis.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Responder
                              </span>
                              <div className='text-sm font-medium'>
                                {crisis.responder}
                              </div>
                            </div>
                            <div>
                              <span className='text-sm text-gray-600 dark:text-gray-400'>
                                Status
                              </span>
                              <div className='text-sm font-medium'>
                                {crisis.status}
                              </div>
                            </div>
                          </div>
                          <div>
                            <span className='text-sm text-gray-600 dark:text-gray-400'>
                              Outcome
                            </span>
                            <p className='text-sm mt-1'>{crisis.outcome}</p>
                          </div>
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
