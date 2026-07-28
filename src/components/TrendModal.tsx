import { X, Heart, MapPin, Tag, Calendar, Target, Users, MessageSquare, BarChart3, Clock, DollarSign, TrendingUp, ChevronDown, ExternalLink, FileText, ShoppingBag, Newspaper, BarChart2, Link2, Search, StickyNote } from 'lucide-react';
import type { Source } from '../types';
import { useState } from 'react';
import { useTrendStore } from '../store/useTrendStore';
import type { Status } from '../types';
import { ScoreRing } from './ScoreRing';
import { PriorityBadge, ComplexityBadge, BrandBadge } from './BadgePriority';

const STATUSES: Status[] = ['Detectada', 'En evaluación', 'En prototipo', 'Lista para lanzar', 'Descartada'];

const SOURCE_META: Record<Source['type'], { icon: typeof ExternalLink; color: string; bg: string; label: string; action: string }> = {
  tiktok:   { icon: ExternalLink, color: 'text-pink-600',   bg: 'bg-pink-50 border-pink-200',     label: 'TikTok',          action: 'Busca en TikTok' },
  instagram:{ icon: ExternalLink, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'Instagram',       action: 'Busca en Google' },
  facebook: { icon: ExternalLink, color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-300',     label: 'Facebook',        action: 'Busca en Google' },
  x:        { icon: ExternalLink, color: 'text-slate-800',  bg: 'bg-slate-100 border-slate-300',  label: 'X / Twitter',     action: 'Busca en X' },
  youtube:  { icon: ExternalLink, color: 'text-red-600',    bg: 'bg-red-50 border-red-200',       label: 'YouTube',         action: 'Busca en YouTube' },
  paper:    { icon: FileText,     color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     label: 'Investigación',   action: 'Busca en Google Scholar' },
  product:  { icon: ShoppingBag,  color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   label: 'Producto',        action: 'Busca en Google' },
  article:  { icon: Newspaper,    color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200',   label: 'Artículo',        action: 'Busca en Google' },
  report:   { icon: BarChart2,    color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',   label: 'Reporte',         action: 'Busca en Google' },
};

function getReliableUrl(source: Source): string {
  const clean = source.label.replace(/^[#@]/, '').split(' — ')[0].trim();
  const q = encodeURIComponent(clean);
  switch (source.type) {
    case 'tiktok':
      return `https://www.google.com/search?q=${q}+tiktok+trend&tbm=vid`;
    case 'instagram': {
      const tag = clean.toLowerCase().replace(/\s+/g, '');
      return `https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}/`;
    }
    case 'youtube':
      if (source.url.includes('youtube.com/results')) return source.url;
      return `https://www.youtube.com/results?search_query=${q}`;
    case 'x':
      return `https://x.com/search?q=${encodeURIComponent(clean)}&f=live`;
    case 'paper':
      return `https://scholar.google.com/scholar?q=${q}`;
    case 'report':
      return `https://www.google.com/search?q=${q}+USA+Europe+market+2025`;
    case 'product':
      return `https://www.google.com/search?q=${q}+USA+Europe`;
    case 'article':
    case 'facebook':
    default:
      return `https://www.google.com/search?q=${q}+USA+Europe+trend+2025`;
  }
}

function SourceLink({ source }: { source: Source }) {
  const meta = SOURCE_META[source.type];
  const Icon = meta.icon;
  const url = getReliableUrl(source);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 font-semibold hover:scale-[1.02] hover:shadow-md active:scale-95 transition-all ${meta.bg} ${meta.color}`}
    >
      <Icon size={15} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold uppercase tracking-wide opacity-60 mb-0.5">{meta.label}</div>
        <div className="text-sm truncate leading-tight">{source.label}</div>
        <div className="text-xs opacity-50 mt-0.5">→ {meta.action}</div>
      </div>
      <ExternalLink size={13} className="flex-shrink-0 opacity-50" />
    </a>
  );
}

const STATUS_COLORS: Record<Status, string> = {
  'Detectada':          'bg-blue-100 text-blue-700 border-blue-200',
  'En evaluación':      'bg-purple-100 text-purple-700 border-purple-200',
  'En prototipo':       'bg-amber-100 text-amber-700 border-amber-200',
  'Lista para lanzar':  'bg-green-100 text-green-700 border-green-200',
  'Descartada':         'bg-slate-100 text-slate-500 border-slate-200',
};

type Tab = 'detalle' | 'brief';

export function TrendModal() {
  const { selectedTrendId, trends, setSelectedTrend, toggleFavorite, updateStatus, updateNotes } = useTrendStore();
  const [tab, setTab] = useState<Tab>('detalle');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const trend = trends.find((t) => t.id === selectedTrendId);
  if (!trend) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setSelectedTrend(null)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <BrandBadge value={trend.brand} />
            {/* Inline status picker */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowStatusMenu(!showStatusMenu); }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${STATUS_COLORS[trend.status]}`}
              >
                {trend.status}
                <ChevronDown size={11} />
              </button>
              {showStatusMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20 min-w-[160px]">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); updateStatus(trend.id, s); setShowStatusMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${trend.status === s ? 'text-blue-600 font-bold' : 'text-slate-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(trend.id); }}
              className={`transition-colors ${trend.isFavorite ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
            >
              <Heart size={18} fill={trend.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => setSelectedTrend(null)} className="text-slate-400 hover:text-slate-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Title + Score */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-2">{trend.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin size={11} />{trend.country} · {trend.region}</span>
                <span className="flex items-center gap-1"><Tag size={11} />{trend.category}</span>
                <span className="flex items-center gap-1"><Calendar size={11} />{trend.detectedAt}</span>
              </div>
            </div>
            <ScoreRing score={trend.score} size={60} />
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            <PriorityBadge value={trend.priority} />
            <ComplexityBadge value={trend.complexity} />
            {trend.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>

          {/* ── VALIDACIÓN RÁPIDA ── */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Search size={12} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Validar tendencia global</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: '🌎 Google EEUU/Europa',
                  url: `https://www.google.com/search?q=${encodeURIComponent(trend.name)}+food+trend+USA+Europe`,
                  cls: 'bg-blue-600 hover:bg-blue-700',
                },
                {
                  label: '🎵 TikTok',
                  url: `https://www.google.com/search?q=${encodeURIComponent(trend.name)}+tiktok+trend&tbm=vid`,
                  cls: 'bg-pink-500 hover:bg-pink-600',
                },
                {
                  label: '▶️ YouTube',
                  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(trend.name + ' USA Europe trend')}`,
                  cls: 'bg-red-500 hover:bg-red-600',
                },
                {
                  label: '📰 Noticias globales',
                  url: `https://www.google.com/search?q=${encodeURIComponent(trend.name)}+food+launch+trend&tbm=nws`,
                  cls: 'bg-slate-600 hover:bg-slate-700',
                },
              ].map(({ label, url, cls }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-1.5 ${cls}`}
                >
                  {label}
                  <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </div>

          {/* ── FUENTES — siempre visibles antes de los tabs ── */}
          {trend.sources && trend.sources.length > 0 && (
            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={13} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {trend.sources.length} fuentes · haz clic para abrir
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trend.sources.map((src, i) => (
                  <SourceLink key={i} source={src} />
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl">
            {(['detalle', 'brief'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={(e) => { e.stopPropagation(); setTab(t); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'detalle' ? 'Tendencia' : 'Brief de implementación'}
              </button>
            ))}
          </div>

          {/* Tab: Tendencia */}
          {tab === 'detalle' && (
            <div className="space-y-4">
              <section className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Evidencia · {trend.sourceType}</div>
                <p className="text-sm text-slate-700 leading-relaxed">{trend.evidence}</p>
              </section>
              <section className="bg-blue-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Oportunidad para Perú</div>
                <p className="text-sm text-blue-900 leading-relaxed">{trend.peruOpportunity}</p>
              </section>
              <section className="bg-green-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">Acción sugerida</div>
                <p className="text-sm text-green-900 leading-relaxed">{trend.suggestedAction}</p>
              </section>

              {/* ── NOTAS EDITORIALES ── */}
              <section className="border-2 border-dashed border-amber-300 rounded-xl p-4 bg-amber-50">
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote size={13} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Notas del equipo</span>
                  {trend.notes && <span className="text-xs text-amber-500">(guardado automáticamente)</span>}
                </div>
                <textarea
                  value={trend.notes ?? ''}
                  onChange={(e) => updateNotes(trend.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Agrega notas, decisiones o próximos pasos del equipo aquí…"
                  rows={3}
                  className="w-full text-sm text-slate-700 bg-white border border-amber-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none placeholder-slate-400 leading-relaxed"
                />
              </section>
            </div>
          )}

          {/* Tab: Brief */}
          {tab === 'brief' && (
            !trend.brief ? (
              <div className="text-center py-10 text-slate-400">
                <div className="text-3xl mb-2">📋</div>
                <div className="font-medium">Brief no disponible</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Target size={13} />
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Objetivo</span>
                  </div>
                  <p className="text-sm leading-relaxed">{trend.brief.objetivo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={12} className="text-purple-600" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Público</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{trend.brief.publicoObjetivo}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={12} className="text-blue-600" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mensaje clave</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">"{trend.brief.mensajeClave}"</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Posicionamiento</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">{trend.brief.posicionamiento}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={12} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Canales</span>
                  </div>
                  <ul className="space-y-1.5">
                    {trend.brief.canales.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={12} className="text-green-600" />
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Timeline</span>
                    </div>
                    <p className="text-xs text-green-800 leading-relaxed">{trend.brief.timeline}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={12} className="text-slate-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Presupuesto</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{trend.brief.presupuesto}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={12} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">KPIs de éxito</span>
                  </div>
                  <ul className="space-y-1.5">
                    {trend.brief.kpis.map((kpi, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs flex-shrink-0 font-bold">{i + 1}</span>
                        {kpi}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
