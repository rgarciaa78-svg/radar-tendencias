import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trend, Launch, Region, Brand, Category, Status, Priority, GlobalSignal } from '../types';
import { initialTrends } from '../data/trends';
import { launches as initialLaunches } from '../data/launches';
import { globalSignals } from '../data/globalSignals';
import { newTrendsBatch1 } from '../data/newTrends';
import { newLaunchesBatch1 } from '../data/newLaunchesBatch1';
import { autoTrends } from '../data/autoTrends';

interface Filters {
  region: Region | 'Todas';
  brand: Brand | 'Todas';
  category: Category | 'Todas';
  priority: Priority | 'Todas';
  status: Status | 'Todas';
  search: string;
  onlyFavorites: boolean;
}

type ActiveView = 'dashboard' | 'lanzamientos' | 'tendencias' | 'globales' | 'favoritos' | 'pipeline' | 'campañas';

interface TrendStore {
  trends: Trend[];
  launches: Launch[];
  signals: GlobalSignal[];
  filters: Filters;
  activeView: ActiveView;
  selectedTrendId: string | null;
  lastUpdated: string;
  lastLaunchSync: string;
  isUpdating: boolean;
  updateAvailable: boolean;

  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setActiveView: (view: ActiveView) => void;
  setSelectedTrend: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  updateStatus: (id: string, status: Status) => void;
  updateNotes: (id: string, notes: string) => void;
  syncTrends: () => Promise<void>;
  syncLaunches: () => Promise<void>;
  checkAndAutoSync: () => void;
  getFilteredTrends: () => Trend[];
  getTop10: () => Trend[];
  getTrendsByRegion: (region: Region) => Trend[];
  getTrendsByBrand: (brand: Brand) => Trend[];
}

const defaultFilters: Filters = {
  region: 'Todas',
  brand: 'Todas',
  category: 'Todas',
  priority: 'Todas',
  status: 'Todas',
  search: '',
  onlyFavorites: false,
};

const todayStr = () => new Date().toISOString().split('T')[0];

export const useTrendStore = create<TrendStore>()(
  persist(
    (set, get) => ({
      trends: [...autoTrends, ...initialTrends],
      launches: initialLaunches,
      signals: globalSignals,
      filters: defaultFilters,
      activeView: 'dashboard',
      selectedTrendId: null,
      lastUpdated: '2026-05-17',
      lastLaunchSync: '2026-05-17',
      isUpdating: false,
      updateAvailable: true,

      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),

      resetFilters: () => set({ filters: defaultFilters }),

      setActiveView: (view) => set({ activeView: view }),

      setSelectedTrend: (id) => set({ selectedTrendId: id }),

      toggleFavorite: (id) =>
        set((state) => ({
          trends: state.trends.map((t) =>
            t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
          ),
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          trends: state.trends.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),

      updateNotes: (id, notes) =>
        set((state) => ({
          trends: state.trends.map((t) =>
            t.id === id ? { ...t, notes } : t
          ),
        })),

      syncTrends: async () => {
        set({ isUpdating: true });
        await new Promise((r) => setTimeout(r, 2200));
        set((state) => {
          const existingIds = new Set(state.trends.map((t) => t.id));
          const fresh = newTrendsBatch1.filter((t) => !existingIds.has(t.id));
          return {
            trends: [...fresh, ...state.trends],
            isUpdating: false,
            updateAvailable: false,
            lastUpdated: todayStr(),
          };
        });
      },

      syncLaunches: async () => {
        set({ isUpdating: true });
        await new Promise((r) => setTimeout(r, 1800));
        set((state) => {
          const existingIds = new Set(state.launches.map((l) => l.id));
          const fresh = newLaunchesBatch1.filter((l) => !existingIds.has(l.id));
          return {
            launches: [...fresh, ...state.launches],
            isUpdating: false,
            lastLaunchSync: todayStr(),
          };
        });
      },

      checkAndAutoSync: () => {
        const { lastUpdated, lastLaunchSync, isUpdating, syncTrends, syncLaunches } = get();
        const now = todayStr();
        if (isUpdating) return;
        if (lastUpdated < now) syncTrends();
        if (lastLaunchSync < now) syncLaunches();
      },

      getFilteredTrends: () => {
        const { trends, filters } = get();
        return [...trends]
          .filter((t) => {
            if (filters.region !== 'Todas' && t.region !== filters.region) return false;
            if (filters.brand !== 'Todas' && t.brand !== filters.brand) return false;
            if (filters.category !== 'Todas' && t.category !== filters.category) return false;
            if (filters.priority !== 'Todas' && t.priority !== filters.priority) return false;
            if (filters.status !== 'Todas' && t.status !== filters.status) return false;
            if (filters.onlyFavorites && !t.isFavorite) return false;
            if (
              filters.search &&
              !t.name.toLowerCase().includes(filters.search.toLowerCase()) &&
              !t.category.toLowerCase().includes(filters.search.toLowerCase()) &&
              !t.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))
            )
              return false;
            return true;
          })
          .sort((a, b) => b.score - a.score);
      },

      getTop10: () => {
        const { trends } = get();
        return [...trends].sort((a, b) => b.score - a.score).slice(0, 10);
      },

      getTrendsByRegion: (region) => {
        const { trends } = get();
        return trends.filter((t) => t.region === region);
      },

      getTrendsByBrand: (brand) => {
        const { trends } = get();
        return trends.filter((t) => t.brand === brand);
      },
    }),
    {
      name: 'radar-tendencias-v9',
      partialize: (state) => ({
        trends: state.trends,
        launches: state.launches,
        lastUpdated: state.lastUpdated,
        lastLaunchSync: state.lastLaunchSync,
        updateAvailable: state.updateAvailable,
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        // Siempre incluir autoTrends nuevas que no estén en el estado guardado
        trends: (() => {
          const savedIds = new Set((persisted as any)?.trends?.map((t: any) => t.id) ?? []);
          const freshAuto = autoTrends.filter(t => !savedIds.has(t.id));
          return [...freshAuto, ...((persisted as any)?.trends ?? current.trends)];
        })(),
      }),
    }
  )
);
