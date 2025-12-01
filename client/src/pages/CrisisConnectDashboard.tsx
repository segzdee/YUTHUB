import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Phone,
  Shield,
  Clock,
  CheckCircle,
  Users,
  Activity,
  Bell,
  AlertCircle,
  Siren,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { AppPageLayout } from '@/components/PageLayout';

interface CrisisAlert {
  id: string;
  alert_reference: string;
  alert_type: string;
  alert_severity: string;
  location_description: string;
  property_id?: string;
  resident_id?: string;
  alert_description: string;
  status: string;
  activated_at: string;
  first_response_at?: string;
  resolved_at?: string;
  actions_taken?: string;
  reported_by_id: string;
}

interface OnCallStaff {
  id: string;
  staff_member_id: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  role_type: string;
  contact_phone: string;
  is_active: boolean;
  staff_member?: {
    first_name: string;
    last_name: string;
    staff_role: string;
  };
}

export default function CrisisConnectDashboard() {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<CrisisAlert | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [newAlertDialog, setNewAlertDialog] = useState(false);

  const { data: activeAlerts = [], isLoading: alertsLoading } = useQuery<CrisisAlert[]>({
    queryKey: ['/api/crisis-alerts/active'],
    refetchInterval: 5000,
  });

  const { data: alertHistory = [] } = useQuery<CrisisAlert[]>({
    queryKey: ['/api/crisis-alerts/history'],
    enabled: true,
  });

  const { data: onCallStaff = [] } = useQuery<OnCallStaff[]>({
    queryKey: ['/api/on-call-rota/current'],
    refetchInterval: 60000,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
  });

  const { data: residents = [] } = useQuery({
    queryKey: ['/api/residents'],
  });

  const { connected, connectionStatus } = useWebSocketConnection('/crisis-alerts');

  useEffect(() => {
    if (connected) {
      const handleCrisisUpdate = (data: any) => {
        queryClient.invalidateQueries({ queryKey: ['/api/crisis-alerts/active'] });
        queryClient.invalidateQueries({ queryKey: ['/api/crisis-alerts/history'] });

        if (data.type === 'new_alert') {
          toast.error(`NEW CRISIS ALERT: ${data.alert_type}`, {
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => setSelectedAlert(data.alert),
            },
          });

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Crisis Alert', {
              body: data.alert_description,
              icon: '/favicon.svg',
              tag: data.alert_reference,
            });
          }
        }
      };

      window.addEventListener('crisis:alert', handleCrisisUpdate as any);
      return () => window.removeEventListener('crisis:alert', handleCrisisUpdate as any);
    }
  }, [connected, queryClient]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const raiseAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      const response = await fetch('/api/crisis-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(alertData),
      });
      if (!response.ok) throw new Error('Failed to raise alert');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-alerts/active'] });
      toast.success('Crisis alert raised successfully');
      setNewAlertDialog(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to raise alert: ${error.message}`);
    },
  });

  const updateAlertStatusMutation = useMutation({
    mutationFn: async ({ alertId, status, notes }: { alertId: string; status: string; notes?: string }) => {
      const response = await fetch(`/api/crisis-alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error('Failed to update alert status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-alerts/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crisis-alerts/history'] });
      toast.success('Alert status updated');
      setSelectedAlert(null);
      setResponseNotes('');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const notifyEmergencyServicesMutation = useMutation({
    mutationFn: async ({ alertId, service }: { alertId: string; service: string }) => {
      const response = await fetch(`/api/crisis-alerts/${alertId}/notify-emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ service }),
      });
      if (!response.ok) throw new Error('Failed to notify emergency services');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Emergency services notified');
    },
  });

  const getAlertTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'medical_emergency': 'bg-red-500',
      'mental_health_crisis': 'bg-orange-500',
      'missing_person': 'bg-purple-500',
      'violence_incident': 'bg-red-600',
      'fire_emergency': 'bg-red-700',
      'security_breach': 'bg-yellow-600',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'responding':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'contained':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const criticalAlerts = activeAlerts.filter(a => a.status === 'active');
  const respondingAlerts = activeAlerts.filter(a => a.status === 'responding');

  return (
    <AppPageLayout>
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Crisis Connect
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              24/7 emergency response and crisis management system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={connected ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              <Activity className="h-3 w-3" />
              {connected ? 'Live' : 'Disconnected'}
            </Badge>
            <Dialog open={newAlertDialog} onOpenChange={setNewAlertDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="lg">
                  <Siren className="h-5 w-5 mr-2" />
                  Raise Crisis Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Raise New Crisis Alert</DialogTitle>
                  <DialogDescription>
                    This will immediately notify all on-call staff and create an active crisis response
                  </DialogDescription>
                </DialogHeader>
                <EmergencyAlertForm
                  properties={properties}
                  residents={residents}
                  onSubmit={(data) => raiseAlertMutation.mutate(data)}
                  isSubmitting={raiseAlertMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {criticalAlerts.length > 0 && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
            <Siren className="h-5 w-5 text-red-600 animate-pulse" />
            <AlertTitle className="text-red-900 dark:text-red-100">
              {criticalAlerts.length} Active Crisis {criticalAlerts.length === 1 ? 'Alert' : 'Alerts'}
            </AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-200">
              Immediate response required. All on-call staff have been notified.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalAlerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requiring immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Responding</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{respondingAlerts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Response in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Call Staff</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{onCallStaff.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available for emergency response
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Crisis Situations</CardTitle>
                <CardDescription>Real-time crisis alerts and responses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {alertsLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading alerts...</div>
                ) : activeAlerts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      No Active Crises
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      All situations are currently under control
                    </p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getAlertTypeColor(alert.alert_type)} text-white`}>
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">
                                {alert.alert_type.replace(/_/g, ' ').toUpperCase()}
                              </h4>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {alert.alert_reference}
                            </p>
                            <p className="text-gray-900 dark:text-white mb-3">
                              {alert.alert_description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(alert.activated_at)} - {formatDate(alert.activated_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                {alert.location_description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {alert.status === 'active' && (
                        <div className="mt-4 flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAlertStatusMutation.mutate({
                                alertId: alert.id,
                                status: 'responding',
                                notes: 'Response team dispatched',
                              });
                            }}
                          >
                            Start Response
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Contact emergency services (999)?')) {
                                notifyEmergencyServicesMutation.mutate({
                                  alertId: alert.id,
                                  service: '999',
                                });
                              }
                            }}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call 999
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Crisis History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertHistory.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{formatDate(alert.activated_at)}</Badge>
                        <div>
                          <p className="font-medium">
                            {alert.alert_type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.location_description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  On-Call Rota
                </CardTitle>
                <CardDescription>Current shift emergency contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {onCallStaff.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No staff currently on-call
                    </p>
                  ) : (
                    onCallStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">
                            {staff.staff_member?.first_name} {staff.staff_member?.last_name}
                          </p>
                          <Badge variant="secondary">{staff.role_type.replace(/_/g, ' ')}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${staff.contact_phone}`} className="hover:underline">
                            {staff.contact_phone}
                          </a>
                        </div>
                        <div className="text-xs text-gray-500">
                          {staff.shift_start_time} - {staff.shift_end_time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Protocols</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="tel:999">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Services (999)
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="tel:111">
                    <Phone className="h-4 w-4 mr-2" />
                    NHS 111
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Crisis Procedures
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedAlert && (
          <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Crisis Alert Details</DialogTitle>
                <DialogDescription>{selectedAlert.alert_reference}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alert Type</Label>
                    <p className="font-medium">{selectedAlert.alert_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedAlert.status)}>
                      {selectedAlert.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="font-medium">{selectedAlert.location_description}</p>
                  </div>
                  <div>
                    <Label>Time Activated</Label>
                    <p className="font-medium">
                      {formatTime(selectedAlert.activated_at)} on {formatDate(selectedAlert.activated_at)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {selectedAlert.alert_description}
                  </p>
                </div>

                {selectedAlert.actions_taken && (
                  <div>
                    <Label>Actions Taken</Label>
                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {selectedAlert.actions_taken}
                    </p>
                  </div>
                )}

                {selectedAlert.status !== 'resolved' && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="responseNotes">Response Notes</Label>
                      <Textarea
                        id="responseNotes"
                        value={responseNotes}
                        onChange={(e) => setResponseNotes(e.target.value)}
                        rows={4}
                        placeholder="Enter details of response actions..."
                      />
                    </div>

                    <div className="flex gap-2">
                      {selectedAlert.status === 'active' && (
                        <Button
                          onClick={() =>
                            updateAlertStatusMutation.mutate({
                              alertId: selectedAlert.id,
                              status: 'responding',
                              notes: responseNotes,
                            })
                          }
                        >
                          Mark as Responding
                        </Button>
                      )}
                      {selectedAlert.status === 'responding' && (
                        <Button
                          onClick={() =>
                            updateAlertStatusMutation.mutate({
                              alertId: selectedAlert.id,
                              status: 'contained',
                              notes: responseNotes,
                            })
                          }
                        >
                          Mark as Contained
                        </Button>
                      )}
                      {(selectedAlert.status === 'contained' || selectedAlert.status === 'responding') && (
                        <Button
                          variant="default"
                          onClick={() =>
                            updateAlertStatusMutation.mutate({
                              alertId: selectedAlert.id,
                              status: 'resolved',
                              notes: responseNotes,
                            })
                          }
                        >
                          Resolve Crisis
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </AppPageLayout>
  );
}

function EmergencyAlertForm({
  properties,
  residents,
  onSubmit,
  isSubmitting,
}: {
  properties: any[];
  residents: any[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState({
    alert_type: 'medical_emergency',
    location_description: '',
    property_id: '',
    resident_id: '',
    alert_description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="alert_type">Crisis Type *</Label>
        <Select
          value={formData.alert_type}
          onValueChange={(value) => setFormData({ ...formData, alert_type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="medical_emergency">Medical Emergency</SelectItem>
            <SelectItem value="mental_health_crisis">Mental Health Crisis</SelectItem>
            <SelectItem value="missing_person">Missing Person</SelectItem>
            <SelectItem value="violence_incident">Violence Incident</SelectItem>
            <SelectItem value="fire_emergency">Fire Emergency</SelectItem>
            <SelectItem value="security_breach">Security Breach</SelectItem>
            <SelectItem value="other_emergency">Other Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="property_id">Property</Label>
        <Select
          value={formData.property_id}
          onValueChange={(value) => setFormData({ ...formData, property_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.property_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="location_description">Location Description *</Label>
        <Input
          id="location_description"
          value={formData.location_description}
          onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
          placeholder="Specific location details..."
          required
        />
      </div>

      <div>
        <Label htmlFor="resident_id">Resident Involved (if applicable)</Label>
        <Select
          value={formData.resident_id}
          onValueChange={(value) => setFormData({ ...formData, resident_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select resident" />
          </SelectTrigger>
          <SelectContent>
            {residents.map((resident) => (
              <SelectItem key={resident.id} value={resident.id}>
                {resident.first_name} {resident.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="alert_description">Crisis Description *</Label>
        <Textarea
          id="alert_description"
          value={formData.alert_description}
          onChange={(e) => setFormData({ ...formData, alert_description: e.target.value })}
          rows={6}
          placeholder="Provide detailed description of the crisis situation..."
          required
        />
      </div>

      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-900">
          This will immediately notify all on-call staff and create an active crisis alert.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={isSubmitting}>
          {isSubmitting ? 'Raising Alert...' : 'Raise Crisis Alert'}
        </Button>
      </div>
    </form>
  );
}
