import type { Trend } from '../types';
import { useTrendStore } from '../store/useTrendStore';

const COMPLEXITY_X: Record<string, number> = { Baja: 18, Media: 50, Alta: 82 };
const BRAND_COLOR: Record<string, { dot: string; ring: string }> = {
  TIGO:        { dot: 'bg-blue-500',   ring: 'ring-blue-300' },
  'B&D':       { dot: 'bg-violet-500', ring: 'ring-violet-300' },
  Straal:      { dot: 'bg-orange-400', ring: 'ring-orange-300' },
  'Nueva marca': { dot: 'bg-teal-500', ring: 'ring-teal-300' },
};

function getMomentumDot(detectedAt: string) {
  const days = Math.floor((Date.now() - new Date(detectedAt).getTime()) / 86_400_000);
  if (days <= 7)  return 'ring-4 ring-red-300 animate-pulse';
  if (days <= 30) return 'ring-2 ring-orange-300';
  return '';
}

interface DotProps { trend: Trend; onClick: () => void }

function Dot({ trend, onClick }: DotProps) {
  const x = COMPLEXITY_X[trend.complexity] ?? 50;
  const y = 95 - (trend.score / 100) * 85;
  const bc = BRAND_COLOR[trend.brand] ?? BRAND_COLOR['TIGO'];
  const momentum = getMomentumDot(trend.detectedAt);

  return (
    <button
      onClick={onClick}
      title={`${trend.name} · Score ${trend.score} · ${trend.complexity}`}
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
      className={`absolute w-4 h-4 rounded-full ${bc.dot} ${bc.ring} ${momentum} hover:scale-150 transition-transform z-10 focus:outline-none shadow-md`}
    />
  );
}

export function OpportunityMatrix() {
  const { trends, setSelectedTrend } = useTrendStore();
  const active = trends.filter((t) => t.status !== 'Descartada');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800">Matriz de Oportunidades</h3>
          <p className="text-xs text-slate-500 mt-0.5">Score (alto = mayor impacto) vs Complejidad de implementación · Click para abrir</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {Object.entries(BRAND_COLOR).slice(0, 3).map(([brand, { dot }]) => (
            <span key={brand} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${dot}`} />
              {brand}
            </span>
          ))}
        </div>
      </div>

      <div className="relative" style={{ paddingBottom: '52%' }}>
        {/* Grid background */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          {/* Quadrant backgrounds */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-green-50 border-r border-b border-slate-200" title="Alto impacto · Baja-Media complejidad" />
            <div className="bg-amber-50 border-b border-slate-200" title="Alto impacto · Alta complejidad" />
            <div className="bg-blue-50 border-r border-slate-200" title="Bajo impacto · Baja complejidad" />
            <div className="bg-slate-50" title="Bajo impacto · Alta complejidad" />
          </div>

          {/* Quadrant labels */}
          <div className="absolute top-2 left-2 text-xs font-bold text-green-600 opacity-60">✓ Lanzar ya</div>
          <div className="absolute top-2 right-2 text-xs font-bold text-amber-600 opacity-60 text-right">⚠ Evaluar esfuerzo</div>
          <div className="absolute bottom-2 left-2 text-xs font-bold text-blue-500 opacity-60">→ Backlog</div>
          <div className="absolute bottom-2 right-2 text-xs font-bold text-slate-400 opacity-60 text-right">✕ Descartar</div>

          {/* Grid lines */}
          <div className="absolute inset-0">
            <div className="absolute left-[33.3%] top-0 bottom-0 border-l border-dashed border-slate-300 opacity-40" />
            <div className="absolute left-[66.6%] top-0 bottom-0 border-l border-dashed border-slate-300 opacity-40" />
            <div className="absolute top-[50%] left-0 right-0 border-t border-dashed border-slate-300 opacity-40" />
          </div>

          {/* Dots */}
          {active.map((t) => (
            <Dot key={t.id} trend={t} onClick={() => setSelectedTrend(t.id)} />
          ))}
        </div>
      </div>

      {/* X Axis */}
      <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
        <span>← Baja complejidad</span>
        <span className="font-semibold text-slate-500">Complejidad de implementación</span>
        <span>Alta complejidad →</span>
      </div>
      <div className="text-xs text-slate-400 text-center mt-1">
        eje vertical: Score de oportunidad (arriba = más alto) · puntos parpadeantes = detectada esta semana
      </div>
    </div>
  );
}
