import React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// This component provides comprehensive loading states for pages
// Consolidated from multiple loading components to reduce duplication

interface PageLoaderProps {
  title?: string;
  description?: string;
  showTabs?: boolean;
  tabCount?: number;
  cardCount?: number;
  showMetrics?: boolean;
  message?: string;
}

export default function PageLoader({
  showTabs = false,
  tabCount = 3,
  cardCount = 4,
  showMetrics = false,
  message = 'Loading...',
}: PageLoaderProps) {
  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Metrics Cards */}
      {showMetrics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-8 w-12' />
                  </div>
                  <Skeleton className='h-12 w-12 rounded-md' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs */}
      {showTabs && (
        <Tabs defaultValue='tab1' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            {[...Array(tabCount)].map((_, i) => (
              <TabsTrigger key={i} value={`tab${i + 1}`} disabled>
                <Skeleton className='h-4 w-16' />
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='tab1' className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[...Array(cardCount)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div className='space-y-2'>
                        <Skeleton className='h-5 w-32' />
                        <Skeleton className='h-4 w-24' />
                      </div>
                      <Skeleton className='h-6 w-16 rounded-full' />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-4 w-1/2' />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Simple Card Grid */}
      {!showTabs && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(cardCount)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <div className='space-y-2'>
                    <Skeleton className='h-5 w-32' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-6 w-16 rounded-full' />
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-4 w-1/2' />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Loader */}
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-blue-600' />
          <p className='mt-4 text-gray-600'>{message}</p>
        </div>
      </div>
    </div>
  );
}

export function ComponentLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className='flex items-center justify-center p-8'>
      <div className='text-center'>
        <Loader2 className='h-6 w-6 animate-spin mx-auto text-blue-600' />
        <p className='mt-2 text-sm text-gray-600'>{message}</p>
      </div>
    </div>
  );
}

export function InlineLoader() {
  return <Loader2 className='h-4 w-4 animate-spin' />;
}
