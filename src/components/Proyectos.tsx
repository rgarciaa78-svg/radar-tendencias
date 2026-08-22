import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckSquare, Square, Upload } from 'lucide-react';
import { projectsData, type Project } from '../data/projects';

// Para conectar Google Sheets en el futuro, pega aquí el URL CSV publicado:
// const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/.../export?format=csv';

// ── Wellness score ────────────────────────────────────────────────────────────
// Compara claims e ingredientes contra tendencias globales de wellness (0-100)
const WELLNESS_POSITIVE = [
  ['sin azúcar añadida', 12], ['sin azúcar', 10], ['sin octógonos', 10],
  ['probióticos', 9], ['prebióticos', 8], ['sin conservantes', 8],
  ['deslactosado', 6], ['sin colorantes', 6], ['sin gluten', 6],
  ['omega-3', 8], ['colágeno', 6], ['vitamina', 5], ['alto en proteína', 7],
  ['proteína', 5], ['calcio', 4], ['fibra', 6], ['natural', 5],
  ['descremado', 5], ['0% grasa', 5], ['sin aditivos', 7], ['vegano', 6],
  ['plant-based', 6], ['liofilizado', 5], ['andino', 4], ['peruano', 3],
] as [string, number][];

const WELLNESS_NEGATIVE = [
  ['azúcar refinada', -10], ['conservante', -8], ['colorante artificial', -8],
  ['saborizante artificial', -6], ['aceite de palma', -7],
] as [string, number][];

function wellnessScore(claims: string[], ingredientes: string): number {
  const text = [...claims, ingredientes].join(' ').toLowerCase();
  let score = 45;
  for (const [kw, pts] of WELLNESS_POSITIVE) if (text.includes(kw)) score += pts;
  for (const [kw, pts] of WELLNESS_NEGATIVE) if (text.includes(kw)) score += pts;
  return Math.min(100, Math.max(0, score));
}

function claimScore(claim: string): number {
  const t = claim.toLowerCase();
  let s = 40;
  for (const [kw, pts] of WELLNESS_POSITIVE) if (t.includes(kw)) s += pts;
  for (const [kw, pts] of WELLNESS_NEGATIVE) if (t.includes(kw)) s += pts;
  return Math.min(100, Math.max(0, s));
}

function ClaimScoreDot({ score }: { score: number }) {
  const color = score >= 80 ? '#16A34A' : score >= 65 ? '#2563EB' : score >= 50 ? '#D97706' : '#DC2626';
  return (
    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: '9px', fontWeight: 700, color }}>{score}</span>
    </span>
  );
}

function WellnessBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#16A34A' : score >= 65 ? '#2563EB' : score >= 50 ? '#D97706' : '#DC2626';
  const label = score >= 80 ? 'Alta' : score >= 65 ? 'Buena' : score >= 50 ? 'Media' : 'Baja';
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
  const done  = project.etapas.filter(Boolean).length;
  const pct   = Math.round((done / project.etapas.length) * 100);
  const wscore = wellnessScore(project.claims, project.ingredientes);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(project.id, reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div
      className="grid gap-5 bg-slate-50/60 border-t border-slate-100"
      style={{ gridTemplateColumns: '3fr 2fr', padding: '20px 24px 24px 72px' }}
    >
      {/* ── Izquierda ── */}
      <div className="flex flex-col gap-3">

        {/* Foto + Claims */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '160px 1fr' }}>

          {/* Foto */}
          <div>
            {photos[project.id] ? (
              <img
                src={photos[project.id]}
                alt={project.nombre}
                className="w-40 h-40 rounded-xl object-cover border border-slate-200 cursor-pointer"
                onClick={() => fileRef.current?.click()}
              />
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-colors"
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Claims del producto</p>
            <div className="flex flex-col gap-1.5">
              {project.claims.map((c, i) => (
                <span key={i} className="flex items-center justify-between gap-3 text-[10.5px] font-semibold bg-slate-800 text-white px-2.5 py-1 rounded-md">
                  <span>{c}</span>
                  <ClaimScoreDot score={claimScore(c)} />
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Ingredientes + Nutricional lado a lado */}
        <div className="grid grid-cols-2 gap-3">

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
  title, projects, photos, onPhotoChange,
}: {
  title: string;
  projects: Project[];
  photos: Record<string, string>;
  onPhotoChange: (id: string, url: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (projects.length === 0) return null;

  return (
    <section className="mb-8">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">{title}</h3>
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">

        {/* Header */}
        <div
          className="grid text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-200"
          style={{ gridTemplateColumns: '2rem 1fr 120px 5.5rem repeat(11, 1.75rem) 3.5rem' }}
        >
          <div />
          <div className="px-4 py-2.5">Producto</div>
          <div className="py-2.5">Familia</div>
          <div className="py-2.5">Fecha</div>
          {STAGES.map((s, i) => (
            <div key={i} className="py-2.5 text-center" title={s}>{i + 1}</div>
          ))}
          <div className="py-2.5 text-center">%</div>
        </div>

        {/* Rows */}
        {projects.map((p) => {
          const done = p.etapas.filter(Boolean).length;
          const pct  = Math.round((done / p.etapas.length) * 100);
          const open = expanded === p.id;

          return (
            <div key={p.id} className="border-b border-slate-100 last:border-0">
              <div
                className="grid items-center cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ gridTemplateColumns: '2rem 1fr 120px 5.5rem repeat(11, 1.75rem) 3.5rem' }}
                onClick={() => setExpanded(open ? null : p.id)}
              >
                <div className="flex items-center justify-center py-3 pl-2">
                  {open
                    ? <ChevronDown  size={13} className="text-slate-400" />
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

              {open && (
                <ExpandPanel project={p} photos={photos} onPhotoChange={onPhotoChange} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
type FilterMarca = 'todas' | Project['marca'];

export function Proyectos() {
  const [filter, setFilter] = useState<FilterMarca>('todas');
  const [photos, setPhotos] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('proyectos-fotos') ?? '{}'); } catch { return {}; }
  });

  function handlePhotoChange(id: string, url: string) {
    const next = { ...photos, [id]: url };
    setPhotos(next);
    localStorage.setItem('proyectos-fotos', JSON.stringify(next));
  }

  const all    = projectsData;
  const shown  = filter === 'todas' ? all : all.filter(p => p.marca === filter);
  const tigo   = shown.filter(p => p.marca === 'tigo');
  const straal = shown.filter(p => p.marca === 'straal');
  const byd    = shown.filter(p => p.marca === 'byd');

  const totalDone  = all.reduce((s, p) => s + p.etapas.filter(Boolean).length, 0);
  const totalSteps = all.reduce((s, p) => s + p.etapas.length, 0);
  const globalPct  = Math.round((totalDone / totalSteps) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
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
      <ProjectTable title="TIGO"   projects={tigo}   photos={photos} onPhotoChange={handlePhotoChange} />
      <ProjectTable title="Straal" projects={straal} photos={photos} onPhotoChange={handlePhotoChange} />
      <ProjectTable title="B&D"    projects={byd}    photos={photos} onPhotoChange={handlePhotoChange} />

    </div>
  );
}
