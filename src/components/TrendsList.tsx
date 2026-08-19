import { useTrendStore } from '../store/useTrendStore';
import { TrendCard } from './TrendCard';
import { Filters } from './Filters';

export function TrendsList({ onlyFavorites = false }: { onlyFavorites?: boolean }) {
  const { getFilteredTrends, trends } = useTrendStore();

  const base = onlyFavorites
    ? [...trends].filter((t) => t.isFavorite).sort((a, b) => b.score - a.score)
    : getFilteredTrends();

  return (
    <div>
      {!onlyFavorites && <Filters />}
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-700">
            {onlyFavorites ? 'Tendencias favoritas' : 'Todas las tendencias'}
          </h2>
          <span className="text-sm text-slate-400">{base.length} resultados</span>
        </div>

        {base.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium">No se encontraron tendencias</div>
            <div className="text-sm mt-1">Prueba cambiando los filtros</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {base.map((t) => (
              <TrendCard key={t.id} trend={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
