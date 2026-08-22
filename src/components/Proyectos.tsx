import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square, Upload, FileUp, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { projectsData, type Project } from '../data/projects';

// Para conectar Google Sheets en el futuro, pega aquí el URL CSV publicado:
// const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/.../export?format=csv';

// ── Wellness score ────────────────────────────────────────────────────────────
// Compara claims e ingredientes contra tendencias globales de wellness (0-100)
// ── Índice de Valor de Posicionamiento (IVP) ─────────────────────────────────
// Basado en estudios Nielsen/Mintel/IFIC sobre disposición a pagar por claim
// en categoría lácteos y alimentos funcionales (mercado LatAm + global)
const CLAIM_PREMIUM: [string, number][] = [
  ['probióticos',        22],  // gut health — mayor premium en dairy (Mintel 2024)
  ['prebióticos',        18],
  ['alto en proteína',   18],  // protein trend — top 3 en compra (Nielsen 2024)
  ['proteína',           12],
  ['sin azúcar añadida', 15],  // reducción azúcar — #1 clean label (IFIC 2023)
  ['sin azúcar',         12],
  ['sin octógonos',      14],  // LatAm: fuerte driver de compra (Kantar 2023)
  ['colágeno',           16],  // beauty-from-within — alto premium (Euromonitor)
  ['omega-3',            14],
  ['deslactosado',       10],
  ['sin conservantes',   10],
  ['sin colorantes',      8],
  ['sin aditivos',       10],
  ['vitamina',            7],
  ['calcio',              6],
  ['fibra',               8],
  ['sin gluten',          8],
  ['descremado',          6],
  ['0% grasa',            7],
  ['natural',             5],
  ['vegano',              9],
  ['plant-based',         9],
  ['liofilizado',         7],
  ['magnesio',            6],
  ['antioxidante',        8],
  ['vitamina c',          7],
  ['vitamina d',          7],
  ['fos',                 8],
];

const CLAIM_NEGATIVE: [string, number][] = [
  ['azúcar refinada',       -12],
  ['aceite de palma',       -10],
  ['conservante',            -8],
  ['colorante artificial',   -9],
  ['saborizante artificial', -7],
];

// IVP: pondera la combinación de claims, no solo la suma (diminishing returns)
function calcIVP(claims: string[]): number {
  if (claims.length === 0) return 0;
  const text = claims.join(' ').toLowerCase();
  let raw = 0;
  for (const [kw, pts] of CLAIM_PREMIUM) if (text.includes(kw)) raw += pts;
  for (const [kw, pts] of CLAIM_NEGATIVE) if (text.includes(kw)) raw += pts;
  // Normalizar: tope teórico ~120 pts → escalar a 100
  return Math.min(100, Math.max(0, Math.round((raw / 120) * 100)));
}

// Score wellness para headers de ingredientes / nutricional
const WELLNESS_POSITIVE = CLAIM_PREMIUM;
const WELLNESS_NEGATIVE = CLAIM_NEGATIVE;

function wellnessScore(claims: string[], ingredientes: string): number {
  const text = [...claims, ingredientes].join(' ').toLowerCase();
  let score = 45;
  for (const [kw, pts] of WELLNESS_POSITIVE) if (text.includes(kw)) score += pts;
  for (const [kw, pts] of WELLNESS_NEGATIVE) if (text.includes(kw)) score += pts;
  return Math.min(100, Math.max(0, Math.round((score / 120) * 100)));
}

function WellnessBadge({ score }: { score: number }) {
  const color = score >= 75 ? '#16A34A' : score >= 55 ? '#2563EB' : score >= 35 ? '#D97706' : '#DC2626';
  const label = score >= 75 ? 'Alta' : score >= 55 ? 'Buena' : score >= 35 ? 'Media' : 'Baja';
  return (
    <span style={{
      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px',
      background: 'rgba(255,255,255,0.12)', borderRadius: '6px', padding: '2px 8px',
    }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color }}>{score}</span>
      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>/100 · {label} alineación wellness</span>
    </span>
  );
}

// ── Excel import ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'proyectos-custom-data';

