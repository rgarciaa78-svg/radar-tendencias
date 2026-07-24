import { useState } from 'react';
import { X, MapPin, Calendar, Star, Lightbulb, Target, Users, MessageSquare, TrendingUp, BarChart3, Clock, DollarSign } from 'lucide-react';
import type { Launch } from '../types';
import { ScoreRing } from './ScoreRing';

const BRAND_BADGE: Record<string, string> = {
  TIGO:   'bg-blue-600 text-white',
  'B&D':  'bg-violet-600 text-white',
  Straal: 'bg-orange-500 text-white',
};

const REGION_FLAGS: Record<string, string> = {
  Europa: '🇪🇺', 'Estados Unidos': '🇺🇸', Asia: '🌏', Latam: '🌎', Global: '🌐',
};

type Tab = 'detalle' | 'brief';

interface Props {
  launch: Launch;
  onClose: () => void;
}

export function LaunchModal({ launch, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('detalle');

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BRAND_BADGE[launch.interestedBrand]}`}>
              {launch.interestedBrand}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {launch.category}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Title + Score */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-1">{launch.productName}</h2>
              <p className="text-sm text-slate-500 font-medium mb-2">{launch.company}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin size={11} />{launch.market} {REGION_FLAGS[launch.region]}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} />{launch.launchDate.substring(0, 7)}
                </span>
              </div>
            </div>
            <ScoreRing score={launch.score} size={60} />
          </div>

          <div className="flex flex-wrap gap-1 mb-5">
            {launch.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl">
            {(['detalle', 'brief'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={(e) => { e.stopPropagation(); setTab(t); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'detalle' ? 'Lanzamiento' : 'Brief de implementación'}
              </button>
            ))}
          </div>

          {/* Tab: Lanzamiento */}
          {tab === 'detalle' && (
            <div className="space-y-4">
              <section className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Descripción</div>
                <p className="text-sm text-slate-700 leading-relaxed">{launch.description}</p>
              </section>
              <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star size={12} className="text-amber-600" />
                  <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Qué tiene de nuevo</div>
                </div>
                <p className="text-sm text-amber-900 leading-relaxed">{launch.whatIsNew}</p>
              </section>
              <section className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb size={12} className="text-green-600" />
                  <div className="text-xs font-semibold text-green-700 uppercase tracking-wide">Relevancia para Perú</div>
                </div>
                <p className="text-sm text-green-900 leading-relaxed">{launch.peruRelevance}</p>
              </section>
            </div>
          )}

          {/* Tab: Brief */}
          {tab === 'brief' && (
            !launch.brief ? (
              <div className="text-center py-10 text-slate-400">
                <div className="text-3xl mb-2">📋</div>
                <div className="font-medium">Brief no disponible</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Target size={13} />
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-80">Objetivo</span>
                  </div>
                  <p className="text-sm leading-relaxed">{launch.brief.objetivo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={12} className="text-purple-600" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Público</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{launch.brief.publicoObjetivo}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={12} className="text-blue-600" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mensaje clave</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">"{launch.brief.mensajeClave}"</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={12} className="text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Posicionamiento</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">{launch.brief.posicionamiento}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={12} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Canales</span>
                  </div>
                  <ul className="space-y-1.5">
                    {launch.brief.canales.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={12} className="text-green-600" />
                      <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Timeline</span>
                    </div>
                    <p className="text-xs text-green-800 leading-relaxed">{launch.brief.timeline}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={12} className="text-slate-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Presupuesto</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{launch.brief.presupuesto}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={12} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">KPIs de éxito</span>
                  </div>
                  <ul className="space-y-1.5">
                    {launch.brief.kpis.map((kpi, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs flex-shrink-0 font-bold">{i + 1}</span>
                        {kpi}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
