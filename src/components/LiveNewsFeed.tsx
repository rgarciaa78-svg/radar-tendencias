import { ExternalLink, Rss, TrendingUp, Globe } from 'lucide-react';

// Categorías de búsqueda curadas para el radar de tendencias saludables EEUU/Europa → Perú
const SIGNAL_CATEGORIES = [
  {
    label: 'Proteína & Fitness',
    emoji: '💪',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700' },
    queries: {
      news:   'high protein food launch USA 2025',
      trends: 'proteína comida fitness',
      tiktok: 'high protein food',
    },
  },
  {
    label: 'Lácteos Funcionales',
    emoji: '🥛',
    color: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', btn: 'bg-teal-600 hover:bg-teal-700' },
    queries: {
      news:   'functional dairy yogurt innovation Europe launch 2025',
      trends: 'yogurt griego colágeno kefir',
      tiktok: 'functional yogurt protein dairy',
    },
  },
  {
    label: 'Condimentos & Salsas',
    emoji: '🌶️',
    color: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', btn: 'bg-red-600 hover:bg-red-700' },
    queries: {
      news:   'hot sauce condiment clean label trend USA Europe 2025',
      trends: 'salsa picante gochujang fermentado',
      tiktok: 'condiment sauce trend food',
    },
  },
  {
    label: 'Bebidas Funcionales',
    emoji: '⚡',
    color: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', btn: 'bg-violet-600 hover:bg-violet-700' },
    queries: {
      news:   'functional beverage adaptogen electrolyte launch USA 2025',
      trends: 'bebida funcional adaptógeno electrolitos maca',
      tiktok: 'functional drink adaptogen energy',
    },
  },
  {
    label: 'Snacks Saludables',
    emoji: '🥜',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700' },
    queries: {
      news:   'healthy snack launch high fiber protein bar USA 2025',
      trends: 'snack saludable proteico barra fibra',
      tiktok: 'healthy snack protein',
    },
  },
  {
    label: 'Clean Label & Sin Azúcar',
    emoji: '🌿',
    color: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', btn: 'bg-green-600 hover:bg-green-700' },
    queries: {
      news:   'clean label seed oil free zero sugar monk fruit food trend 2025',
      trends: 'sin azúcar clean label etiqueta limpia',
      tiktok: 'clean eating seed oil free',
    },
  },
  {
    label: 'Tendencias EEUU Ahora',
    emoji: '🇺🇸',
    color: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', btn: 'bg-slate-700 hover:bg-slate-800' },
    queries: {
      news:   'food trend USA healthy product launch 2025 2026',
      trends: 'food trend USA',
      tiktok: 'food trend viral USA 2025',
    },
  },
  {
    label: 'Lanzamientos Europa',
    emoji: '🇪🇺',
    color: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700' },
    queries: {
      news:   'food innovation launch Europe healthy product 2025',
      trends: 'alimento funcional Europa innovación',
      tiktok: 'food launch Europe healthy',
    },
  },
  {
    label: 'Proteínas Alternativas',
    emoji: '🌱',
    color: { bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700', btn: 'bg-lime-600 hover:bg-lime-700' },
    queries: {
      news:   'alternative protein plant-based insect cricket food launch 2025',
      trends: 'proteína alternativa vegetal',
      tiktok: 'plant based protein alternative',
    },
  },
  {
    label: 'Wellness & Longevidad',
    emoji: '🧬',
    color: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', btn: 'bg-pink-600 hover:bg-pink-700' },
    queries: {
      news:   'longevity wellness food supplement collagen mushroom trend 2025',
      trends: 'longevidad bienestar hongos colágeno',
      tiktok: 'longevity wellness food',
    },
  },
];

function makeGoogleNewsUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=nws&hl=es-419&gl=pe`;
}
function makeGoogleTrendsUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}+Peru+tendencia&tbm=nws&hl=es-419&gl=pe`;
}
function makeTikTokUrl(query: string): string {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
}

export function LiveNewsFeed() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Rss size={16} className="text-orange-500" />
            <h3 className="font-black text-slate-800 text-lg">Buscar Señales en Vivo</h3>
          </div>
          <p className="text-xs text-slate-500">
            Acceso directo a Google News, Noticias Perú y TikTok para cada categoría relevante
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full flex-shrink-0">
          <Globe size={11} />
          Tiempo real
        </div>
      </div>

      {/* Instrucción */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <TrendingUp size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Haz clic en <span className="font-bold">Google News</span> para ver noticias reales de hoy,
          en <span className="font-bold">Noticias PE</span> para ver si la tendencia ya llegó a Perú,
          y en <span className="font-bold">TikTok</span> para medir el volumen viral.
        </p>
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {SIGNAL_CATEGORIES.map((cat) => (
          <div
            key={cat.label}
            className={`border rounded-xl p-4 ${cat.color.bg} ${cat.color.border}`}
          >
            {/* Category label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{cat.emoji}</span>
              <span className={`text-sm font-bold ${cat.color.text}`}>{cat.label}</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-1.5">
              <a
                href={makeGoogleNewsUrl(cat.queries.news)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-white transition-colors ${cat.color.btn}`}
              >
                <span>📰 Google News</span>
                <ExternalLink size={10} />
              </a>
              <a
                href={makeGoogleTrendsUrl(cat.queries.trends)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
              >
                <span>📈 Google Trends PE</span>
                <ExternalLink size={10} />
              </a>
              <a
                href={makeTikTokUrl(cat.queries.tiktok)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold bg-white border border-slate-200 text-pink-600 hover:border-pink-300 hover:bg-pink-50 transition-colors"
              >
                <span>🎵 TikTok</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 text-center mt-4">
        Cada enlace abre la búsqueda en tiempo real — siempre actualizado, sin necesidad de servidor
      </p>
    </div>
  );
}