function fmtDate(d: unknown): string {
  if (d instanceof Date) {
    const m = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${m[d.getMonth()]}-${String(d.getFullYear()).slice(2)}`;
  }
  return d ? String(d).trim() : '';
}

function parseMarca(familia: string): Project['marca'] {
  const u = familia.toUpperCase();
  if (u.includes('STRAAL')) return 'straal';
  if (u.includes('B&D') || u.includes('B AND D') || u.includes('BD')) return 'byd';
  return 'tigo';
}

function parseExcelFile(buffer: ArrayBuffer): Project[] {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = wb.SheetNames.includes('Hoja2') ? 'Hoja2' : wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(ws, { header: 1, defval: null });

  const projects: Project[] = [];
  const counter: Record<string, number> = { tigo: 0, straal: 0, byd: 0 };
  let currentFamilia = '';
  let currentMarca: Project['marca'] = 'tigo';
  let inData = false;
  let skipNext = false; // skip stage-name row right after header

  for (const row of rows) {
    // Detect header row by presence of FAMILIA and PROYECTO columns
    if (!inData) {
      if (row && row.some(c => String(c ?? '').toUpperCase().trim() === 'FAMILIA') &&
                 row.some(c => String(c ?? '').toUpperCase().trim() === 'PROYECTO')) {
        inData = true;
        skipNext = true;
      }
      continue;
    }
    if (skipNext) { skipNext = false; continue; }
    if (!row || !row.some(v => v !== null && v !== undefined && v !== '')) continue;

    const familia = row[3];
    const nombre  = row[4];
    const objetivo = row[5];
    const claimsRaw = row[6];
    const etapas = Array.from({ length: 11 }, (_, k) => Boolean(row[7 + k]));
    const fecha  = row[20];

    if (familia) {
      currentFamilia = String(familia).trim()
        .replace(/\n/g, ' ').replace(/  +/g, ' ');
      currentMarca = parseMarca(currentFamilia);
    }
    if (!nombre) continue;

    const marca = currentMarca;
    counter[marca] = (counter[marca] ?? 0) + 1;
    const prefix = marca === 'straal' ? 's' : marca === 'byd' ? 'b' : 't';
    const id = `${prefix}${String(counter[marca]).padStart(2, '0')}`;

    const claims = claimsRaw
      ? String(claimsRaw).split(',').map(c => c.trim().replace(/\n/g, ' ')).filter(Boolean)
          .map(c => c.charAt(0).toUpperCase() + c.slice(1))
      : [];

    projects.push({
      id, marca, familia: currentFamilia,
      nombre: String(nombre).trim().replace(/\n/g, ' '),
      objetivo: objetivo ? String(objetivo).replace(/\n/g, ' ').trim() : '',
      claims, fecha: fmtDate(fecha), etapas, ingredientes: '',
    });
  }
  return projects;
}

const STAGES = [
  'Diseño de nuevo producto · Brief',
  'Aprobación de prototipo laboratorio',
  'Costeo de producto',
  'Aprobación de prototipo semiindustrial',
  'Aprobación de la fórmula',
  'Análisis en laboratorio externo',
  'Elaboración del proyecto de rotulado',
  'Obtención de registro sanitario',
  'Aprobación final del arte',
  'Ficha técnica I+D',
  'Seguimiento primera producción',
];

const BRAND_BADGE: Record<Project['marca'], string> = {
  tigo:   'bg-blue-600 text-white',
  straal: 'bg-orange-500 text-white',
  byd:    'bg-violet-600 text-white',
};
const BRAND_LABEL: Record<Project['marca'], string> = {
  tigo: 'TIGO', straal: 'Straal', byd: 'B&D',
};
const BRAND_FILTER_ACTIVE: Record<string, string> = {
  todas:  'bg-slate-800 text-white border-slate-800',
  tigo:   'bg-blue-600 text-white border-blue-600',
  straal: 'bg-orange-500 text-white border-orange-500',
  byd:    'bg-violet-600 text-white border-violet-600',
};

// ── Expand panel ──────────────────────────────────────────────────────────────
function ExpandPanel({
  project, photos, onPhotoChange,
}: {
  project: Project;
  photos: Record<string, string>;
  onPhotoChange: (id: string, url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const done   = project.etapas.filter(Boolean).length;
  const pct    = Math.round((done / project.etapas.length) * 100);
  const ivp    = calcIVP(project.claims);
  const wscore = wellnessScore(project.claims, project.ingredientes);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(project.id, reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col md:grid gap-5 bg-slate-50/60 border-t border-slate-100 p-4 md:p-5 md:pl-16"
         style={{ gridTemplateColumns: '3fr 2fr' }}>
      {/* ── Izquierda ── */}
      <div className="flex flex-col gap-3">

        {/* Foto + Claims */}
        <div className="flex flex-col md:grid gap-4" style={{ gridTemplateColumns: '160px 1fr' }}>

          {/* Foto */}
          <div>
            {photos[project.id] ? (
              <img
                src={photos[project.id]}
                alt={project.nombre}
                className="w-full md:w-40 h-40 rounded-xl object-cover border border-slate-200 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full md:w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <Upload size={20} className="text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-400">Subir foto</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <p className="text-[11px] text-slate-400 mt-1.5">
              {done}/{project.etapas.length} etapas · <strong className="text-slate-600">{pct}%</strong>
            </p>
          </div>

          {/* Objetivo + Claims */}
          <div>
            {project.objetivo && (
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">{project.objetivo}</p>
            )}
            <div className="flex items-center mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Claims del producto</p>
              <span style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 800,
                  color: ivp >= 75 ? '#16A34A' : ivp >= 55 ? '#2563EB' : ivp >= 35 ? '#D97706' : '#DC2626',
                }}>{ivp}</span>
                <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>/100 IVP</span>
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {project.claims.map((c, i) => (
                <span key={i} className="inline-block w-fit text-[10.5px] font-semibold bg-slate-800 text-white px-2.5 py-1 rounded-md">
                  {c}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Ingredientes + Nutricional lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="px-3.5 py-2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider flex items-center">
              Lista de ingredientes
              <WellnessBadge score={wscore} />
            </div>
            <p className="px-3.5 py-3 text-xs text-slate-500 leading-relaxed italic min-h-[60px]">
              {project.ingredientes || 'Pendiente confirmar con I+D'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
            <div className="px-3.5 py-2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider flex items-center">
              Tabla nutricional
              <WellnessBadge score={wscore} />
            </div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <td className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Por porción (100 g)</td>
                  <td className="px-2 py-1.5 text-[10px] font-bold text-slate-400 text-center">% VD*</td>
                  <td className="px-3 py-1.5 text-[10px] font-bold text-slate-400 text-right">Valor</td>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Energía',        '',    '— kcal', false],
                  ['Proteínas',      '—%',  '— g',    false],
                  ['Grasa total',    '—%',  '— g',    false],
                  ['Grasa saturada', '—%',  '— g',    true],
                  ['Carbohidratos',  '—%',  '— g',    false],
                  ['Azúcares',       '',    '— g',    true],
                  ['Sodio',          '—%',  '— mg',   false],
                  ['Calcio',         '—%',  '— mg',   false],
                ].map(([name, vd, val, sub], i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-1 text-slate-700" style={sub ? { paddingLeft: '22px', fontWeight: 400, fontSize: '11px', color: '#94a3b8' } : { fontWeight: 600 }}>
                      {name}
                    </td>
                    <td className="px-2 py-1 text-center text-slate-400">{vd}</td>
                    <td className="px-3 py-1 text-right font-semibold text-slate-600">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 py-1.5 text-[10px] text-slate-400 italic border-t border-slate-100 bg-slate-50">
              *Valores diarios de referencia. Pendiente análisis de laboratorio.
            </p>
          </div>

        </div>
      </div>

      {/* ── Derecha: Etapas ── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Etapa del Proyecto</p>
        <div className="flex flex-col gap-1.5">
          {STAGES.map((name, i) => {
            const ok = project.etapas[i];
            return (
              <div
                key={i}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs ${
                  ok ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'
                }`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                  ok ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>{i + 1}</span>
                <span className={`flex-1 leading-snug ${ok ? 'text-green-700 font-semibold' : 'text-slate-700 font-medium'}`}>
                  {name}
                </span>
                {ok
                  ? <CheckSquare size={14} className="text-green-500 flex-shrink-0" />
                  : <Square      size={14} className="text-slate-300 flex-shrink-0" />
                }
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ── Project table ─────────────────────────────────────────────────────────────
function ProjectTable({
  title, projects, photos, onPhotoChange, onDelete,
}: {
  title: string;
  projects: Project[];
  photos: Record<string, string>;
  onPhotoChange: (id: string, url: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (projects.length === 0) return null;

  const expandedProject = expanded ? projects.find(p => p.id === expanded) ?? null : null;

  return (
    <section className="mb-8">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">{title}</h3>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Scrollable table — only rows, no expand panel inside */}
        <div className="overflow-x-auto">
        <div style={{ minWidth: '960px' }}>

        {/* Header */}
        <div
          className="grid text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-200"
          style={{ gridTemplateColumns: '2rem 1fr 120px 5.5rem repeat(11, 1.75rem) 3.5rem 2.5rem' }}
        >
          <div />
          <div className="px-4 py-2.5">Producto</div>
          <div className="py-2.5">Familia</div>
          <div className="py-2.5">Fecha</div>
          {STAGES.map((s, i) => (
            <div key={i} className="py-2.5 text-center" title={s}>{i + 1}</div>
          ))}
          <div className="py-2.5 text-center">%</div>
          <div />
        </div>

        {/* Rows */}
        {projects.map((p) => {
          const done = p.etapas.filter(Boolean).length;
          const pct  = Math.round((done / p.etapas.length) * 100);
          const open = expanded === p.id;

          return (
            <div
              key={p.id}
              className={`grid items-center border-b border-slate-100 last:border-0 transition-colors ${open ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
              style={{ gridTemplateColumns: '2rem 1fr 120px 5.5rem repeat(11, 1.75rem) 3.5rem 2.5rem' }}
            >
              {/* Expandir — toda la fila excepto el botón eliminar */}
              <div className="contents cursor-pointer" onClick={() => setExpanded(open ? null : p.id)}>
                <div className="flex items-center justify-center py-3 pl-2">
                  {open
                    ? <ChevronDown  size={13} className="text-blue-500" />
                    : <ChevronRight size={13} className="text-slate-400" />
                  }
                </div>

                <div className="px-4 py-3 flex items-center gap-2 min-w-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${BRAND_BADGE[p.marca]}`}>
                    {BRAND_LABEL[p.marca]}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 truncate">{p.nombre}</span>
                </div>

                <div className="py-3 text-xs text-slate-500 truncate pr-2">{p.familia}</div>
                <div className="py-3 text-xs text-slate-500">{p.fecha}</div>

                {p.etapas.map((v, i) => (
                  <div key={i} className="flex items-center justify-center">
                    {v ? (
                      <div className="w-3.5 h-3.5 rounded-sm bg-green-500 flex items-center justify-center">
                        <svg viewBox="0 0 10 8" className="w-2 h-2 fill-white">
                          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-sm border border-slate-300" />
                    )}
                  </div>
                ))}

                <div className="text-center pr-2">
                  <span className={`text-[10px] font-bold ${
                    pct === 100 ? 'text-green-600' : pct >= 50 ? 'text-blue-600' : 'text-slate-400'
                  }`}>{pct}%</span>
                </div>
              </div>

              {/* Botón eliminar */}
              <div className="flex items-center justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar "${p.nombre}"?`)) onDelete(p.id); }}
                  className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                  title="Eliminar producto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
        </div>
        </div>

        {/* Expand panel — OUTSIDE the scrollable area, full width */}
        {expandedProject && (
          <ExpandPanel project={expandedProject} photos={photos} onPhotoChange={onPhotoChange} />
        )}
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
type FilterMarca = 'todas' | Project['marca'];

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Project[];
  } catch { /* fallback */ }
  return projectsData;
}

export function Proyectos() {
  const [filter,   setFilter]   = useState<FilterMarca>('todas');
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('proyectos-fotos') ?? '{}'); } catch { return {}; }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCustom = localStorage.getItem(STORAGE_KEY) !== null;

  function handlePhotoChange(id: string, url: string) {
    const next = { ...photos, [id]: url };
    setPhotos(next);
    localStorage.setItem('proyectos-fotos', JSON.stringify(next));
  }

  function handleDelete(id: string) {
    const next = projects.filter(p => p.id !== id);
    setProjects(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function handleReset() {
    if (!confirm('¿Restablecer datos originales? Se perderán los cambios importados.')) return;
    localStorage.removeItem(STORAGE_KEY);
    setProjects(projectsData);
    setImportMsg(null);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseExcelFile(ev.target!.result as ArrayBuffer);
        if (parsed.length === 0) throw new Error('No se encontraron proyectos en el archivo.');
        setProjects(parsed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        setImportMsg({ type: 'ok', text: `${parsed.length} proyectos cargados correctamente.` });
      } catch (err) {
        setImportMsg({ type: 'error', text: `Error al leer el archivo: ${(err as Error).message}` });
      }
      setTimeout(() => setImportMsg(null), 5000);
    };
    reader.readAsArrayBuffer(file);
  }

  const all    = projects;
  const shown  = filter === 'todas' ? all : all.filter(p => p.marca === filter);
  const tigo   = shown.filter(p => p.marca === 'tigo');
  const straal = shown.filter(p => p.marca === 'straal');
  const byd    = shown.filter(p => p.marca === 'byd');

  const totalDone  = all.reduce((s, p) => s + p.etapas.filter(Boolean).length, 0);
  const totalSteps = all.reduce((s, p) => s + p.etapas.length, 0);
  const globalPct  = totalSteps > 0 ? Math.round((totalDone / totalSteps) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Proyectos I+D</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {all.length} proyectos activos · <strong className="text-slate-600">{globalPct}% avance global</strong>
          </p>
        </div>

        {/* Stats rápidos */}
        <div className="flex gap-3">
          {(['tigo','straal','byd'] as Project['marca'][]).map(m => {
            const ps = all.filter(p => p.marca === m);
            const pct = ps.length
              ? Math.round(ps.reduce((s,p) => s + p.etapas.filter(Boolean).length, 0) /
                           ps.reduce((s,p) => s + p.etapas.length, 0) * 100)
              : 0;
            return (
              <div key={m} className="text-center px-4 py-2 rounded-xl border border-slate-200 bg-white">
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                  m==='tigo' ? 'text-blue-600' : m==='straal' ? 'text-orange-500' : 'text-violet-600'
                }`}>{BRAND_LABEL[m]}</div>
                <div className="text-lg font-bold text-slate-800">{pct}%</div>
                <div className="text-[10px] text-slate-400">{ps.length} proyectos</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de importación */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          <FileUp size={13} />
          Importar Excel
        </button>
        {isCustom && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw size={13} />
            Restablecer datos originales
          </button>
        )}
        {importMsg && (
          <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
            importMsg.type === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <AlertCircle size={12} />
            {importMsg.text}
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {(['todas','tigo','straal','byd'] as FilterMarca[]).map(m => (
          <button
            key={m}
            onClick={() => setFilter(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filter === m
                ? BRAND_FILTER_ACTIVE[m]
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {m === 'todas' ? 'Todas las marcas' : BRAND_LABEL[m as Project['marca']]}
          </button>
        ))}
      </div>

      {/* Tablas */}
      <ProjectTable title="TIGO"   projects={tigo}   photos={photos} onPhotoChange={handlePhotoChange} onDelete={handleDelete} />
      <ProjectTable title="Straal" projects={straal} photos={photos} onPhotoChange={handlePhotoChange} onDelete={handleDelete} />
      <ProjectTable title="B&D"    projects={byd}    photos={photos} onPhotoChange={handlePhotoChange} onDelete={handleDelete} />

    </div>
  );
}
