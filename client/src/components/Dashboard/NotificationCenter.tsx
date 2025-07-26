import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Bell, Building, Calendar, DollarSign, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: 'incident' | 'maintenance' | 'financial' | 'support' | 'property' | 'billing';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch real-time notifications based on user role
  const { data: incidents = [] } = useQuery({ 
    queryKey: ['/api/incidents'],
    queryFn: () => apiRequest('/api/incidents'),
    enabled: !!user,
  });
  const { data: maintenance = [] } = useQuery({ 
    queryKey: ['/api/maintenance-requests'],
    queryFn: () => apiRequest('/api/maintenance-requests'),
    enabled: !!user,
  });
  const { data: financialRecords = [] } = useQuery({ 
    queryKey: ['/api/financial-records'],
    queryFn: () => apiRequest('/api/financial-records'),
    enabled: !!user,
  });
  const { data: supportPlans = [] } = useQuery({ 
    queryKey: ['/api/support-plans'],
    queryFn: () => apiRequest('/api/support-plans'),
    enabled: !!user,
  });

  // Generate role-based notifications
  useEffect(() => {
    if (!user) return;

    const newNotifications: Notification[] = [];
    const userRole = user.role || 'staff';

    // Calculate metrics
    const occupancyRate = 95; // Mock data
    const pendingMaintenance = maintenance.length;
    const highRiskResidents = incidents.filter(i => i.severity === 'high').length;
    const activeIncidents = incidents.filter(i => i.status === 'open').length;
    const overdueInvoices = financialRecords.filter(r => r.status === 'overdue').length;
    const pendingInvoices = financialRecords.filter(r => r.status === 'pending').length;

    // Housing Officer notifications
    if (userRole === 'housing_officer' || userRole === 'admin' || userRole === 'manager') {
      if (occupancyRate > 95) {
        newNotifications.push({
          id: 'occupancy-high',
          type: 'property',
          title: 'High Occupancy Alert',
          message: `Occupancy rate at ${occupancyRate}% - Consider additional capacity`,
          priority: 'high',
          timestamp: new Date(),
          read: false,
          actionUrl: '/housing',
        });
      }

      if (pendingMaintenance > 0) {
        newNotifications.push({
          id: 'maintenance-pending',
          type: 'maintenance',
          title: `${pendingMaintenance} Pending Maintenance`,
          message: 'Multiple maintenance requests require attention',
          priority: 'medium',
          timestamp: new Date(),
          read: false,
          actionUrl: '/housing',
        });
      }
    }

    // Support Coordinator notifications
    if (userRole === 'support_coordinator' || userRole === 'admin' || userRole === 'manager') {
      if (highRiskResidents > 0) {
        newNotifications.push({
          id: 'high-risk-residents',
          type: 'support',
          title: `${highRiskResidents} High Risk Residents`,
          message: 'Residents requiring immediate support attention',
          priority: 'urgent',
          timestamp: new Date(),
          read: false,
          actionUrl: '/support',
        });
      }

      if (activeIncidents > 0) {
        newNotifications.push({
          id: 'active-incidents',
          type: 'incident',
          title: `${activeIncidents} Active Incidents`,
          message: 'Safety incidents requiring follow-up',
          priority: 'high',
          timestamp: new Date(),
          read: false,
          actionUrl: '/safeguarding',
        });
      }
    }

    // Financial staff notifications
    if (userRole === 'finance_officer' || userRole === 'admin' || userRole === 'manager') {
      if (overdueInvoices > 0) {
        newNotifications.push({
          id: 'overdue-invoices',
          type: 'financial',
          title: `${overdueInvoices} Overdue Invoices`,
          message: 'Outstanding payments require follow-up',
          priority: 'high',
          timestamp: new Date(),
          read: false,
          actionUrl: '/billing',
        });
      }

      if (pendingInvoices > 5) {
        newNotifications.push({
          id: 'pending-invoices',
          type: 'billing',
          title: `${pendingInvoices} Pending Invoices`,
          message: 'Multiple invoices awaiting approval',
          priority: 'medium',
          timestamp: new Date(),
          read: false,
          actionUrl: '/billing',
        });
      }
    }

    setNotifications(newNotifications);
  }, [user, incidents, maintenance, financialRecords, supportPlans]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incident': return AlertTriangle;
      case 'maintenance': return Building;
      case 'financial': return DollarSign;
      case 'support': return Users;
      case 'property': return Building;
      case 'billing': return Calendar;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleNavigation = (url: string) => {
    onClose();
    window.location.href = url;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <Card className="absolute top-full right-0 mt-2 w-96 max-w-sm z-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle className="text-lg">Notifications</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                      notification.read ? 'border-gray-200' : getPriorityColor(notification.priority)
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        <Icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-medium text-sm ${
                            notification.read ? 'text-gray-600' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </p>
                          <Badge variant={getPriorityBadge(notification.priority)} className="text-xs">
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                          {notification.actionUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigation(notification.actionUrl!);
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}