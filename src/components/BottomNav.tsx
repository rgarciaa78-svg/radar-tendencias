import { LayoutDashboard, Rocket, TrendingUp, Globe, Heart, Megaphone } from 'lucide-react';
import { useTrendStore } from '../store/useTrendStore';

const NAV = [
  { view: 'dashboard',    label: 'Inicio',       icon: LayoutDashboard },
  { view: 'lanzamientos', label: 'Lanzamientos', icon: Rocket },
  { view: 'tendencias',   label: 'Tendencias',   icon: TrendingUp },
  { view: 'globales',     label: 'Globales',     icon: Globe },
  { view: 'campañas',     label: 'Campañas',     icon: Megaphone },
  { view: 'favoritos',    label: 'Favoritos',    icon: Heart },
] as const;

export function BottomNav() {
  const { activeView, setActiveView } = useTrendStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex items-stretch">
      {NAV.map(({ view, label, icon: Icon }) => {
        const active = activeView === view;
        return (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span className={`text-[10px] font-semibold leading-tight ${active ? 'text-blue-600' : 'text-slate-400'}`}>
              {label}
            </span>
            {active && <div className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />}
          </button>
        );
      })}
    </nav>
  );
}
