import { useState } from 'react';
import { ExternalLink, TrendingUp, Globe, Search } from 'lucide-react';
import { campaigns, type CampaignType, type CampaignRegion } from '../data/campaigns';

const TYPES: (CampaignType | 'Todas')[] = ['Todas', 'Viral redes', 'Packaging', 'Colaboración', 'Causa social', 'Lanzamiento', 'Guerrilla'];
const REGIONS: (CampaignRegion | 'Todas')[] = ['Todas', 'EEUU', 'Europa', 'Global'];

const TYPE_COLORS: Record<CampaignType, string> = {
  'Viral redes':  'bg-pink-100 text-pink-700',
  'Packaging':    'bg-violet-100 text-violet-700',
  'Colaboración': 'bg-blue-100 text-blue-700',
  'Causa social': 'bg-green-100 text-green-700',
  'Lanzamiento':  'bg-orange-100 text-orange-700',
  'Guerrilla':    'bg-red-100 text-red-700',
};

const LIVE_SEARCHES = [
  { label: '🏆 Cannes Lions Food', url: 'https://www.google.com/search?q=Cannes+Lions+food+beverage+campaign+winner+2024+2025' },
  { label: '📰 AdWeek Food Brands', url: 'https://www.google.com/search?q=AdWeek+best+food+brand+campaign+2024+2025' },
  { label: '▶️ Ads virales en YouTube', url: 'https://www.youtube.com/results?search_query=best+food+brand+commercial+viral+2024+2025' },
  { label: '🎵 TikTok food campaigns', url: 'https://www.google.com/search?q=viral+food+brand+tiktok+campaign+USA+Europe+2025&tbm=vid' },
  { label: '🏅 Fast Company food innovators', url: 'https://www.google.com/search?q=Fast+Company+most+innovative+food+company+2025' },
  { label: '🌍 Effie Awards food', url: 'https://www.google.com/search?q=Effie+Awards+food+beverage+winner+2024+2025' },
];

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 90 ? 'bg-green-500' : score >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 font-medium">{score}</span>
    </div>
  );
}

export function Campaigns() {
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'Todas'>('Todas');
  const [regionFilter, setRegionFilter] = useState<CampaignRegion | 'Todas'>('Todas');
  const [search, setSearch] = useState('');

  const filtered = campaigns.filter((c) => {
    if (typeFilter !== 'Todas' && c.type !== typeFilter) return false;
    if (regionFilter !== 'Todas' && c.region !== regionFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.brand.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 mb-1">Campañas disruptivas globales</h1>
          <p className="text-slate-500 text-sm">Alimentos y bebidas · EEUU y Europa · 2024–2025 · Adaptables a Perú</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-full flex-shrink-0">
          <Globe size={11} />
          {campaigns.length} campañas
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar marca o campaña..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              typeFilter === t
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
        <div className="w-px bg-slate-200 mx-1" />
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegionFilter(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              regionFilter === r
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-4">{filtered.length} campañas encontradas</p>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
            {/* Card header */}
            <div className="p-4 pb-3">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-slate-600">{c.brand.slice(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{c.country} · {c.year}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[c.type]}`}>{c.type}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{c.title}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">{c.what}</p>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={10} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Oportunidad para Perú</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{c.peruOpportunity}</p>
              </div>
            </div>

            {/* Card footer */}
            <div className="px-4 pb-4 flex items-center justify-between">
              <ScoreBar score={c.score} />
              <div className="flex gap-1.5">
                {c.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                    <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live search section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={15} className="text-blue-500" />
          <h3 className="font-black text-slate-800">Buscar más campañas en vivo</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Links directos a las fuentes más importantes de campañas globales</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {LIVE_SEARCHES.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors bg-slate-50"
            >
              {s.label}
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
