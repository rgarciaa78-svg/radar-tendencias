import { useState, useEffect } from 'react';
import { Download, Clock, RefreshCw } from 'lucide-react';
import './index.css';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { Launches } from './components/Launches';
import { TrendsList } from './components/TrendsList';
import { GlobalTrends } from './components/GlobalTrends';
import { Campaigns } from './components/Campaigns';
import { Proyectos } from './components/Proyectos';
import { TrendModal } from './components/TrendModal';
import { ExportModal } from './components/ExportModal';
import { useTrendStore } from './store/useTrendStore';

const VIEW_LABELS: Record<string, string> = {
  dashboard:    'Dashboard',
  lanzamientos: 'Lanzamientos',
  tendencias:   'Tendencias',
  globales:     'Señales Globales',
  favoritos:    'Favoritos',
  'campañas':   'Campañas Globales',
  proyectos:    'Proyectos I+D',
};

export default function App() {
  const { activeView, selectedTrendId, lastUpdated, isUpdating, checkAndAutoSync } = useTrendStore();
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    checkAndAutoSync();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar — solo visible en desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Logo solo en móvil */}
            <div className="md:hidden flex items-center gap-2 mr-1">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-black">R</span>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-800 truncate">
              {VIEW_LABELS[activeView] ?? activeView}
            </span>
            {isUpdating ? (
              <span className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full flex-shrink-0">
                <RefreshCw size={10} className="animate-spin" />
                <span className="hidden sm:inline">Actualizando…</span>
              </span>
            ) : (
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                <Clock size={10} />
                {lastUpdated}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex-shrink-0"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </header>

        {/* Main content — padding bottom en móvil para la barra inferior */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {activeView === 'dashboard'    && <Dashboard />}
          {activeView === 'lanzamientos' && <Launches />}
          {activeView === 'tendencias'   && <TrendsList />}
          {activeView === 'globales'     && <GlobalTrends />}
          {activeView === 'favoritos'    && <TrendsList onlyFavorites />}
          {activeView === 'campañas'     && <Campaigns />}
          {activeView === 'proyectos'    && <Proyectos />}
        </main>
      </div>

      {/* Bottom nav — solo en móvil */}
      <BottomNav />

      {selectedTrendId && <TrendModal />}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}
