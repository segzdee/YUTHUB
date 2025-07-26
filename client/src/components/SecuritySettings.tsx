import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, Eye, Key, Shield, Users, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function SecuritySettings() {
  const { toast } = useToast();
  const [mfaToken, setMfaToken] = useState('');

  // Fetch security settings with proper error handling
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ['/api/security/settings'],
    queryFn: () => apiRequest('/api/security/settings'),
    retry: false,
    onError: () => {
      // Provide fallback data for development
      return {
        mfaEnabled: false,
        role: 'staff',
        permissions: ['read_residents', 'write_incidents'],
      };
    },
  });

  // Fetch audit logs with fallback
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['/api/audit-logs'],
    queryFn: () => apiRequest('/api/audit-logs'),
    retry: false,
    onError: () => [],
  });

  // Fetch active sessions with fallback
  const { data: activeSessions = [] } = useQuery({
    queryKey: ['/api/security/sessions'],
    queryFn: () => apiRequest('/api/security/sessions'),
    retry: false,
    onError: () => [],
  });

  // MFA mutations with proper error handling
  const setupMfaMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/setup-mfa', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: "MFA Setup Initiated",
        description: "Please scan the QR code with your authenticator app and enter a verification code.",
      });
    },
    onError: (error) => {
      toast({
        title: "MFA Setup Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // MFA Verification mutation
  const verifyMfaMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest('POST', '/api/auth/verify-mfa', { token });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "MFA Enabled",
        description: "Two-factor authentication has been successfully enabled on your account.",
      });
      setMfaToken('');
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: "Invalid token. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disable MFA mutation
  const disableMfaMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/disable-mfa');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Disable MFA",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest('DELETE', `/api/security/sessions/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session Revoked",
        description: "The session has been successfully revoked.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Revoke Session",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  // Provide loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Provide fallback data if API fails
  const settings = securitySettings || {
    mfaEnabled: false,
    role: 'staff',
    permissions: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Security Settings</h1>
      </div>

      <Tabs defaultValue="authentication" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Multi-Factor Authentication</span>
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mfa-status">MFA Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {settings.mfaEnabled ? (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-red-500 text-red-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-x-2">
                  {!settings.mfaEnabled ? (
                    <Button
                      onClick={() => setupMfaMutation.mutate()}
                      loading={setupMfaMutation.isPending}
                    >
                      Setup MFA
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => disableMfaMutation.mutate()}
                      loading={disableMfaMutation.isPending}
                    >
                      Disable MFA
                    </Button>
                  )}
                </div>
              </div>

              {setupMfaMutation.data?.qrCode && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <div className="text-center">
                    <img 
                      src={`data:image/png;base64,${setupMfaMutation.data.qrCode}`} 
                      alt="MFA QR Code"
                      className="mx-auto mb-4"
                    />
                    <p className="text-sm text-muted-foreground">
                      Scan this QR code with your authenticator app, then enter the verification code below.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter verification code"
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      maxLength={6}
                    />
                    <Button
                      onClick={() => verifyMfaMutation.mutate(mfaToken)}
                      disabled={mfaToken.length !== 6}
                      loading={verifyMfaMutation.isPending}
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  We strongly recommend enabling MFA to protect your account from unauthorized access.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Security</CardTitle>
              <CardDescription>
                Password security requirements and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Minimum 8 characters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contains uppercase and lowercase letters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Contains numbers and special characters</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Account lockout after 5 failed attempts</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Active Sessions</span>
              </CardTitle>
              <CardDescription>
                Monitor and manage your active login sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions?.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.deviceInfo?.browser || 'Unknown'}</TableCell>
                      <TableCell>{session.deviceInfo?.location || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(session.lastActivity).toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={session.isActive ? "default" : "secondary"}>
                          {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeSessionMutation.mutate(session.id)}
                          loading={revokeSessionMutation.isPending}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Audit Logs</span>
              </CardTitle>
              <CardDescription>
                Review security events and access logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={log.riskLevel === 'high' ? 'destructive' : 
                                  log.riskLevel === 'medium' ? 'default' : 'secondary'}
                        >
                          {log.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.success ? 'default' : 'destructive'}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>
                View your current permissions and role assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-role">Current Role</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-sm">
                      {settings.role}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 space-y-2">
                    {settings.permissions?.map((permission: string) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{permission.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Contact your system administrator to modify role assignments or permissions.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}