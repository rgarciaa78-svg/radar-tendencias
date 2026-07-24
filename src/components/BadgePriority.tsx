import type { Priority, Complexity, Status } from '../types';

export function PriorityBadge({ value }: { value: Priority }) {
  const styles: Record<Priority, string> = {
    Alta: 'bg-red-100 text-red-700',
    Media: 'bg-amber-100 text-amber-700',
    Baja: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[value]}`}>
      {value}
    </span>
  );
}

export function ComplexityBadge({ value }: { value: Complexity }) {
  const styles: Record<Complexity, string> = {
    Baja: 'bg-green-100 text-green-700',
    Media: 'bg-amber-100 text-amber-700',
    Alta: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[value]}`}>
      Complejidad {value}
    </span>
  );
}

export function StatusBadge({ value }: { value: Status }) {
  const styles: Record<Status, string> = {
    Detectada: 'bg-blue-100 text-blue-700',
    'En evaluación': 'bg-purple-100 text-purple-700',
    'En prototipo': 'bg-amber-100 text-amber-700',
    Descartada: 'bg-slate-100 text-slate-500',
    'Lista para lanzar': 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[value]}`}>
      {value}
    </span>
  );
}

export function BrandBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    TIGO: 'bg-blue-600 text-white',
    'B&D': 'bg-violet-600 text-white',
    Straal: 'bg-orange-500 text-white',
    'Nueva marca': 'bg-teal-600 text-white',
    Todas: 'bg-slate-600 text-white',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles[value] ?? 'bg-slate-200 text-slate-700'}`}>
      {value}
    </span>
  );
}
