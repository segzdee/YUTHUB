import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AuthMethodManager from '@/components/Auth/AuthMethodManager';
import { Shield, Key, Users, AlertTriangle } from 'lucide-react';

export default function AuthenticationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Authentication & Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your authentication methods and security settings
        </p>
      </div>
      
      <Separator />
      
      <AuthMethodManager />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Features</span>
          </CardTitle>
          <CardDescription>
            Additional security options for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Coming Soon
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">Active Sessions</h4>
                <p className="text-sm text-gray-600">Manage your active login sessions</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Coming Soon
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="font-medium">Security Alerts</h4>
                <p className="text-sm text-gray-600">Get notified of suspicious activity</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Coming Soon
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}