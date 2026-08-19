import { Globe2, TrendingUp, Minus, MapPin, BookOpen, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { useTrendStore } from '../store/useTrendStore';
import type { GlobalSignal } from '../types';

type BrandFilter = 'Todas' | 'TIGO' | 'Straal' | 'B&D';

const BRAND_FILTERS: BrandFilter[] = ['Todas', 'TIGO', 'Straal', 'B&D'];

const BRAND_STYLES: Record<string, { active: string; dot: string }> = {
  Todas:  { active: 'bg-slate-800 text-white', dot: 'bg-slate-400' },
  TIGO:   { active: 'bg-blue-600 text-white',  dot: 'bg-blue-500' },
  Straal: { active: 'bg-orange-500 text-white', dot: 'bg-orange-500' },
  'B&D':  { active: 'bg-violet-600 text-white', dot: 'bg-violet-500' },
};

const BRAND_INACTIVE: Record<string, string> = {
  Todas:  'border-slate-200 text-slate-600 hover:border-slate-400',
  TIGO:   'border-blue-200 text-blue-700 hover:border-blue-400',
  Straal: 'border-orange-200 text-orange-700 hover:border-orange-400',
  'B&D':  'border-violet-200 text-violet-700 hover:border-violet-400',
};

const IMPACT_STYLES: Record<string, string> = {
  Alto:  'bg-red-100 text-red-700',
  Medio: 'bg-amber-100 text-amber-700',
  Bajo:  'bg-slate-100 text-slate-600',
};

const REGION_FLAGS: Record<string, string> = {
  Europa: '🇪🇺',
  'Estados Unidos': '🇺🇸',
  Asia: '🌏',
  Latam: '🌎',
  Global: '🌐',
  'Reino Unido': '🇬🇧',
};

const SIGNAL_CARD_COLORS: Record<string, { border: string; bg: string; title: string; badge: string }> = {
  TIGO:   { border: 'border-blue-200',   bg: 'bg-blue-50',   title: 'text-blue-900',  badge: 'bg-blue-600 text-white' },
  Straal: { border: 'border-orange-200', bg: 'bg-orange-50', title: 'text-orange-900', badge: 'bg-orange-500 text-white' },
  'B&D':  { border: 'border-violet-200', bg: 'bg-violet-50', title: 'text-violet-900', badge: 'bg-violet-600 text-white' },
  Global: { border: 'border-slate-200',  bg: 'bg-slate-50',  title: 'text-slate-800',  badge: 'bg-slate-700 text-white' },
};

function ImpactIcon({ impact }: { impact: string }) {
  if (impact === 'Alto') return <TrendingUp size={12} />;
  return <Minus size={12} />;
}

function SignalCard({ signal }: { signal: GlobalSignal }) {
  const [expanded, setExpanded] = useState(false);
  const c = SIGNAL_CARD_COLORS[signal.brand] ?? SIGNAL_CARD_COLORS.Global;

  return (
    <div className={`border ${c.border} ${c.bg} rounded-xl p-4 transition-all`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{signal.brand}</span>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${IMPACT_STYLES[signal.impact]}`}>
            <ImpactIcon impact={signal.impact} />
            Impacto {signal.impact}
          </span>
        </div>
        <span className="text-xs text-slate-400 whitespace-nowrap">{signal.date}</span>
      </div>

      {/* Country + region */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
        <MapPin size={11} />
        <span>{signal.country}</span>
        <span className="text-slate-300">·</span>
        <span>{REGION_FLAGS[signal.country] ?? REGION_FLAGS[signal.region] ?? ''} {signal.region}</span>
        <span className="text-slate-300">·</span>
        <span>{signal.category}</span>
      </div>

      {/* Headline */}
      <h4 className={`font-semibold text-sm ${c.title} leading-snug mb-3`}>{signal.headline}</h4>

      {/* Context - collapsible */}
      <div className={`text-xs text-slate-600 leading-relaxed mb-3 ${expanded ? '' : 'line-clamp-3'}`}>
        {signal.context}
      </div>

      {/* Peru novelty */}
      <div className="bg-white/80 border border-green-200 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Lightbulb size={12} className="text-green-600" />
          <span className="text-xs font-semibold text-green-700">Novedad para Perú</span>
        </div>
        <p className={`text-xs text-green-800 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {signal.peruNovelty}
        </p>
      </div>

      {/* Tags + expand */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {signal.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-white/70 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <BookOpen size={11} />
            {signal.source.split('/')[0].trim()}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-600 hover:underline whitespace-nowrap"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GlobalTrends() {
  const { signals } = useTrendStore();
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('Todas');

  const IMPACT_ORDER = { 'Alto': 0, 'Medio': 1, 'Bajo': 2 };
  const filtered = [...(brandFilter === 'Todas' ? signals : signals.filter((s) => s.brand === brandFilter))].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);

  const counts: Record<string, number> = { Todas: signals.length, TIGO: 0, Straal: 0, 'B&D': 0 };
  signals.forEach((s) => { if (s.brand in counts) counts[s.brand]++; });

  const highImpact = filtered.filter((s) => s.impact === 'Alto').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Globe2 size={20} className="text-blue-500" />
          Tendencias Globales
        </h2>
        <p className="text-slate-500 text-sm">
          Señales de <strong>Reino Unido, Estados Unidos y Europa</strong> sobre clean label y salud en FMCG — novedades aún sin explotar en Perú
        </p>
      </div>

      {/* Brand filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {BRAND_FILTERS.map((b) => {
          const isActive = brandFilter === b;
          const s = BRAND_STYLES[b];
          return (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                isActive ? `${s.active} border-transparent shadow-sm` : `bg-white ${BRAND_INACTIVE[b]}`
              }`}
            >
              {b !== 'Todas' && (
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              )}
              {b}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {counts[b] ?? 0}
              </span>
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-4 text-sm text-slate-500">
          <span><span className="font-bold text-slate-700">{filtered.length}</span> señales</span>
          <span><span className="font-bold text-red-600">{highImpact}</span> alto impacto</span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="bg-slate-800 rounded-xl px-5 py-4 mb-6 flex items-center gap-6 text-sm">
        <Globe2 size={20} className="text-blue-400 flex-shrink-0" />
        <p className="text-slate-300 flex-1">
          Todas las señales provienen de <span className="text-white font-semibold">Reino Unido, Estados Unidos y Europa</span>.
          Ninguna de estas tendencias de <span className="text-white font-semibold">clean label y salud</span> tiene competidor activo en el mercado peruano hoy.
        </p>
        <div className="flex gap-4 flex-shrink-0">
          {['TIGO', 'Straal', 'B&D'].map((brand) => (
            <div key={brand} className="text-center">
              <div className="text-lg font-bold text-white">{counts[brand] ?? 0}</div>
              <div className="text-xs text-slate-400">{brand}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-medium">Sin señales para este filtro</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
}
