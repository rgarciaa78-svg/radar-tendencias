import { useState, useMemo } from 'react';
import {
  Rocket, MapPin, Calendar, Lightbulb, Star, FileText,
  Search, TrendingUp, Package, Zap, ChevronRight, ArrowUpRight,
  Filter, SortAsc,
} from 'lucide-react';
import type { Launch } from '../types';
import { ScoreRing } from './ScoreRing';
import { LaunchModal } from './LaunchModal';
import { useTrendStore } from '../store/useTrendStore';

type BrandFilter = 'Todas' | 'TIGO' | 'B&D' | 'Straal';
type SortKey = 'score' | 'date' | 'brand';

const BRAND_COLORS: Record<string, { bg: string; text: string; border: string; pill: string; gradient: string; dot: string }> = {
  TIGO:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   pill: 'bg-blue-600 text-white',   gradient: 'from-blue-600 to-blue-800',   dot: 'bg-blue-500' },
  'B&D':  { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', pill: 'bg-violet-600 text-white', gradient: 'from-violet-600 to-violet-800', dot: 'bg-violet-500' },
  Straal: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', pill: 'bg-orange-500 text-white', gradient: 'from-orange-500 to-orange-700', dot: 'bg-orange-400' },
};

const REGION_FLAGS: Record<string, string> = {
  Europa: '🇪🇺', 'Estados Unidos': '🇺🇸', Asia: '🌏', Latam: '🌎', Global: '🌐',
};

const BRAND_TABS: BrandFilter[] = ['Todas', 'TIGO', 'B&D', 'Straal'];

const BRAND_TAB_ACTIVE: Record<string, string> = {
  Todas:  'bg-slate-800 text-white',
  TIGO:   'bg-blue-600 text-white',
  'B&D':  'bg-violet-600 text-white',
  Straal: 'bg-orange-500 text-white',
};
const BRAND_TAB_IDLE: Record<string, string> = {
  Todas:  'text-slate-600 hover:bg-slate-100',
  TIGO:   'text-blue-700 hover:bg-blue-50',
  'B&D':  'text-violet-700 hover:bg-violet-50',
  Straal: 'text-orange-700 hover:bg-orange-50',
};

function isNew(dateStr: string) {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  return d >= cutoff;
}

// ── HERO CARD (top scored launch) ──────────────────────────────────────────
function HeroLaunch({ item, onClick }: { item: Launch; onClick: () => void }) {
  const c = BRAND_COLORS[item.interestedBrand];
  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-br ${c.gradient} rounded-2xl p-6 text-white cursor-pointer hover:opacity-95 transition-opacity overflow-hidden`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full translate-y-20 -translate-x-20" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {item.interestedBrand}
              </span>
              <span className="bg-white/15 text-white/90 text-xs px-2 py-0.5 rounded-full">
                {item.category}
              </span>
              {isNew(item.launchDate) && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  NUEVO
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black leading-tight mb-1">{item.productName}</h2>
            <p className="text-white/75 text-sm font-medium">{item.company}</p>
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-5xl font-black leading-none">{item.score}</div>
            <div className="text-white/60 text-xs mt-1">score</div>
          </div>
        </div>

        <p className="text-white/85 text-sm leading-relaxed mb-4 line-clamp-2">{item.description}</p>

        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb size={12} className="text-yellow-300" />
            <span className="text-xs font-semibold text-yellow-200">Relevancia para Perú</span>
          </div>
          <p className="text-xs text-white/90 leading-relaxed line-clamp-2">{item.peruRelevance}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1"><MapPin size={11} />{item.market} {REGION_FLAGS[item.region]}</span>
            <span className="flex items-center gap-1"><Calendar size={11} />{item.launchDate.substring(0, 7)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 px-3 py-1.5 rounded-full">
            Ver brief completo <ArrowUpRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── FEATURED CARD (top 2-4) ─────────────────────────────────────────────────
function FeaturedCard({ item, rank, onClick }: { item: Launch; rank: number; onClick: () => void }) {
  const c = BRAND_COLORS[item.interestedBrand];
  return (
    <div
      onClick={onClick}
      className={`bg-white border-2 ${c.border} rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all flex flex-col relative`}
    >
      <div className={`absolute top-3 right-3 w-7 h-7 rounded-full ${c.dot} flex items-center justify-center text-white text-xs font-black`}>
        {rank}
      </div>

      <div className="flex items-start gap-3 mb-3 pr-8">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.pill}`}>{item.interestedBrand}</span>
            {isNew(item.launchDate) && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">NUEVO</span>
            )}
          </div>
          <h3 className="font-bold text-slate-800 text-sm leading-snug">{item.productName}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{item.company}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <MapPin size={10} />{item.market} {REGION_FLAGS[item.region]}
        </span>
        <div className={`text-2xl font-black ${c.text}`}>{item.score}</div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3 flex-1">{item.whatIsNew}</p>

      <div className={`flex items-center justify-between text-xs font-semibold ${c.text} ${c.bg} px-2.5 py-1.5 rounded-lg mt-auto`}>
        <span>{item.category}</span>
        {item.brief && <span className="flex items-center gap-1"><FileText size={10} />Brief</span>}
      </div>
    </div>
  );
}

