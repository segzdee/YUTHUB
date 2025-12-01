import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Sparkles, X, ExternalLink } from 'lucide-react';

interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  description: string;
  items: string[];
  link?: string;
}

const CURRENT_VERSION = '1.0.0';

const CHANGELOG: ChangelogItem[] = [
  {
    version: '1.0.0',
    date: '2025-12-01',
    title: 'Platform Launch',
    description: 'Welcome to YUTHUB - Your complete youth housing management platform',
    items: [
      'Complete resident intake and management system',
      'Property registration and room allocation',
      'Safeguarding and compliance tracking',
      'Progress monitoring and support plans',
      'Financial management and billing',
      'Real-time analytics and reporting',
      'Multi-tenant organization support',
      'Team collaboration features',
    ],
    link: '/features',
  },
];

export function WhatsNewNotification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);

  const { data: lastSeenVersion } = useQuery({
    queryKey: ['user-last-seen-version', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data } = await supabase
        .from('users')
        .select('last_seen_version')
        .eq('id', user.id)
        .single();

      return data?.last_seen_version || null;
    },
    enabled: !!user?.id,
  });

  const updateLastSeenVersionMutation = useMutation({
    mutationFn: async (version: string) => {
      if (!user?.id) throw new Error('No user');

      const { error } = await supabase
        .from('users')
        .update({
          last_seen_version: version,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-last-seen-version'] });
      setDismissed(true);
    },
  });

  const handleDismiss = () => {
    updateLastSeenVersionMutation.mutate(CURRENT_VERSION);
  };

  if (!user || dismissed || lastSeenVersion === CURRENT_VERSION) {
    return null;
  }

  const latestChangelog = CHANGELOG[0];
  const hasNewFeatures = !lastSeenVersion || lastSeenVersion !== CURRENT_VERSION;

  if (!hasNewFeatures) return null;

  return (
    <Alert className="mb-6 border-purple-200 bg-purple-50 dark:bg-purple-950/20">
      <Sparkles className="h-4 w-4 text-purple-600" />
      <AlertTitle className="text-purple-900 dark:text-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>What's New in YUTHUB</span>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
            v{latestChangelog.version}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-purple-800 dark:text-purple-200">
        <div className="mt-2 space-y-3">
          <p className="font-medium">{latestChangelog.title}</p>
          <p className="text-sm">{latestChangelog.description}</p>

          <div className="space-y-1">
            <p className="text-sm font-medium">New features and improvements:</p>
            <ul className="text-sm space-y-1 pl-4">
              {latestChangelog.items.slice(0, 4).map((item, index) => (
                <li key={index} className="list-disc">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {latestChangelog.link && (
              <Button
                size="sm"
                variant="outline"
                className="text-purple-700 dark:text-purple-200 border-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900"
                onClick={() => window.location.href = latestChangelog.link!}
              >
                Learn More
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-purple-700 dark:text-purple-200"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
