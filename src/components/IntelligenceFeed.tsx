import { useState, useMemo } from 'react';
import { ExternalLink, Search, BarChart2, TrendingUp, AlertTriangle, Users, Globe, Rocket } from 'lucide-react';
import { intelligenceFeed, type IntelType, type IntelItem } from '../data/intelligenceFeed';

// ── Type config ─────────────────────────────────────────────────────────────
const TYPE_META: Record<IntelType, { label: string; icon: typeof BarChart2; bg: string; text: string; border: string; dot: string }> = {
  estadistica: { label: 'Estadística',  icon: BarChart2,    bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  tendencia:   { label: 'Tendencia',    icon: TrendingUp,   bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  normativo:   { label: 'Normativo',    icon: AlertTriangle,bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500' },
  consumidor:  { label: 'Consumidor',   icon: Users,        bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  mercado:     { label: 'Mercado',      icon: Globe,        bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  dot: 'bg-amber-500' },
  lanzamiento: { label: 'Lanzamiento',  icon: Rocket,       bg: 'bg-pink-50',   text: 'text-pink-700',   border: 'border-pink-200',   dot: 'bg-pink-500' },
};

const BRAND_PILL: Record<string, string> = {
  TIGO:         'bg-blue-100 text-blue-700',
  'B&D':        'bg-violet-100 text-violet-700',
  Straal:       'bg-orange-100 text-orange-700',
  'Nueva marca':'bg-teal-100 text-teal-700',
  Todas:        'bg-slate-100 text-slate-600',
};

// ── Single Card ──────────────────────────────────────────────────────────────
function IntelCard({ item }: { item: IntelItem }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <div className={`bg-white border-l-4 ${meta.border.replace('border-', 'border-l-')} rounded-r-xl rounded-l-none border border-l-4 ${meta.border} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Stat highlight */}
          {item.stat && (
            <div className={`flex-shrink-0 ${meta.bg} ${meta.border} border rounded-xl px-3 py-2 text-center min-w-[72px]`}>
              <div className={`text-lg font-black leading-none ${meta.text}`}>{item.stat}</div>
              {item.statLabel && (
                <div className={`text-xs leading-tight mt-0.5 ${meta.text} opacity-70`}>{item.statLabel}</div>
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                <Icon size={10} />
                {meta.label}
              </span>
              <span className="text-xs text-slate-400">{item.region}</span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400">{item.date.substring(0, 7)}</span>
              {item.brandRelevance.filter(b => b !== 'Todas').map(b => (
                <span key={b} className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${BRAND_PILL[b]}`}>{b}</span>
              ))}
            </div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">{item.title}</h4>
          </div>
        </div>

        {/* Context */}
        <p className={`text-xs text-slate-600 leading-relaxed mb-3 ${expanded ? '' : 'line-clamp-3'}`}>
          {item.context}
        </p>

        {/* Implication box */}
        <div className={`${meta.bg} rounded-lg p-3 mb-3`}>
          <div className={`text-xs font-bold ${meta.text} mb-1`}>→ Implicación para tu negocio</div>
          <p className="text-xs text-slate-700 leading-relaxed">{item.implication}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {expanded ? 'Ver menos' : 'Leer más'}
            </button>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 text-xs font-semibold ${meta.text} hover:opacity-75 transition-opacity`}
            >
              <ExternalLink size={11} />
              {item.source.split(' — ')[0]}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function IntelligenceFeed() {
  const [activeType, setActiveType] = useState<IntelType | 'todos'>('todos');
  const [activeBrand, setActiveBrand] = useState<string>('Todas');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return intelligenceFeed.filter(item => {
      if (activeType !== 'todos' && item.type !== activeType) return false;
      if (activeBrand !== 'Todas' && !item.brandRelevance.includes(activeBrand as any) && !item.brandRelevance.includes('Todas')) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.context.toLowerCase().includes(q) ||
          item.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activeType, activeBrand, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: intelligenceFeed.length };
    intelligenceFeed.forEach(item => {
      c[item.type] = (c[item.type] ?? 0) + 1;
    });
    return c;
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-black text-slate-800 text-lg">Inteligencia de Mercado</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estadísticas reales · Tendencias globales · Normativos · Datos de consumidor · Lanzamientos clave
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-black text-slate-800">{filtered.length}</div>
          <div className="text-xs text-slate-400">señales activas</div>
        </div>
      </div>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setActiveType('todos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeType === 'todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Todos <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeType === 'todos' ? 'bg-white/25' : 'bg-white text-slate-500'}`}>{counts.todos}</span>
        </button>
        {(Object.entries(TYPE_META) as [IntelType, typeof TYPE_META[IntelType]][]).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeType === type
                  ? `${meta.bg} ${meta.text} ${meta.border}`
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon size={11} />
              {meta.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeType === type ? 'bg-white/40' : 'bg-slate-100 text-slate-400'}`}>
                {counts[type] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Brand + Search row */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {['Todas', 'TIGO', 'B&D', 'Straal', 'Nueva marca'].map(b => (
            <button
              key={b}
              onClick={() => setActiveBrand(b)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                activeBrand === b
                  ? b === 'TIGO' ? 'bg-blue-600 text-white'
                    : b === 'B&D' ? 'bg-violet-600 text-white'
                    : b === 'Straal' ? 'bg-orange-500 text-white'
                    : b === 'Nueva marca' ? 'bg-teal-500 text-white'
                    : 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar estadísticas, tendencias, regulaciones…"
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Search size={28} className="mx-auto mb-2 opacity-30" />
          <div className="font-medium">Sin resultados para "{search}"</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filtered.map(item => (
            <IntelCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