// ── GRID CARD ───────────────────────────────────────────────────────────────
function GridCard({ item, onClick }: { item: Launch; onClick: () => void }) {
  const c = BRAND_COLORS[item.interestedBrand];
  return (
    <div
      onClick={onClick}
      className={`bg-white border ${c.border} rounded-xl hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden`}
    >
      {/* Color top bar */}
      <div className={`h-1 bg-gradient-to-r ${c.gradient}`} />

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.pill}`}>{item.interestedBrand}</span>
              {isNew(item.launchDate) && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">NUEVO</span>
              )}
            </div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug">{item.productName}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{item.company}</p>
          </div>
          <ScoreRing score={item.score} size={42} />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1"><MapPin size={10} />{item.market} {REGION_FLAGS[item.region]}</span>
          <span className="flex items-center gap-1"><Calendar size={10} />{item.launchDate.substring(0, 7)}</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-2">{item.description}</p>

        <div className={`${c.bg} rounded-lg p-2.5 mb-2.5`}>
          <div className="flex items-center gap-1 mb-1">
            <Star size={10} className="text-amber-500" />
            <span className={`text-xs font-semibold ${c.text}`}>Qué tiene de nuevo</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{item.whatIsNew}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-2.5 flex-1">
          <div className="flex items-center gap-1 mb-1">
            <Lightbulb size={10} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700">Para Perú</span>
          </div>
          <p className="text-xs text-green-800 leading-relaxed line-clamp-2">{item.peruRelevance}</p>
        </div>

        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">#{tag}</span>
            ))}
          </div>
          {item.brief && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${c.text} ${c.bg} border ${c.border} px-2 py-0.5 rounded-full flex-shrink-0`}>
              <FileText size={10} />Ver brief
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function Launches() {
  const { launches } = useTrendStore();
  const [brandFilter, setBrandFilter] = useState<BrandFilter>('Todas');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLaunch = launches.find((l) => l.id === selectedId) ?? null;

  const allSorted = useMemo(() => [...launches].sort((a, b) => b.score - a.score), [launches]);

  const filtered = useMemo(() => {
    let list = brandFilter === 'Todas' ? launches : launches.filter((l) => l.interestedBrand === brandFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.productName.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => {
      if (sortKey === 'score') return b.score - a.score;
      if (sortKey === 'date') return b.launchDate.localeCompare(a.launchDate);
      return a.interestedBrand.localeCompare(b.interestedBrand);
    });
  }, [launches, brandFilter, sortKey, search]);

  const counts = {
    Todas: launches.length,
    TIGO: launches.filter((l) => l.interestedBrand === 'TIGO').length,
    'B&D': launches.filter((l) => l.interestedBrand === 'B&D').length,
    Straal: launches.filter((l) => l.interestedBrand === 'Straal').length,
  };

  const newThisMonth = launches.filter((l) => isNew(l.launchDate)).length;
  const topLaunch = allSorted[0];
  const featured = allSorted.slice(1, 4);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">

      {/* ── PAGE HEADER ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Rocket size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Lanzamientos Globales</h1>
            <p className="text-sm text-slate-500">Productos lanzados en Europa, UK, EEUU y Asia — con brief de implementación para Perú</p>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total lanzamientos', value: launches.length, icon: Package, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Nuevos este período', value: newThisMonth, icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
          { label: 'Marcas cubiertas', value: 3, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Con brief incluido', value: launches.filter((l) => l.brief).length, icon: FileText, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`border rounded-xl px-4 py-3 flex items-center gap-3 ${bg}`}>
            <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center ${color} shadow-sm flex-shrink-0`}>
              <Icon size={18} />
            </div>
            <div>
              <div className={`text-2xl font-black ${color}`}>{value}</div>
              <div className="text-xs text-slate-500 leading-tight">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── HERO + FEATURED ROW ── */}
      {topLaunch && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-violet-500 rounded-full" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Top Lanzamiento</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <HeroLaunch item={topLaunch} onClick={() => setSelectedId(topLaunch.id)} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featured.map((item, i) => (
                <FeaturedCard key={item.id} item={item} rank={i + 2} onClick={() => setSelectedId(item.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER + SEARCH BAR ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 flex flex-wrap items-center gap-3">
        {/* Brand tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {BRAND_TABS.map((b) => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                brandFilter === b ? BRAND_TAB_ACTIVE[b] : BRAND_TAB_IDLE[b]
              }`}
            >
              {b}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${brandFilter === b ? 'bg-white/25' : 'bg-white text-slate-500'}`}>
                {counts[b as BrandFilter]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por producto, empresa, categoría…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SortAsc size={14} className="text-slate-400" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="score">Mayor relevancia</option>
            <option value="date">Más recientes</option>
            <option value="brand">Por marca</option>
          </select>
        </div>

        <div className="ml-auto text-xs text-slate-400">
          <span className="font-bold text-slate-700">{filtered.length}</span> lanzamientos
        </div>
      </div>

      {/* ── BRAND STRIPS ── */}
      {brandFilter === 'Todas' ? (
        <div className="space-y-8">
          {(['TIGO', 'B&D', 'Straal'] as const).map((brand) => {
            const brandLaunches = filtered.filter((l) => l.interestedBrand === brand);
            if (brandLaunches.length === 0) return null;
            const c = BRAND_COLORS[brand];
            return (
              <div key={brand}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-6 rounded-full bg-gradient-to-b ${c.gradient}`} />
                    <span className={`text-base font-black ${c.text}`}>{brand}</span>
                    <span className="text-xs text-slate-400 font-medium">
                      {brand === 'TIGO' ? '· Lácteos' : brand === 'B&D' ? '· Salsas y condimentos' : '· Nutrición deportiva'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.pill}`}>{brandLaunches.length}</span>
                  </div>
                  <button
                    onClick={() => setBrandFilter(brand)}
                    className={`text-xs ${c.text} flex items-center gap-1 hover:underline`}
                  >
                    Ver solo {brand} <ChevronRight size={12} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {brandLaunches.map((item) => (
                    <GridCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── SINGLE BRAND GRID ── */
        filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Filter size={32} className="mx-auto mb-3 opacity-40" />
            <div className="font-medium">Sin resultados para "{search}"</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <GridCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
            ))}
          </div>
        )
      )}

      {selectedLaunch && (
        <LaunchModal launch={selectedLaunch} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
