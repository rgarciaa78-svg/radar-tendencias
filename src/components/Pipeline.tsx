import { useState } from 'react';
import { ChevronRight, Lightbulb, FlaskConical, Rocket, XCircle, Heart, BarChart3, Tag } from 'lucide-react';
import { useTrendStore } from '../store/useTrendStore';
import type { Status, Brand } from '../types';
import { BrandBadge, PriorityBadge, ComplexityBadge } from './BadgePriority';
import { ScoreRing } from './ScoreRing';

const PIPELINE_STAGES: { status: Status; label: string; icon: typeof Lightbulb; color: string; bg: string; border: string; headerBg: string }[] = [
  { status: 'Detectada',         label: 'Detectada',        icon: Lightbulb,    color: 'text-blue-600',   bg: 'bg-blue-50/60',    border: 'border-blue-200',   headerBg: 'bg-blue-100' },
  { status: 'En evaluación',     label: 'En evaluación',    icon: BarChart3,    color: 'text-purple-600', bg: 'bg-purple-50/60',  border: 'border-purple-200', headerBg: 'bg-purple-100' },
  { status: 'En prototipo',      label: 'En prototipo',     icon: FlaskConical, color: 'text-amber-600',  bg: 'bg-amber-50/60',   border: 'border-amber-200',  headerBg: 'bg-amber-100' },
  { status: 'Lista para lanzar', label: 'Lista para lanzar',icon: Rocket,       color: 'text-green-600',  bg: 'bg-green-50/60',   border: 'border-green-200',  headerBg: 'bg-green-100' },
  { status: 'Descartada',        label: 'Descartada',       icon: XCircle,      color: 'text-slate-400',  bg: 'bg-slate-50',      border: 'border-slate-200',  headerBg: 'bg-slate-100' },
];

const BRAND_OPTIONS: (Brand | 'Todas')[] = ['Todas', 'TIGO', 'B&D', 'Straal'];

export function Pipeline() {
  const { trends, setSelectedTrend, updateStatus, toggleFavorite } = useTrendStore();
  const [brandFilter, setBrandFilter] = useState<Brand | 'Todas'>('Todas');
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  const visibleTrends = [...(brandFilter === 'Todas' ? trends : trends.filter((t) => t.brand === brandFilter))].sort((a, b) => b.score - a.score);
  const totalActive = trends.filter((t) => t.status !== 'Descartada').length;
  const readyToLaunch = trends.filter((t) => t.status === 'Lista para lanzar').length;
  const inProto = trends.filter((t) => t.status === 'En prototipo').length;

  const handleDragStart = (id: string) => setDragId(id);
  const handleDragOver = (e: React.DragEvent, status: Status) => { e.preventDefault(); setDragOverCol(status); };
  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (dragId) updateStatus(dragId, status);
    setDragId(null);
    setDragOverCol(null);
  };
  const handleDragEnd = () => { setDragId(null); setDragOverCol(null); };

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-3 md:px-6 py-3 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {BRAND_OPTIONS.map((b) => (
            <button
              key={b}
              onClick={() => setBrandFilter(b)}
              className={`px-2.5 md:px-3 py-1.5 text-xs md:text-sm font-semibold rounded-lg transition-all ${brandFilter === b ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 md:gap-5 text-xs text-slate-500 flex-wrap">
          <span><span className="font-bold text-slate-700">{totalActive}</span> pipeline</span>
          <span><span className="font-bold text-amber-600">{inProto}</span> prototipo</span>
          <span><span className="font-bold text-green-600">{readyToLaunch}</span> por lanzar</span>
          <span className="text-slate-400 italic hidden lg:block">Arrastra las tarjetas para mover entre etapas</span>
        </div>
      </div>

      {/* Kanban board - horizontal scroll */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 p-5" style={{ minWidth: 'max-content' }}>
          {PIPELINE_STAGES.map(({ status, label, icon: Icon, color, bg, border, headerBg }) => {
            const col = visibleTrends.filter((t) => t.status === status);
            const isOver = dragOverCol === status;
            return (
              <div
                key={status}
                className={`flex flex-col rounded-2xl border-2 transition-all w-64 ${isOver ? 'border-blue-400 ring-2 ring-blue-200' : border} ${bg}`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column header */}
                <div className={`px-4 py-3 flex items-center justify-between rounded-t-xl ${headerBg}`}>
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={color} />
                    <span className={`text-xs font-bold uppercase tracking-wide ${color}`}>{label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border ${border} ${color}`}>{col.length}</span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-3 min-h-[120px]">
                  {col.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-xs text-slate-300 italic border-2 border-dashed border-slate-200 rounded-xl">
                      Sin tendencias
                    </div>
                  )}
                  {col.map((trend) => (
                    <div
                      key={trend.id}
                      draggable
                      onDragStart={() => handleDragStart(trend.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-xl border border-slate-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all select-none ${dragId === trend.id ? 'opacity-40 rotate-1 scale-95' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p
                          className="text-xs font-semibold text-slate-800 leading-tight cursor-pointer hover:text-blue-600 transition-colors flex-1 min-w-0"
                          onClick={() => setSelectedTrend(trend.id)}
                        >
                          {trend.name}
                        </p>
                        <ScoreRing score={trend.score} size={34} />
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        <BrandBadge value={trend.brand} />
                        <PriorityBadge value={trend.priority} />
                      </div>

                      <div className="flex items-center gap-1 mb-2">
                        <Tag size={10} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-400 truncate">{trend.category}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <ComplexityBadge value={trend.complexity} />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(trend.id); }}
                            className={`transition-colors ${trend.isFavorite ? 'text-red-400' : 'text-slate-300 hover:text-red-400'}`}
                          >
                            <Heart size={12} fill={trend.isFavorite ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => setSelectedTrend(trend.id)}
                            className="text-slate-300 hover:text-blue-500 transition-colors"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
