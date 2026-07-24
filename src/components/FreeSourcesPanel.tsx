import { ExternalLink, Rss } from 'lucide-react';

const SOURCES = [
  {
    category: '📊 Tendencias globales (gratis)',
    items: [
      { name: 'FMCG Gurus — Free Insights',       url: 'https://fmcggurus.com/free-insights/',          desc: 'Reportes gratuitos de consumidor global' },
      { name: 'Food Navigator — Noticias diarias', url: 'https://www.foodnavigator.com',                 desc: 'El principal medio de innovación alimentaria' },
      { name: 'Innova Market Insights (free)',     url: 'https://www.innovamarketinsights.com/trends/',  desc: 'Top 10 tendencias anuales gratis' },
      { name: 'Mintel — Food & Drink blog',        url: 'https://www.mintel.com/mintel-blog/',           desc: 'Artículos de tendencias sin suscripción' },
    ],
  },
  {
    category: '🇵🇪 Mercado peruano',
    items: [
      { name: 'INEI — Encuestas de consumo',         url: 'https://www.inei.gob.pe/estadisticas/indice-tematico/poblacion-y-vivienda/', desc: 'Datos de hogares y consumo oficial' },
      { name: 'Euromonitor — Perú (free preview)',   url: 'https://www.euromonitor.com/peru',             desc: 'Preview gratis de categorías peruanas' },
      { name: 'Peru Retail — Noticias de retail',    url: 'https://www.peru-retail.com',                  desc: 'Lanzamientos y movimientos en retail peruano' },
      { name: 'Alacarta.pe — Gastronomía peruana',   url: 'https://alacarta.pe',                          desc: 'Tendencias en gastronomía y food service local' },
    ],
  },
  {
    category: '🔍 Validación en tiempo real',
    items: [
      { name: 'Google Trends — Perú',               url: 'https://trends.google.com/trends/?geo=PE',    desc: 'Volumen de búsqueda de cualquier término en PE' },
      { name: 'Exploding Topics — Food',            url: 'https://explodingtopics.com/category/food',    desc: 'Tendencias emergentes antes del mainstream' },
      { name: 'TikTok Creative Center',             url: 'https://ads.tiktok.com/business/creativecenter/trend-discovery/keyword/pc/en', desc: 'Hashtags y tendencias de TikTok en tiempo real' },
      { name: 'Reddit r/nutrition',                 url: 'https://www.reddit.com/r/nutrition/',          desc: 'Conversaciones reales de consumidores activos' },
    ],
  },
  {
    category: '🛒 Lanzamientos de producto',
    items: [
      { name: 'GNPD by Mintel (free search)',       url: 'https://www.mintel.com/global-new-products-database/', desc: 'Preview de productos nuevos globales' },
      { name: 'The Grocer — New Product Awards',    url: 'https://www.thegrocer.co.uk/new-product-awards', desc: 'Mejores lanzamientos del año en UK' },
      { name: 'Whole Foods — Trend Predictions',   url: 'https://www.wholefoodsmarket.com/products/trends', desc: 'Predicciones anuales de tendencias de Whole Foods' },
      { name: 'Product Hunt — Food & Beverage',    url: 'https://www.producthunt.com/topics/food',       desc: 'Startups de food tech recién lanzadas' },
    ],
  },
  {
    category: '📱 Redes sociales clave',
    items: [
      { name: '#FoodTrends en TikTok',             url: 'https://www.tiktok.com/tag/foodtrends',         desc: 'Lo que está viralizando en comida ahora mismo' },
      { name: '#HealthyEating en Instagram',        url: 'https://www.instagram.com/explore/tags/healthyeating/', desc: '200M+ posts de alimentación saludable' },
      { name: 'YouTube — Food Trends 2026',        url: 'https://www.youtube.com/results?search_query=food+trends+2026', desc: 'Reviews y análisis en video' },
      { name: 'X / #FoodInnovation',               url: 'https://x.com/search?q=%23foodinnovation&src=typed_query', desc: 'Conversación en tiempo real de la industria' },
    ],
  },
];

export function FreeSourcesPanel() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          <Rss size={16} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Fuentes Gratuitas de Inteligencia</h3>
          <p className="text-xs text-slate-500">Las mejores fuentes del mundo para alimentar este radar — todas gratuitas</p>
        </div>
      </div>

      <div className="space-y-5">
        {SOURCES.map(({ category, items }) => (
          <div key={category}>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">{category}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map(({ name, url, desc }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 truncate">{name}</div>
                    <div className="text-xs text-slate-400 mt-0.5 leading-snug">{desc}</div>
                  </div>
                  <ExternalLink size={13} className="text-slate-300 group-hover:text-blue-500 flex-shrink-0 mt-0.5 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
