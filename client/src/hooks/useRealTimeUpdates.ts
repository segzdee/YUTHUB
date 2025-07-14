import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DataIntegration } from '@/lib/dataIntegration';

export function useRealTimeUpdates() {
  const queryClient = useQueryClient();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const handleDataUpdate = (event: CustomEvent) => {
      const { entityType, action, entityId, timestamp } = event.detail;
      
      // Prevent duplicate updates
      const updateTime = new Date(timestamp).getTime();
      if (updateTime <= lastUpdateRef.current) return;
      lastUpdateRef.current = updateTime;

      // Invalidate related queries for cross-module updates
      DataIntegration.invalidateRelatedQueries(entityType, entityId);

      // Update dashboard metrics
      DataIntegration.updateDashboardMetrics();

      // Log the update for debugging
      // Real-time update: ${action} ${entityType} - ${entityId} at ${timestamp}
    };

    window.addEventListener('dataIntegrationUpdate', handleDataUpdate as EventListener);

    return () => {
      window.removeEventListener('dataIntegrationUpdate', handleDataUpdate as EventListener);
    };
  }, [queryClient]);

  return {
    triggerUpdate: (entityType: string, action: string, entityId?: number) => {
      DataIntegration.notifyModules(entityType, action, entityId);
    }
  };
}