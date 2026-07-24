import { LayoutDashboard, TrendingUp, Heart, Globe2, Rocket, ChevronRight, RefreshCw, Kanban } from 'lucide-react';
import { useTrendStore } from '../store/useTrendStore';

const nav = [
  { id: 'dashboard',    label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'pipeline',     label: 'Pipeline',            icon: Kanban },
  { id: 'lanzamientos', label: 'Lanzamientos',        icon: Rocket },
  { id: 'tendencias',   label: 'Tendencias',          icon: TrendingUp },
  { id: 'globales',     label: 'Señales Globales',    icon: Globe2 },
  { id: 'favoritos',    label: 'Favoritos',           icon: Heart },
] as const;

const BRAND_META: Record<string, { color: string; desc: string }> = {
  TIGO:           { color: 'bg-blue-500',   desc: 'Lácteos' },
  'B&D':          { color: 'bg-violet-500', desc: 'Salsas' },
  Straal:         { color: 'bg-orange-500', desc: 'Deporte' },
  'Nueva marca':  { color: 'bg-teal-500',   desc: 'Oportunidad' },
};

export function Sidebar() {
  const { activeView, setActiveView, trends, isUpdating, updateAvailable, syncTrends } = useTrendStore();
  const favCount = trends.filter((t) => t.isFavorite).length;

  return (
    <aside className="w-60 min-h-screen bg-slate-900 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp size={15} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm leading-tight">Radar de<br/>Tendencias</span>
        </div>
        <p className="text-slate-500 text-xs mt-2">Alimentos · Perú · 2026</p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={15} />
                {label}
              </span>
              <span className="flex items-center gap-1.5">
                {id === 'favoritos' && favCount > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-700 text-slate-400'}`}>
                    {favCount}
                  </span>
                )}
                {id === 'tendencias' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-700 text-slate-400'}`}>
                    {trends.length}
                  </span>
                )}
                <ChevronRight size={11} className="opacity-50" />
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <div className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider px-1">Marcas</div>
        {Object.entries(BRAND_META).map(([brand, meta]) => (
          <div key={brand} className="flex items-center justify-between py-1.5 px-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${meta.color}`} />
              <span className="text-slate-400 text-sm font-medium">{brand}</span>
              <span className="text-xs text-slate-600">{meta.desc}</span>
            </div>
            <span className="text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
              {trends.filter((t) => t.brand === brand).length}
            </span>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-700">
        <button
          onClick={() => syncTrends()}
          disabled={isUpdating}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            updateAvailable && !isUpdating
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : isUpdating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <RefreshCw size={13} className={isUpdating ? 'animate-spin' : ''} />
          {isUpdating ? 'Actualizando...' : updateAvailable ? 'Actualizar app' : 'Al día'}
        </button>
        {updateAvailable && !isUpdating && (
          <p className="text-xs text-green-400 text-center mt-1.5">3 nuevas tendencias disponibles</p>
        )}
      </div>
    </aside>
  );
}
