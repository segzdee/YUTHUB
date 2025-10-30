import { create } from 'zustand';

interface DashboardStore {
  visibleWidgets: string[];
  isGridLocked: boolean;
  toggleWidget: (widgetId: string) => void;
  toggleGridLock: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  visibleWidgets: ['metrics', 'occupancy', 'activity', 'quick-actions', 'risk-insights', 'subscription'],
  isGridLocked: false,
  toggleWidget: (widgetId: string) =>
    set((state) => ({
      visibleWidgets: state.visibleWidgets.includes(widgetId)
        ? state.visibleWidgets.filter((id) => id !== widgetId)
        : [...state.visibleWidgets, widgetId],
    })),
  toggleGridLock: () => set((state) => ({ isGridLocked: !state.isGridLocked })),
}));
