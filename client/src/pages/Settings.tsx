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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import AuthenticationSettings from '@/pages/Settings/Authentication';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Key,
  Users,
  Mail,
  Phone,
  Building,
  Save,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    incidents: true,
    reports: false,
    reminders: true,
  });

  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  const organizationSettings = {
    name: 'Youth Housing Solutions',
    email: 'admin@youthhousing.org',
    phone: '+44 20 7123 4567',
    address: '123 Support Street, London, UK',
    website: 'www.youthhousing.org',
    taxId: 'GB123456789',
    logo: '/logo.png',
  };

  const systemSettings = {
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    currency: 'GBP',
    language: 'en-GB',
    theme: 'light',
    autoBackup: true,
    dataRetention: '7 years',
    sessionTimeout: '30 minutes',
  };

  const securitySettings = {
    twoFactorAuth: false,
    passwordComplexity: 'medium',
    sessionSecurity: 'high',
    apiAccess: true,
    auditLogging: true,
    encryptionLevel: 'AES-256',
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              Settings
            </h1>
            <p className='text-gray-600 dark:text-gray-400'>
              Manage your account, organization, and system preferences
            </p>
          </div>

          <Tabs defaultValue='profile' className='space-y-6'>
            <TabsList className='grid w-full grid-cols-6'>
              <TabsTrigger value='profile'>Profile</TabsTrigger>
              <TabsTrigger value='organization'>Organization</TabsTrigger>
              <TabsTrigger value='notifications'>Notifications</TabsTrigger>
              <TabsTrigger value='authentication'>Authentication</TabsTrigger>
              <TabsTrigger value='security'>Security</TabsTrigger>
              <TabsTrigger value='system'>System</TabsTrigger>
            </TabsList>

            <TabsContent value='profile' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='firstName'>First Name</Label>
                      <Input
                        id='firstName'
                        value={user?.fullName?.split(' ')[0] || ''}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='lastName'>Last Name</Label>
                      <Input
                        id='lastName'
                        value={user?.fullName?.split(' ')[1] || ''}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email Address</Label>
                    <Input id='email' type='email' value={user?.email || ''} />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone Number</Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='+44 20 7123 4567'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='role'>Role</Label>
                    <Select defaultValue='admin'>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='admin'>Administrator</SelectItem>
                        <SelectItem value='manager'>Manager</SelectItem>
                        <SelectItem value='support'>Support Worker</SelectItem>
                        <SelectItem value='viewer'>Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='bio'>Bio</Label>
                    <Textarea
                      id='bio'
                      placeholder='Tell us about yourself...'
                    />
                  </div>

                  <Button className='flex items-center gap-2'>
                    <Save className='h-4 w-4' />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='organization' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Building className='h-5 w-5' />
                    Organization Details
                  </CardTitle>
                  <CardDescription>
                    Manage your organization's information
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='orgName'>Organization Name</Label>
                    <Input id='orgName' value={organizationSettings.name} />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='orgEmail'>Email</Label>
                      <Input
                        id='orgEmail'
                        type='email'
                        value={organizationSettings.email}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='orgPhone'>Phone</Label>
                      <Input
                        id='orgPhone'
                        type='tel'
                        value={organizationSettings.phone}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='orgAddress'>Address</Label>
                    <Textarea
                      id='orgAddress'
                      value={organizationSettings.address}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='website'>Website</Label>
                      <Input
                        id='website'
                        value={organizationSettings.website}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='taxId'>Tax ID</Label>
                      <Input id='taxId' value={organizationSettings.taxId} />
                    </div>
                  </div>

                  <Button className='flex items-center gap-2'>
                    <Save className='h-4 w-4' />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='notifications' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Bell className='h-5 w-5' />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='email-notifications'>
                          Email Notifications
                        </Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        id='email-notifications'
                        checked={notifications.email}
                        onCheckedChange={checked =>
                          handleNotificationChange('email', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='sms-notifications'>
                          SMS Notifications
                        </Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Receive notifications via SMS
                        </p>
                      </div>
                      <Switch
                        id='sms-notifications'
                        checked={notifications.sms}
                        onCheckedChange={checked =>
                          handleNotificationChange('sms', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='push-notifications'>
                          Push Notifications
                        </Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        id='push-notifications'
                        checked={notifications.push}
                        onCheckedChange={checked =>
                          handleNotificationChange('push', checked)
                        }
                      />
                    </div>

                    <Separator />

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='incident-notifications'>
                          Incident Alerts
                        </Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Get notified about safety incidents
                        </p>
                      </div>
                      <Switch
                        id='incident-notifications'
                        checked={notifications.incidents}
                        onCheckedChange={checked =>
                          handleNotificationChange('incidents', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='report-notifications'>
                          Report Notifications
                        </Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Get notified when reports are ready
                        </p>
                      </div>
                      <Switch
                        id='report-notifications'
                        checked={notifications.reports}
                        onCheckedChange={checked =>
                          handleNotificationChange('reports', checked)
                        }
                      />
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='reminder-notifications'>
                          Reminders
                        </Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Get reminders for important tasks
                        </p>
                      </div>
                      <Switch
                        id='reminder-notifications'
                        checked={notifications.reminders}
                        onCheckedChange={checked =>
                          handleNotificationChange('reminders', checked)
                        }
                      />
                    </div>
                  </div>

                  <Button className='flex items-center gap-2'>
                    <Save className='h-4 w-4' />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='authentication' className='space-y-6'>
              <AuthenticationSettings />
            </TabsContent>

            <TabsContent value='security' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='h-5 w-5' />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='two-factor'>
                          Two-Factor Authentication
                        </Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        id='two-factor'
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={() => {}}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='password-complexity'>
                        Password Complexity
                      </Label>
                      <div className='flex items-center gap-2'>
                        <Select
                          defaultValue={securitySettings.passwordComplexity}
                        >
                          <SelectTrigger className='w-40'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='low'>Low</SelectItem>
                            <SelectItem value='medium'>Medium</SelectItem>
                            <SelectItem value='high'>High</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge
                          className={getComplexityColor(
                            securitySettings.passwordComplexity
                          )}
                        >
                          {securitySettings.passwordComplexity}
                        </Badge>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='session-timeout'>Session Timeout</Label>
                      <Select defaultValue='30'>
                        <SelectTrigger className='w-40'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='15'>15 minutes</SelectItem>
                          <SelectItem value='30'>30 minutes</SelectItem>
                          <SelectItem value='60'>1 hour</SelectItem>
                          <SelectItem value='120'>2 hours</SelectItem>
                          <SelectItem value='480'>8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='space-y-0.5'>
                        <Label htmlFor='audit-logging'>Audit Logging</Label>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Log all user actions for security monitoring
                        </p>
                      </div>
                      <Switch
                        id='audit-logging'
                        checked={securitySettings.auditLogging}
                        onCheckedChange={() => {}}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='api-key'>API Key</Label>
                      <div className='flex items-center gap-2'>
                        <Input
                          id='api-key'
                          type={showApiKey ? 'text' : 'password'}
                          value='sk-1234567890abcdef'
                          readOnly
                          className='flex-1'
                        />
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                        <Button variant='outline' size='sm'>
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button className='flex items-center gap-2'>
                    <Save className='h-4 w-4' />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='system' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Database className='h-5 w-5' />
                    System Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure system-wide settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-2'>
                      <Label htmlFor='timezone'>Timezone</Label>
                      <Select defaultValue={systemSettings.timezone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Europe/London'>
                            Europe/London
                          </SelectItem>
                          <SelectItem value='America/New_York'>
                            America/New_York
                          </SelectItem>
                          <SelectItem value='Asia/Tokyo'>Asia/Tokyo</SelectItem>
                          <SelectItem value='Australia/Sydney'>
                            Australia/Sydney
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='date-format'>Date Format</Label>
                      <Select defaultValue={systemSettings.dateFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='DD/MM/YYYY'>DD/MM/YYYY</SelectItem>
                          <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY</SelectItem>
                          <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='currency'>Currency</Label>
                      <Select defaultValue={systemSettings.currency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='GBP'>GBP (£)</SelectItem>
                          <SelectItem value='USD'>USD ($)</SelectItem>
                          <SelectItem value='EUR'>EUR (€)</SelectItem>
                          <SelectItem value='CAD'>CAD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='language'>Language</Label>
                      <Select defaultValue={systemSettings.language}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='en-GB'>English (UK)</SelectItem>
                          <SelectItem value='en-US'>English (US)</SelectItem>
                          <SelectItem value='fr-FR'>French</SelectItem>
                          <SelectItem value='es-ES'>Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='theme'>Theme</Label>
                      <Select defaultValue={systemSettings.theme}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='light'>Light</SelectItem>
                          <SelectItem value='dark'>Dark</SelectItem>
                          <SelectItem value='system'>System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='data-retention'>Data Retention</Label>
                      <Select defaultValue={systemSettings.dataRetention}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='1 year'>1 year</SelectItem>
                          <SelectItem value='3 years'>3 years</SelectItem>
                          <SelectItem value='5 years'>5 years</SelectItem>
                          <SelectItem value='7 years'>7 years</SelectItem>
                          <SelectItem value='forever'>Forever</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='auto-backup'>Automatic Backup</Label>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        Automatically backup system data daily
                      </p>
                    </div>
                    <Switch
                      id='auto-backup'
                      checked={systemSettings.autoBackup}
                      onCheckedChange={() => {}}
                    />
                  </div>

                  <Button className='flex items-center gap-2'>
                    <Save className='h-4 w-4' />
                    Save System Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='integrations' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Globe className='h-5 w-5' />
                    Integrations
                  </CardTitle>
                  <CardDescription>
                    Connect with third-party services and tools
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-100 rounded-lg'>
                          <Mail className='h-5 w-5 text-blue-600' />
                        </div>
                        <div>
                          <h4 className='font-medium'>Email Provider</h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            SMTP configuration for email notifications
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge className='bg-green-100 text-green-800'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          Connected
                        </Badge>
                        <Button variant='outline' size='sm'>
                          Configure
                        </Button>
                      </div>
                    </div>

                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-green-100 rounded-lg'>
                          <Phone className='h-5 w-5 text-green-600' />
                        </div>
                        <div>
                          <h4 className='font-medium'>SMS Provider</h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Twilio integration for SMS notifications
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge className='bg-gray-100 text-gray-800'>
                          <AlertTriangle className='h-3 w-3 mr-1' />
                          Not Connected
                        </Badge>
                        <Button variant='outline' size='sm'>
                          Connect
                        </Button>
                      </div>
                    </div>

                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-purple-100 rounded-lg'>
                          <Database className='h-5 w-5 text-purple-600' />
                        </div>
                        <div>
                          <h4 className='font-medium'>External Database</h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            Connect to external data sources
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge className='bg-gray-100 text-gray-800'>
                          <AlertTriangle className='h-3 w-3 mr-1' />
                          Not Connected
                        </Badge>
                        <Button variant='outline' size='sm'>
                          Connect
                        </Button>
                      </div>
                    </div>

                    <div className='flex items-center justify-between p-4 border rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-yellow-100 rounded-lg'>
                          <Key className='h-5 w-5 text-yellow-600' />
                        </div>
                        <div>
                          <h4 className='font-medium'>API Access</h4>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            REST API for external integrations
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge className='bg-green-100 text-green-800'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          Active
                        </Badge>
                        <Button variant='outline' size='sm'>
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button className='flex items-center gap-2'>
                    <Plus className='h-4 w-4' />
                    Add Integration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
