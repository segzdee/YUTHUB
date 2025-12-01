import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardStore {
  visibleWidgets: string[];
  isGridLocked: boolean;
  toggleWidget: (widgetId: string) => void;
  toggleGridLock: () => void;
  resetWidgets: () => void;
}

const defaultWidgets = [
  'metrics',
  'overview',
  'risk-assessment',
  'financial-summary',
  'occupancy-chart',
  'activity-feed',
  'occupancy-status',
  'support-progress'
];

export const useDashboardStore = create<DashboardStore>(
  persist(
    (set) => ({
      visibleWidgets: defaultWidgets,
      isGridLocked: false,
      toggleWidget: (widgetId: string) =>
        set((state) => ({
          visibleWidgets: state.visibleWidgets.includes(widgetId)
            ? state.visibleWidgets.filter((id) => id !== widgetId)
            : [...state.visibleWidgets, widgetId],
        })),
      toggleGridLock: () => set((state) => ({ isGridLocked: !state.isGridLocked })),
      resetWidgets: () => set({ visibleWidgets: defaultWidgets, isGridLocked: false }),
    }),
    {
      name: 'dashboard-storage',
    }
  )
);
