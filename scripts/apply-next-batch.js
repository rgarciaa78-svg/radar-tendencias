#!/usr/bin/env node
/**
 * apply-next-batch.js
 * Lee el próximo batch JSON y genera código TypeScript para agregarlo a autoTrends.ts
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const ROOT         = path.join(__dirname, '..');
const COUNTER_FILE = path.join(ROOT, 'src/data/batchCounter.json');
const BATCHES_DIR  = path.join(ROOT, 'src/data/batches');
const AUTO_FILE    = path.join(ROOT, 'src/data/autoTrends.ts');

// ── 1. Leer contador ──────────────────────────────────────────────────────
const counter   = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
const batchNum  = counter.nextBatch;
const batchFile = path.join(BATCHES_DIR, `batch-${batchNum}.json`);

if (!fs.existsSync(batchFile)) {
  console.log(`No hay batch-${batchNum}.json. No hay nuevas tendencias por ahora.`);
  process.exit(0);
}

// ── 2. Leer el batch ──────────────────────────────────────────────────────
const newTrends = JSON.parse(fs.readFileSync(batchFile, 'utf8'));
const today     = new Date().toISOString().split('T')[0];

console.log(`Aplicando batch-${batchNum} con ${newTrends.length} tendencias...`);

// ── 3. Leer autoTrends.ts actual ──────────────────────────────────────────
let existing = [];
if (fs.existsSync(AUTO_FILE)) {
  const content = fs.readFileSync(AUTO_FILE, 'utf8');
  // Extraer IDs ya existentes para no duplicar
  const idMatches = [...content.matchAll(/id:\s*'([^']+)'/g)];
  const existingIds = new Set(idMatches.map(m => m[1]));
  existing = existingIds;
}

const toAdd = newTrends.filter(t => !existing.has || !existing.has(t.id));

if (toAdd.length === 0) {
  console.log('Todas las tendencias del batch ya existen. Saltando.');
} else {
  // ── 4. Generar TypeScript para las nuevas tendencias ─────────────────
  const newCode = toAdd.map(t => {
    const sources = t.sources.map(s =>
      `      { label: '${s.label.replace(/'/g, "\\'")}', url: '${s.url}', type: '${s.type}' as const }`
    ).join(',\n');

    const canales = t.brief.canales.map(c => `'${c.replace(/'/g, "\\'")}'`).join(', ');
    const kpis    = t.brief.kpis.map(k => `'${k.replace(/'/g, "\\'")}'`).join(', ');

    return `  {
    id: '${t.id}',
    name: '${t.name.replace(/'/g, "\\'")}',
    region: '${t.region}' as Trend['region'],
    country: '${t.country.replace(/'/g, "\\'")}',
    category: '${t.category}' as Trend['category'],
    sourceType: '${t.sourceType}' as Trend['sourceType'],
    evidence: '${t.evidence.replace(/'/g, "\\'")}',
    brand: '${t.brand}' as Trend['brand'],
    peruOpportunity: '${t.peruOpportunity.replace(/'/g, "\\'")}',
    suggestedAction: '${t.suggestedAction.replace(/'/g, "\\'")}',
    score: ${t.score},
    priority: '${t.priority}' as Trend['priority'],
    complexity: '${t.complexity}' as Trend['complexity'],
    status: '${t.status}' as Trend['status'],
    isFavorite: ${t.isFavorite},
    detectedAt: '${t.detectedAt}',
    tags: [${t.tags.map(tag => `'${tag}'`).join(', ')}],
    sources: [\n${sources}\n    ],
    brief: {
      objetivo: '${t.brief.objetivo.replace(/'/g, "\\'")}',
      publicoObjetivo: '${t.brief.publicoObjetivo.replace(/'/g, "\\'")}',
      mensajeClave: '${t.brief.mensajeClave.replace(/'/g, "\\'")}',
      posicionamiento: '${t.brief.posicionamiento.replace(/'/g, "\\'")}',
      canales: [${canales}],
      timeline: '${t.brief.timeline.replace(/'/g, "\\'")}',
      presupuesto: '${t.brief.presupuesto.replace(/'/g, "\\'")}',
      kpis: [${kpis}],
    },
  }`;
  }).join(',\n\n');

  // ── 5. Leer contenido actual de autoTrends.ts y agregar ──────────────
  let currentContent = '';
  if (fs.existsSync(AUTO_FILE)) {
    currentContent = fs.readFileSync(AUTO_FILE, 'utf8');
  }

  let updatedContent;
  if (!currentContent.includes('export const autoTrends')) {
    // Primera vez: crear el archivo completo
    updatedContent = `import type { Trend } from '../types';\n\n// Auto-generado — no editar manualmente\nexport const autoTrends: Trend[] = [\n${newCode},\n];\n`;
  } else {
    // Agregar al array existente: insertar antes del último `];`
    const insertAt = currentContent.lastIndexOf('];');
    updatedContent =
      currentContent.slice(0, insertAt) +
      `\n  // batch-${batchNum} — ${today}\n${newCode},\n\n` +
      currentContent.slice(insertAt);
  }

  fs.writeFileSync(AUTO_FILE, updatedContent, 'utf8');
  console.log(`✅ ${toAdd.length} tendencias agregadas a autoTrends.ts`);
}

// ── 6. Actualizar contador ────────────────────────────────────────────────
counter.nextBatch   = batchNum + 1;
counter.lastUpdated = today;
fs.writeFileSync(COUNTER_FILE, JSON.stringify(counter, null, 2), 'utf8');
console.log(`Próximo batch: ${batchNum + 1}`);
