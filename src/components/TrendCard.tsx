import { Heart, MapPin, Tag, ExternalLink } from 'lucide-react';
import type { Trend, Source } from '../types';
import { useTrendStore } from '../store/useTrendStore';
import { ScoreRing } from './ScoreRing';
import { PriorityBadge, ComplexityBadge, StatusBadge, BrandBadge } from './BadgePriority';

const PLATFORM_STYLE: Record<Source['type'], { label: string; bg: string; text: string }> = {
  tiktok:    { label: 'TikTok',    bg: 'bg-pink-100',   text: 'text-pink-700' },
  instagram: { label: 'IG',        bg: 'bg-purple-100', text: 'text-purple-700' },
  facebook:  { label: 'FB',        bg: 'bg-blue-100',   text: 'text-blue-700' },
  x:         { label: 'X',         bg: 'bg-slate-200',  text: 'text-slate-700' },
  youtube:   { label: 'YouTube',   bg: 'bg-red-100',    text: 'text-red-700' },
  paper:     { label: 'Paper',     bg: 'bg-indigo-100', text: 'text-indigo-700' },
  product:   { label: 'Producto',  bg: 'bg-green-100',  text: 'text-green-700' },
  article:   { label: 'Artículo',  bg: 'bg-slate-100',  text: 'text-slate-600' },
  report:    { label: 'Reporte',   bg: 'bg-amber-100',  text: 'text-amber-700' },
};

function getMomentum(detectedAt: string) {
  const days = Math.floor((Date.now() - new Date(detectedAt).getTime()) / 86_400_000);
  if (days <= 7)  return { label: '🔥 Esta semana', cls: 'bg-red-50 text-red-600 border-red-200' };
  if (days <= 30) return { label: '↑ Reciente',     cls: 'bg-orange-50 text-orange-600 border-orange-200' };
  if (days <= 90) return { label: '→ Activa',        cls: 'bg-blue-50 text-blue-600 border-blue-200' };
  return                { label: '· Establecida',   cls: 'bg-slate-100 text-slate-500 border-slate-200' };
}

interface TrendCardProps {
  trend: Trend;
  compact?: boolean;
}

export function TrendCard({ trend, compact = false }: TrendCardProps) {
  const { toggleFavorite, setSelectedTrend } = useTrendStore();
  const momentum = getMomentum(trend.detectedAt);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => setSelectedTrend(trend.id)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <BrandBadge value={trend.brand} />
              <PriorityBadge value={trend.priority} />
              <StatusBadge value={trend.status} />
              {/* Momentum badge */}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${momentum.cls}`}>
                {momentum.label}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-blue-700 transition-colors">
              {trend.name}
            </h3>
          </div>
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <ScoreRing score={trend.score} size={48} />
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(trend.id); }}
              className={`transition-colors ${trend.isFavorite ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}
            >
              <Heart size={14} fill={trend.isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1"><MapPin size={11} />{trend.country}</span>
          <span className="flex items-center gap-1"><Tag size={11} />{trend.category}</span>
        </div>

        {!compact && (
          <>
            <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">{trend.evidence}</p>

            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <div className="text-xs font-semibold text-blue-700 mb-1">Oportunidad Perú</div>
              <p className="text-xs text-blue-800 line-clamp-2">{trend.peruOpportunity}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-green-700 mb-1">Acción sugerida</div>
              <p className="text-xs text-green-800 line-clamp-2">{trend.suggestedAction}</p>
            </div>
          </>
        )}

        {/* Validar en Google Trends / TikTok / YouTube */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium">Validar:</span>
          {[
            { label: 'Noticias EEUU', url: `https://www.google.com/search?q=${encodeURIComponent(trend.name)}+food+trend+USA&tbm=nws&hl=en&gl=us`, cls: 'bg-blue-50 text-blue-700' },
            { label: 'TikTok', url: `https://www.tiktok.com/search?q=${encodeURIComponent(trend.name)}`, cls: 'bg-pink-50 text-pink-700' },
            { label: 'YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(trend.name + ' USA Europe trend')}`, cls: 'bg-red-50 text-red-700' },
          ].map(({ label, url, cls }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls} hover:opacity-75 transition-opacity flex items-center gap-1`}
            >
              {label} <ExternalLink size={9} />
            </a>
          ))}
        </div>

        {/* Source platform chips */}
        {trend.sources && trend.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-2">
            <span className="text-xs text-slate-400">Fuentes:</span>
            {trend.sources.slice(0, 4).map((src, i) => {
              const s = PLATFORM_STYLE[src.type];
              return (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text} hover:opacity-75 transition-opacity flex items-center gap-1`}
                >
                  {s.label}<ExternalLink size={9} />
                </a>
              );
            })}
            {trend.sources.length > 4 && (
              <span className="text-xs text-slate-400">+{trend.sources.length - 4}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <ComplexityBadge value={trend.complexity} />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ExternalLink size={11} />
            Ver detalle
          </span>
        </div>
      </div>
    </div>
  );
}
