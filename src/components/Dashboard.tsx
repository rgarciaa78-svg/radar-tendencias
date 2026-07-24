import { TrendingUp, Trophy, Globe, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { useTrendStore } from '../store/useTrendStore';
import { TrendCard } from './TrendCard';
import type { Region } from '../types';
import { BrandBadge, PriorityBadge } from './BadgePriority';
import { ScoreRing } from './ScoreRing';
import { OpportunityMatrix } from './OpportunityMatrix';
import { IntelligenceFeed } from './IntelligenceFeed';
import { LiveNewsFeed } from './LiveNewsFeed';

const REGIONS: Region[] = ['Europa', 'Estados Unidos', 'Asia', 'Latam', 'Global'];
const REGION_FLAGS: Record<Region, string> = {
  Europa: '🇪🇺', 'Estados Unidos': '🇺🇸', Asia: '🌏', Latam: '🌎', Global: '🌐',
};

export function Dashboard() {
  const { trends, setSelectedTrend, getTrendsByRegion, getTrendsByBrand } = useTrendStore();

  const top5 = [...trends].sort((a, b) => b.score - a.score).slice(0, 5);
  const featured = [...trends].sort((a, b) => b.score - a.score).slice(0, 4);
  const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

  const stats = [
    { label: 'Tendencias detectadas', value: trends.length, icon: TrendingUp, color: 'bg-blue-500', sub: 'en radar' },
    { label: 'Prioridad alta', value: trends.filter(t => t.priority === 'Alta').length, icon: AlertCircle, color: 'bg-red-500', sub: 'oportunidades urgentes' },
    { label: 'En pipeline', value: trends.filter(t => t.status === 'En prototipo' || t.status === 'Lista para lanzar').length, icon: CheckCircle, color: 'bg-green-500', sub: 'prototipo o listo' },
    { label: 'Favoritos', value: trends.filter(t => t.isFavorite).length, icon: Star, color: 'bg-amber-500', sub: 'guardados' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 md:space-y-7">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-slate-800 mb-0.5">Radar de Tendencias Alimentarias</h1>
        <p className="text-slate-500 text-xs md:text-sm">TIGO (lácteos) · B&D (salsas y condimentos) · Straal (deporte) · Perú · Mayo 2026</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 flex items-start gap-3">
            <div className={`${color} p-2 md:p-2.5 rounded-lg flex-shrink-0`}>
              <Icon size={15} className="text-white" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-xs font-semibold text-slate-700 leading-tight">{label}</div>
              <div className="text-xs text-slate-400 hidden sm:block">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content: featured + sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {/* Featured trends 2x2 */}
        <div className="md:col-span-2">
          <h2 className="font-semibold text-slate-700 text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-blue-500" />
            Tendencias destacadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featured.map((t) => <TrendCard key={t.id} trend={t} />)}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Top 5 */}
          <div>
            <h2 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Trophy size={15} className="text-amber-500" />
              Top 5 oportunidades Perú
            </h2>
            <div className="space-y-2">
              {top5.map((t, i) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTrend(t.id)}
                  className="bg-white border border-slate-200 rounded-xl p-3 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-sm font-bold text-amber-600 flex-shrink-0">
                    {MEDAL[i] ?? `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">{t.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <BrandBadge value={t.brand} />
                      <PriorityBadge value={t.priority} />
                    </div>
                  </div>
                  <ScoreRing score={t.score} size={34} />
                </div>
              ))}
            </div>
          </div>

          {/* Por región */}
          <div>
            <h2 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
              <Globe size={15} className="text-green-500" />
              Por región
            </h2>
            <div className="space-y-2">
              {REGIONS.map((region) => {
                const count = getTrendsByRegion(region).length;
                const pct = trends.length ? Math.round((count / trends.length) * 100) : 0;
                return (
                  <div key={region} className="flex items-center gap-2">
                    <span className="text-sm w-5 flex-shrink-0">{REGION_FLAGS[region]}</span>
                    <span className="text-xs text-slate-500 w-24 truncate">{region}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Por marca */}
          <div>
            <h2 className="font-semibold text-slate-700 text-sm mb-3">Por marca</h2>
            {(['TIGO', 'B&D', 'Straal', 'Nueva marca'] as const).map((brand) => {
              const bt = getTrendsByBrand(brand);
              const avg = bt.length ? Math.round(bt.reduce((s, t) => s + t.score, 0) / bt.length) : 0;
              return (
                <div key={brand} className="bg-white border border-slate-200 rounded-xl p-3 mb-2 flex items-center justify-between">
                  <div>
                    <BrandBadge value={brand} />
                    <div className="text-xs text-slate-400 mt-1">{bt.length} tendencias</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-700">{avg}</div>
                    <div className="text-xs text-slate-400">score prom.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matriz de Oportunidades */}
      <div className="mt-6">
        <OpportunityMatrix />
      </div>

      {/* Feed de Inteligencia de Mercado */}
      <div className="mt-6">
        <IntelligenceFeed />
      </div>

      {/* Noticias en Vivo — RSS en tiempo real */}
      <div className="mt-6">
        <LiveNewsFeed />
      </div>
    </div>
  );
}
