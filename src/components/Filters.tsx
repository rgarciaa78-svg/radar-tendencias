import { Search, RotateCcw, Heart } from 'lucide-react';
import { useTrendStore } from '../store/useTrendStore';
import type { Region, Brand, Category, Priority, Status } from '../types';

const REGIONS: (Region | 'Todas')[] = ['Todas', 'Europa', 'Estados Unidos', 'Asia', 'Latam', 'Global'];
const BRANDS: (Brand | 'Todas')[] = ['Todas', 'TIGO', 'B&D', 'Straal', 'Nueva marca'];
const PRIORITIES: (Priority | 'Todas')[] = ['Todas', 'Alta', 'Media', 'Baja'];
const STATUSES: (Status | 'Todas')[] = ['Todas', 'Detectada', 'En evaluación', 'En prototipo', 'Descartada', 'Lista para lanzar'];
const CATEGORIES: (Category | 'Todas')[] = [
  'Todas',
  'Yogurt y yogurt griego',
  'Alimentos altos en proteína',
  'Agua funcional y proteica',
  'Proteína RTD',
  'Leches vegetales',
  'Salud digestiva',
  'Probióticos y prebióticos',
  'Kombucha y fermentados',
  'Salsas y condimentos',
  'Sabores globales',
  'Nutrición deportiva',
  'Bebidas energéticas limpias',
  'Bebidas funcionales',
  'Colágeno y belleza',
  'Nootropics y cognición',
  'Nutrición femenina',
  'Longevidad y antiaging',
  'Snacks saludables',
  'Empaques sostenibles',
  'Formatos on-the-go',
];

export function Filters() {
  const { filters, setFilters, resetFilters } = useTrendStore();

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar tendencia..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 w-48"
          />
        </div>

        <Select label="Región" value={filters.region} options={REGIONS} onChange={(v) => setFilters({ region: v as any })} />
        <Select label="Marca" value={filters.brand} options={BRANDS} onChange={(v) => setFilters({ brand: v as any })} />
        <Select label="Prioridad" value={filters.priority} options={PRIORITIES} onChange={(v) => setFilters({ priority: v as any })} />
        <Select label="Estado" value={filters.status} options={STATUSES} onChange={(v) => setFilters({ status: v as any })} />
        <Select label="Categoría" value={filters.category} options={CATEGORIES} onChange={(v) => setFilters({ category: v as any })} />

        <button
          onClick={() => setFilters({ onlyFavorites: !filters.onlyFavorites })}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${
            filters.onlyFavorites
              ? 'bg-red-50 border-red-300 text-red-600'
              : 'border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-500'
          }`}
        >
          <Heart size={13} fill={filters.onlyFavorites ? 'currentColor' : 'none'} />
          Favoritos
        </button>

        <button
          onClick={resetFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <RotateCcw size={13} />
          Limpiar
        </button>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 bg-white text-slate-600"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === 'Todas' ? `${label}: Todas` : o}
        </option>
      ))}
    </select>
  );
}
