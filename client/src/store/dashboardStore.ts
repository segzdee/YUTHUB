import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardState {
  // Layout management
  layouts: DashboardLayout[];
  isGridLocked: boolean;

  // Widget visibility
  visibleWidgets: string[];

  // User preferences
  theme: 'light' | 'dark';
  refreshInterval: number;

  // Notification settings
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    types: string[];
  };

  // Actions
  setLayouts: (layouts: DashboardLayout[]) => void;
  toggleGridLock: () => void;
  toggleWidget: (widgetId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setRefreshInterval: (interval: number) => void;
  updateNotificationSettings: (
    settings: Partial<DashboardState['notifications']>
  ) => void;
  resetToDefault: () => void;
}

const defaultLayouts: DashboardLayout[] = [
  { i: 'metrics', x: 0, y: 0, w: 12, h: 2 },
  { i: 'overview', x: 0, y: 2, w: 4, h: 4 },
  { i: 'risk-assessment', x: 4, y: 2, w: 4, h: 4 },
  { i: 'financial-summary', x: 8, y: 2, w: 4, h: 4 },
  { i: 'occupancy-chart', x: 0, y: 6, w: 8, h: 4 },
  { i: 'activity-feed', x: 8, y: 6, w: 4, h: 4 },
  { i: 'occupancy-status', x: 0, y: 10, w: 6, h: 3 },
  { i: 'support-progress', x: 6, y: 10, w: 6, h: 3 },
];

const defaultVisibleWidgets = [
  'metrics',
  'overview',
  'risk-assessment',
  'financial-summary',
  'occupancy-chart',
  'activity-feed',
  'occupancy-status',
  'support-progress',
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      layouts: defaultLayouts,
      isGridLocked: false,
      visibleWidgets: defaultVisibleWidgets,
      theme: 'light',
      refreshInterval: 30000, // 30 seconds
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        types: ['incident', 'maintenance', 'financial', 'support'],
      },

      setLayouts: layouts => set({ layouts }),

      toggleGridLock: () =>
        set(state => ({ isGridLocked: !state.isGridLocked })),

      toggleWidget: widgetId =>
        set(state => ({
          visibleWidgets: state.visibleWidgets.includes(widgetId)
            ? state.visibleWidgets.filter(id => id !== widgetId)
            : [...state.visibleWidgets, widgetId],
        })),

      setTheme: theme => set({ theme }),

      setRefreshInterval: refreshInterval => set({ refreshInterval }),

      updateNotificationSettings: settings =>
        set(state => ({
          notifications: { ...state.notifications, ...settings },
        })),

      resetToDefault: () =>
        set({
          layouts: defaultLayouts,
          visibleWidgets: defaultVisibleWidgets,
          isGridLocked: false,
          refreshInterval: 30000,
        }),
    }),
    {
      name: 'dashboard-storage',
      partialize: state => ({
        layouts: state.layouts,
        visibleWidgets: state.visibleWidgets,
        theme: state.theme,
        refreshInterval: state.refreshInterval,
        notifications: state.notifications,
      }),
    }
  )
);
