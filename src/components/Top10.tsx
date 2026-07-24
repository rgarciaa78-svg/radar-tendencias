import { useTrendStore } from '../store/useTrendStore';
import { ScoreRing } from './ScoreRing';
import { BrandBadge, PriorityBadge, ComplexityBadge, StatusBadge } from './BadgePriority';
import { MapPin } from 'lucide-react';

export function Top10() {
  const { getTop10, setSelectedTrend } = useTrendStore();
  const top10 = getTop10();

  const MEDAL: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Top 10 Oportunidades para Perú</h2>
        <p className="text-slate-500 text-sm">Tendencias ordenadas por score de oportunidad (0–100)</p>
      </div>

      <div className="space-y-3">
        {top10.map((t, i) => (
          <div
            key={t.id}
            className="bg-white border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
            onClick={() => setSelectedTrend(t.id)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 text-center flex-shrink-0">
                {MEDAL[i] ? (
                  <span className="text-2xl">{MEDAL[i]}</span>
                ) : (
                  <span className="text-lg font-bold text-slate-400">#{i + 1}</span>
                )}
              </div>

              <ScoreRing score={t.score} size={52} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <BrandBadge value={t.brand} />
                  <PriorityBadge value={t.priority} />
                  <ComplexityBadge value={t.complexity} />
                  <StatusBadge value={t.status} />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{t.name}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {t.country}
                  </span>
                  <span>{t.category}</span>
                </div>
              </div>

              <div className="hidden lg:block max-w-xs flex-shrink-0">
                <div className="text-xs font-semibold text-blue-700 mb-1">Oportunidad Perú</div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{t.peruOpportunity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
