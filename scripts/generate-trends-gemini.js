#!/usr/bin/env node
/**
 * generate-trends.js
 * Usa GitHub Models API (gratis, sin configuración) para generar
 * 3 tendencias diarias reales de alimentos y bebidas saludables.
 *
 * No requiere API keys externas — usa el GITHUB_TOKEN automático del workflow.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT      = path.join(__dirname, '..');
const AUTO_FILE = path.join(ROOT, 'src/data/autoTrends.ts');
const TOKEN     = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('❌ GITHUB_TOKEN no disponible.');
  process.exit(1);
}

// ── 1. IDs existentes para no duplicar ───────────────────────────────
const existingIds = new Set();
if (fs.existsSync(AUTO_FILE)) {
  const content = fs.readFileSync(AUTO_FILE, 'utf8');
  for (const m of content.matchAll(/id:\s*'([^']+)'/g)) existingIds.add(m[1]);
}
console.log(`IDs existentes: ${existingIds.size}`);

// ── 2. Prompt ─────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];

const PROMPT = `Eres un analista experto en tendencias de consumo masivo de alimentos y bebidas saludables para Latinoamérica con foco en Perú.

Hoy es ${today}. Genera entre 5 y 8 tendencias NUEVAS, REALES y DIFERENTES que estén ocurriendo ahora en EEUU y/o Europa en alimentos/bebidas saludables. Incluye TODAS las que sean relevantes y verificables — no te limites a un número fijo. Usa marcas reales, datos concretos, URLs verificables.

Devuelve SOLO JSON válido, sin markdown, sin explicaciones. Array de objetos:

[
  {
    "id": "tendencia-descriptiva-${today}",
    "name": "Nombre corto (máx 50 chars)",
    "region": "Estados Unidos",
    "country": "Estados Unidos",
    "category": "UNA de: Yogurt y yogurt griego | Alimentos altos en proteína | Salud digestiva | Probióticos y prebióticos | Snacks saludables | Bebidas funcionales | Agua funcional y proteica | Leches vegetales | Kombucha y fermentados | Proteína RTD | Bebidas energéticas limpias | Colágeno y belleza | Nootropics y cognición | Nutrición femenina | Longevidad y antiaging | Nutrición deportiva | Salsas y condimentos | Sabores globales | Formatos on-the-go | Empaques sostenibles",
    "sourceType": "UNA de: Red social | Investigación científica | Reporte de mercado | Lanzamiento de producto | Noticia | Supermercado",
    "evidence": "2-3 oraciones con datos reales, marcas específicas y números concretos",
    "brand": "UNA de: TIGO | B&D | Straal | Nueva marca | Todas",
    "peruOpportunity": "Por qué es oportunidad para Perú (2 oraciones)",
    "suggestedAction": "Acción concreta para el equipo I+D (1-2 oraciones)",
    "score": 75,
    "priority": "Alta",
    "complexity": "Media",
    "status": "Detectada",
    "isFavorite": false,
    "detectedAt": "${today}",
    "tags": ["tag1", "tag2", "tag3"],
    "sources": [{"label": "Nombre fuente", "url": "https://url-real.com", "type": "article"}],
    "brief": {
      "objetivo": "Objetivo estratégico",
      "publicoObjetivo": "Descripción del consumidor",
      "mensajeClave": "Mensaje principal",
      "posicionamiento": "Propuesta de valor",
      "canales": ["Instagram", "TikTok"],
      "timeline": "6-9 meses",
      "presupuesto": "S/ 50,000 - 100,000",
      "kpis": ["KPI 1", "KPI 2", "KPI 3"]
    }
  }
]`;

// ── 3. Llamar GitHub Models API ───────────────────────────────────────
console.log('Consultando GitHub Models (gpt-4o-mini)...');

const response = await fetch(
  'https://models.inference.ai.azure.com/chat/completions',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un analista de tendencias de consumo. Respondes SOLO con JSON válido, sin markdown ni texto adicional.',
        },
        { role: 'user', content: PROMPT },
      ],
      temperature: 0.8,
      max_tokens: 8000,
    }),
  }
);

if (!response.ok) {
  const err = await response.text();
  console.error('❌ Error GitHub Models:', response.status, err);
  process.exit(1);
}

const data    = await response.json();
const rawText = data?.choices?.[0]?.message?.content;

if (!rawText) {
  console.error('❌ Respuesta vacía:', JSON.stringify(data));
  process.exit(1);
}

// ── 4. Parsear ────────────────────────────────────────────────────────
let newTrends;
try {
  const clean = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  newTrends = JSON.parse(clean);
  if (!Array.isArray(newTrends)) throw new Error('No es array');
} catch (e) {
  console.error('❌ Error parseando JSON:', e.message);
  console.error('Raw:', rawText.slice(0, 500));
  process.exit(1);
}

const toAdd = newTrends.filter(t => !existingIds.has(t.id));

if (toAdd.length === 0) {
  console.log('Sin tendencias nuevas hoy.');
  process.exit(0);
}

// ── 5. Escribir TypeScript ────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/'/g, "\\'").replace(/\n/g, ' ');

const newCode = toAdd.map(t => {
  const sources  = (t.sources  || []).map(s => `      { label: '${esc(s.label)}', url: '${esc(s.url)}', type: '${s.type}' as const }`).join(',\n');
  const canales  = (t.brief?.canales || []).map(c => `'${esc(c)}'`).join(', ');
  const kpis     = (t.brief?.kpis    || []).map(k => `'${esc(k)}'`).join(', ');
  const tags     = (t.tags || []).map(tag => `'${esc(tag)}'`).join(', ');

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
    score: ${Number(t.score) || 70},
    priority: '${t.priority}' as Trend['priority'],
    complexity: '${t.complexity}' as Trend['complexity'],
    status: 'Detectada' as Trend['status'],
    isFavorite: false,
    detectedAt: '${today}',
    tags: [${tags}],
    sources: [\n${sources}\n    ],
    brief: {
      objetivo: '${esc(t.brief?.objetivo)}',
      publicoObjetivo: '${esc(t.brief?.publicoObjetivo)}',
      mensajeClave: '${esc(t.brief?.mensajeClave)}',
      posicionamiento: '${esc(t.brief?.posicionamiento)}',
      canales: [${canales}],
      timeline: '${esc(t.brief?.timeline)}',
      presupuesto: '${esc(t.brief?.presupuesto)}',
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
  updated  = current.slice(0, at) + `\n  // ${today}\n${newCode},\n\n` + current.slice(at);
}

fs.writeFileSync(AUTO_FILE, updated, 'utf8');
console.log(`✅ ${toAdd.length} tendencias agregadas:`);
toAdd.forEach(t => console.log(`  • ${t.name} (${t.category})`));
