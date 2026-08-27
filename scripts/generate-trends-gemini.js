#!/usr/bin/env node
/**
 * generate-trends.js
 * Extrae tendencias REALES de Google News RSS + procesa con lógica interna.
 * 100% gratis, sin API keys, sin configuración.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.join(__dirname, '..');
const AUTO_FILE  = path.join(ROOT, 'src/data/autoTrends.ts');
const today      = new Date().toISOString().split('T')[0];

// ── 1. IDs existentes ─────────────────────────────────────────────────
const existingIds = new Set();
if (fs.existsSync(AUTO_FILE)) {
  for (const m of fs.readFileSync(AUTO_FILE, 'utf8').matchAll(/id:\s*'([^']+)'/g))
    existingIds.add(m[1]);
}
console.log(`IDs existentes: ${existingIds.size}`);

// ── 2. Búsquedas en Google News RSS ──────────────────────────────────
const queries = [
  'healthy food trends USA 2025',
  'functional beverage trends market',
  'protein snack launch USA Europe',
  'gut health probiotic food trend',
  'plant based food innovation',
  'collagen beauty food drink trend',
  'sports nutrition RTD protein',
  'clean label food consumer trend',
];

async function fetchRSS(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRegex.exec(xml)) !== null) {
      const block = m[1];
      const title  = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(block) || /<title>(.*?)<\/title>/.exec(block) || [])[1] || '';
      const link   = (/<link>(.*?)<\/link>/.exec(block) || [])[1] || '';
      const desc   = (/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(block) || /<description>(.*?)<\/description>/.exec(block) || [])[1] || '';
      const source = (/<source[^>]*>(.*?)<\/source>/.exec(block) || [])[1] || 'News';
      const pubDate= (/<pubDate>(.*?)<\/pubDate>/.exec(block) || [])[1] || today;
      if (title && link) items.push({ title, link, desc: desc.replace(/<[^>]+>/g, ''), source, pubDate, query });
    }
    return items.slice(0, 3);
  } catch (e) {
    console.log(`  ⚠ Error fetching "${query}": ${e.message}`);
    return [];
  }
}

console.log('Buscando tendencias en Google News...');
const allItems = (await Promise.all(queries.map(fetchRSS))).flat();
console.log(`Artículos encontrados: ${allItems.length}`);

if (allItems.length === 0) {
  console.log('Sin resultados de Google News. Saliendo.');
  process.exit(0);
}

// ── 3. Clasificar y convertir a Trend ────────────────────────────────
const CATEGORY_KEYWORDS = {
  'Alimentos altos en proteína':  ['protein', 'proteína', 'high-protein', 'whey', 'casein'],
  'Bebidas funcionales':          ['functional beverage', 'functional drink', 'adaptogen', 'nootropic drink'],
  'Probióticos y prebióticos':    ['probiotic', 'prebiotic', 'gut health', 'microbiome', 'ferment'],
  'Salud digestiva':              ['digestive', 'gut', 'fiber', 'digestion', 'bowel'],
  'Snacks saludables':            ['snack', 'bar', 'chip', 'cracker', 'bite'],
  'Proteína RTD':                 ['rtd protein', 'ready-to-drink protein', 'protein shake', 'protein drink'],
  'Leches vegetales':             ['plant milk', 'oat milk', 'almond milk', 'plant-based milk'],
  'Kombucha y fermentados':       ['kombucha', 'kefir', 'fermented', 'kimchi', 'tepache'],
  'Colágeno y belleza':           ['collagen', 'beauty', 'skin health', 'hair', 'nail'],
  'Bebidas energéticas limpias':  ['clean energy', 'energy drink', 'caffeine', 'matcha', 'yerba'],
  'Agua funcional y proteica':    ['functional water', 'protein water', 'enhanced water', 'electrolyte water'],
  'Nutrición deportiva':          ['sports nutrition', 'athlete', 'performance', 'creatine', 'bcaa'],
  'Nutrición femenina':           ['women health', 'female', 'hormonal', 'menopause', 'fertility'],
  'Longevidad y antiaging':       ['longevity', 'antiaging', 'anti-aging', 'lifespan', 'nmn', 'nad'],
  'Nootropics y cognición':       ['nootropic', 'cognitive', 'brain', 'focus', 'memory'],
  'Yogurt y yogurt griego':       ['yogurt', 'yoghurt', 'greek yogurt', 'skyr'],
  'Sabores globales':             ['global flavor', 'ethnic', 'international', 'fusion', 'spice'],
  'Salsas y condimentos':         ['sauce', 'condiment', 'hot sauce', 'dressing', 'seasoning'],
  'Formatos on-the-go':           ['on-the-go', 'portable', 'convenient', 'single-serve', 'pouch'],
  'Empaques sostenibles':         ['sustainable packaging', 'eco', 'biodegradable', 'recyclable', 'green packaging'],
};

const SOURCE_KEYWORDS = {
  'Red social':               ['tiktok', 'instagram', 'social media', 'viral', 'trend'],
  'Investigación científica': ['study', 'research', 'journal', 'science', 'clinical'],
  'Reporte de mercado':       ['market', 'report', 'forecast', 'growth', 'billion'],
  'Lanzamiento de producto':  ['launch', 'new product', 'introduces', 'release', 'unveil'],
  'Supermercado':             ['walmart', 'whole foods', 'costco', 'kroger', 'trader joe', 'sprouts', 'lidl', 'aldi'],
};

const BRAND_KEYWORDS = {
  'TIGO':        ['yogurt', 'greek', 'dairy', 'kefir', 'skyr'],
  'B&D':         ['sauce', 'condiment', 'dressing', 'flavor', 'seasoning', 'spice'],
  'Straal':      ['energy', 'sport', 'performance', 'protein drink', 'rtd', 'functional water'],
  'Nueva marca': ['innovative', 'startup', 'emerging', 'new brand', 'launch'],
};

function classify(text, keywords) {
  const lower = text.toLowerCase();
  for (const [label, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lower.includes(kw))) return label;
  }
  return null;
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);
}

function detectRegion(text) {
  const lower = text.toLowerCase();
  if (['uk', 'britain', 'france', 'germany', 'spain', 'italy', 'europe', 'eu ', 'lidl', 'aldi'].some(w => lower.includes(w)))
    return 'Europa';
  return 'Estados Unidos';
}

function detectCountry(text, region) {
  const lower = text.toLowerCase();
  if (lower.includes('uk') || lower.includes('britain')) return 'Reino Unido';
  if (lower.includes('france')) return 'Francia';
  if (lower.includes('germany')) return 'Alemania';
  if (lower.includes('spain')) return 'España';
  if (lower.includes('europe')) return 'Europa';
  return region === 'Europa' ? 'Europa' : 'Estados Unidos';
}

// Deduplicate by similar titles
const seen = new Set();
const unique = allItems.filter(item => {
  const key = slugify(item.title.slice(0, 30));
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const trends = [];
for (const item of unique) {
  const fullText  = `${item.title} ${item.desc} ${item.query}`;
  const category  = classify(fullText, CATEGORY_KEYWORDS) || 'Snacks saludables';
  const sourceType= classify(fullText, SOURCE_KEYWORDS)   || 'Noticia';
  const brand     = classify(fullText, BRAND_KEYWORDS)    || 'Todas';
  const region    = detectRegion(fullText);
  const country   = detectCountry(fullText, region);
  const id        = `${slugify(item.title.slice(0, 30))}-${today}`;

  if (existingIds.has(id)) continue;

  const cleanTitle = item.title.replace(/ - .*$/, '').slice(0, 60);
  const cleanDesc  = item.desc.slice(0, 300) || `Tendencia detectada: ${cleanTitle}`;

  trends.push({
    id,
    name:            cleanTitle,
    region,
    country,
    category,
    sourceType,
    evidence:        `${cleanDesc} Fuente: ${item.source}.`,
    brand,
    peruOpportunity: `Esta tendencia representa una oportunidad para adaptar ${category.toLowerCase()} al consumidor peruano, que muestra creciente interés en productos saludables e innovadores.`,
    suggestedAction: `Evaluar formulación y viabilidad de lanzar una versión local alineada a esta tendencia en los próximos 6-9 meses.`,
    score:           Math.floor(65 + Math.random() * 25),
    priority:        Math.random() > 0.5 ? 'Alta' : 'Media',
    complexity:      ['Baja', 'Media', 'Alta'][Math.floor(Math.random() * 3)],
    status:          'Detectada',
    isFavorite:      false,
    detectedAt:      today,
    tags:            item.query.split(' ').filter(w => w.length > 3).slice(0, 4),
    sources:         [{ label: item.source, url: item.link, type: 'article' }],
    brief: {
      objetivo:        `Capitalizar la tendencia de ${cleanTitle} para desarrollar una oferta diferenciada en el mercado peruano.`,
      publicoObjetivo: 'Consumidores urbanos de 20-40 años, con interés en salud y bienestar.',
      mensajeClave:    `Innovación en ${category.toLowerCase()} con estándares de calidad internacional.`,
      posicionamiento: `Producto líder en ${category.toLowerCase()} con respaldo científico y sabor local.`,
      canales:         ['Instagram', 'TikTok', 'Puntos de venta modernos'],
      timeline:        '6-9 meses',
      presupuesto:     'S/ 50,000 - 120,000',
      kpis:            ['Distribución en 500+ puntos de venta', 'NPS > 60', 'Market share 5% en 12 meses'],
    },
  });

  if (trends.length >= 8) break;
}

if (trends.length === 0) {
  console.log('Sin tendencias nuevas hoy (todas ya existen).');
  process.exit(0);
}

// ── 4. Escribir en autoTrends.ts ──────────────────────────────────────
const esc = s => String(s ?? '').replace(/'/g, "\\'").replace(/\n/g, ' ').replace(/\r/g, '');

const newCode = trends.map(t => {
  const sources = t.sources.map(s => `      { label: '${esc(s.label)}', url: '${esc(s.url)}', type: '${s.type}' as const }`).join(',\n');
  const canales = t.brief.canales.map(c => `'${esc(c)}'`).join(', ');
  const kpis    = t.brief.kpis.map(k => `'${esc(k)}'`).join(', ');
  const tags    = t.tags.map(tag => `'${esc(tag)}'`).join(', ');

  return `  {
    id: '${esc(t.id)}',
    name: '${esc(t.name)}',
    region: '${t.region}' as Trend['region'],
    country: '${esc(t.country)}',
    category: '${esc(t.category)}' as Trend['category'],
    sourceType: '${esc(t.sourceType)}' as Trend['sourceType'],
    evidence: '${esc(t.evidence)}',
    brand: '${t.brand}' as Trend['brand'],
    peruOpportunity: '${esc(t.peruOpportunity)}',
    suggestedAction: '${esc(t.suggestedAction)}',
    score: ${t.score},
    priority: '${t.priority}' as Trend['priority'],
    complexity: '${t.complexity}' as Trend['complexity'],
    status: 'Detectada' as Trend['status'],
    isFavorite: false,
    detectedAt: '${today}',
    tags: [${tags}],
    sources: [\n${sources}\n    ],
    brief: {
      objetivo: '${esc(t.brief.objetivo)}',
      publicoObjetivo: '${esc(t.brief.publicoObjetivo)}',
      mensajeClave: '${esc(t.brief.mensajeClave)}',
      posicionamiento: '${esc(t.brief.posicionamiento)}',
      canales: [${canales}],
      timeline: '${esc(t.brief.timeline)}',
      presupuesto: '${esc(t.brief.presupuesto)}',
      kpis: [${kpis}],
    },
  }`;
}).join(',\n\n');

let current = fs.existsSync(AUTO_FILE) ? fs.readFileSync(AUTO_FILE, 'utf8') : '';
let updated;

if (!current.includes('export const autoTrends')) {
  updated = `import type { Trend } from '../types';\n\n// Auto-generado — no editar manualmente\nexport const autoTrends: Trend[] = [\n${newCode},\n];\n`;
} else {
  const at = current.lastIndexOf('];');
  updated  = current.slice(0, at) + `\n  // ${today} — Google News\n${newCode},\n\n` + current.slice(at);
}

fs.writeFileSync(AUTO_FILE, updated, 'utf8');
console.log(`✅ ${trends.length} tendencias nuevas agregadas:`);
trends.forEach(t => console.log(`  • ${t.name} (${t.category})`));
