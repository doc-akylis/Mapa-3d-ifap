import React, { useState } from 'react';
import { VISUAL_LANDMARKS, NAVIGATION_STEPS } from '../data/campusData';
import { CampusGpsMap } from './CampusGpsMap';

interface RotasScreenProps {
  initialDestination?: string;
  onShowToast: (message: string, icon?: string) => void;
}

export const RotasScreen: React.FC<RotasScreenProps> = ({
  initialDestination = 'Lab. de Informática 03 (Bloco C • 1º Andar)',
  onShowToast,
}) => {
  const [origin, setOrigin] = useState('Portaria Principal / Entrada Rodovia');
  const [destination, setDestination] = useState(initialDestination);
  const [routeMode, setRouteMode] = useState<'rapida' | 'acessivel' | 'coberta'>('rapida');
  const [viewStyle, setViewStyle] = useState<'satellite-gps' | 'diagram-steps'>('satellite-gps');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isExpandedMap, setIsExpandedMap] = useState(false);

  const handleSwapRoute = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    onShowToast('Origem e destino invertidos', 'swap_vert');
  };

  const handleUseGps = () => {
    setOrigin('Minha Localização Atual (Próximo à Guarita)');
    onShowToast('GPS conectado: Guarita Principal', 'my_location');
  };

  const handleStartNavigation = () => {
    if (isNavigating) {
      setIsNavigating(false);
      onShowToast('Navegação guiada finalizada.', 'stop_circle');
      return;
    }

    setIsNavigating(true);
    setCurrentStepIndex(0);
    onShowToast('Iniciando navegação passo a passo!', 'navigation');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Rota IFAP Campus Macapá: De "${origin}" até "${destination}". Rota: ${
        routeMode === 'rapida' ? 'Mais Rápida (3 min)' : routeMode === 'acessivel' ? '100% Plana (4 min)' : 'Sombra/Chuva (4 min)'
      }. Siga as instruções pelo app Mapa IFAP.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-28">
      {/* Subheader Tracker Status */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-[16px]">directions_walk</span>
            </span>
            <span className="text-[11px] uppercase tracking-wider text-secondary font-bold">
              Trajetos do Campus
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-medium border border-outline-variant/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>GPS Campus Ativo</span>
          </div>
        </div>
      </div>

      {/* Origin & Destination Card */}
      <div className="px-4 py-1.5">
        <div className="bg-surface-container-lowest rounded-xl shadow-md p-4 relative overflow-hidden border border-outline-variant/30">
          <div className="absolute left-7 top-9 bottom-9 w-0.5 bg-outline-variant/60"></div>

          {/* Origin */}
          <div className="flex items-center gap-3 relative z-10 mb-2">
            <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">my_location</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-on-surface-variant font-medium">Ponto de Partida</span>
                <button
                  className="inline-flex items-center gap-1 text-primary hover:text-on-secondary-fixed-variant transition-colors"
                  onClick={handleUseGps}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">near_me</span>
                  <span className="text-[11px] font-bold">Usar meu GPS</span>
                </button>
              </div>
              <div className="bg-surface-container-low rounded-lg px-3 py-2 flex items-center justify-between border border-outline-variant/20">
                <input
                  className="bg-transparent text-sm text-on-surface w-full focus:outline-none truncate font-semibold"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
                <span className="material-symbols-outlined text-outline text-[18px]">verified</span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-end pr-2 -my-2 relative z-20">
            <button
              aria-label="Inverter origem e destino"
              className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-secondary-container text-on-surface transition-all flex items-center justify-center shadow-sm active:rotate-180 border border-outline-variant/30"
              onClick={handleSwapRoute}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">swap_vert</span>
            </button>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-3 relative z-10 mt-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">flag</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] text-on-surface-variant font-medium">Destino Selecionado</span>
                <span className="text-[11px] text-secondary font-bold">Sala C-104</span>
              </div>
              <div className="bg-surface-container-low rounded-lg px-3 py-2 flex items-center justify-between border border-outline-variant/20">
                <input
                  className="bg-transparent text-sm text-on-surface w-full focus:outline-none truncate font-bold text-primary"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
                <span className="material-symbols-outlined text-primary text-[18px]">school</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Mode Selectors */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-sm text-on-surface">Opções de Percurso</span>
          <span className="text-xs text-on-surface-variant">Clima: 31°C Nublado</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Fastest Route */}
          <button
            onClick={() => {
              setRouteMode('rapida');
              onShowToast('Modo: Mais Rápida selecionado', 'bolt');
            }}
            className={`flex flex-col items-start p-3 rounded-xl text-left transition-all border ${
              routeMode === 'rapida'
                ? 'bg-primary text-on-primary shadow-md border-primary'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
            }`}
            type="button"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  routeMode === 'rapida'
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'bg-primary-fixed/60 text-on-primary-fixed'
                }`}
              >
                Mais Rápida
              </span>
            </div>
            <span className="font-display font-bold text-base leading-tight">3 min</span>
            <span className="text-xs opacity-90">180m • Direto</span>
          </button>

          {/* Accessible 100% Flat Route */}
          <button
            onClick={() => {
              setRouteMode('acessivel');
              onShowToast('Modo: 100% Plana (Acessível)', 'accessible_forward');
            }}
            className={`flex flex-col items-start p-3 rounded-xl text-left transition-all border ${
              routeMode === 'acessivel'
                ? 'bg-tertiary-container text-on-tertiary-container shadow-md border-tertiary-container'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
            }`}
            type="button"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="material-symbols-outlined text-[20px]">accessible_forward</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  routeMode === 'acessivel'
                    ? 'bg-white text-tertiary-container'
                    : 'bg-tertiary-fixed text-on-tertiary-fixed'
                }`}
              >
                100% Plana
              </span>
            </div>
            <span className="font-display font-bold text-base leading-tight">4 min</span>
            <span className="text-xs opacity-90">210m • Rampas</span>
          </button>

          {/* Covered / Rain Shelter Route */}
          <button
            onClick={() => {
              setRouteMode('coberta');
              onShowToast('Modo: Sombra e Chuva (Marquise coberta)', 'roofing');
            }}
            className={`flex flex-col items-start p-3 rounded-xl text-left transition-all border ${
              routeMode === 'coberta'
                ? 'bg-secondary text-on-secondary shadow-md border-secondary'
                : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
            }`}
            type="button"
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="material-symbols-outlined text-[20px]">roofing</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  routeMode === 'coberta'
                    ? 'bg-white text-secondary'
                    : 'bg-secondary-container text-on-secondary-container'
                }`}
              >
                Sombra/Chuva
              </span>
            </div>
            <span className="font-display font-bold text-base leading-tight">4 min</span>
            <span className="text-xs opacity-90">195m • Coberto</span>
          </button>
        </div>
      </div>

      {/* Route Visualization Switcher */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between">
        <div className="bg-surface-container rounded-xl p-1 flex items-center gap-1 shadow-xs border border-outline-variant/30">
          <button
            onClick={() => {
              setViewStyle('satellite-gps');
              onShowToast('Mapa Satélite & GPS Ao Vivo', 'satellite_alt');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewStyle === 'satellite-gps'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">satellite_alt</span>
            <span>Satélite & GPS</span>
          </button>
          <button
            onClick={() => {
              setViewStyle('diagram-steps');
              onShowToast('Diagrama esquemático', 'alt_route');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewStyle === 'diagram-steps'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">alt_route</span>
            <span>Diagrama</span>
          </button>
        </div>

        <button
          onClick={() => {
            setIsNavigating(!isNavigating);
            if (!isNavigating) {
              setViewStyle('satellite-gps');
              onShowToast('Navegação em tempo real iniciada!', 'navigation');
            } else {
              onShowToast('Navegação pausada.', 'pause');
            }
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
            isNavigating
              ? 'bg-error text-on-error'
              : 'bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-white'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isNavigating ? 'close' : 'play_arrow'}
          </span>
          <span>{isNavigating ? 'Parar GPS' : 'Seguir Rota GPS'}</span>
        </button>
      </div>

      {viewStyle === 'satellite-gps' ? (
        <div className="px-4 py-1.5">
          <CampusGpsMap
            initialDestination={destination}
            isNavigationActive={isNavigating}
            onToggleNavigation={setIsNavigating}
            onShowToast={onShowToast}
          />
        </div>
      ) : (
        /* Active Route Visual Scheme Diagram */
        <div className="px-4 py-1.5">
          <div className="rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest border border-outline-variant/30">
            <div
              className={`w-full bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 relative transition-all ${
                isExpandedMap ? 'h-64' : 'h-36'
              }`}
            >
              {/* SVG Visual Scheme Route Flow */}
              <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="routeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4ADE80" />
                    <stop offset="50%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#FACC15" />
                  </linearGradient>
                </defs>
                {/* Campus Walkway nodes */}
                <path
                  d="M 40 100 Q 120 40 200 80 T 360 50"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 40 100 Q 120 40 200 80 T 360 50"
                  fill="none"
                  stroke="url(#routeGlow)"
                  strokeWidth="6"
                  strokeDasharray={isNavigating ? '8 4' : 'none'}
                  strokeLinecap="round"
                  className={isNavigating ? 'animate-[dash_2s_linear_infinite]' : ''}
                />
                {/* Checkpoints */}
                <circle cx="40" cy="100" r="9" fill="#1B873F" stroke="#FFFFFF" strokeWidth="3" />
                <text x="40" y="125" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Guarita
                </text>

                <circle cx="200" cy="80" r="7" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
                <text x="200" y="105" fill="#E2E8F0" fontSize="10" textAnchor="middle">
                  Bloco B
                </text>

                <circle cx="360" cy="50" r="10" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
                <text x="360" y="75" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                  Lab 03
                </text>
              </svg>

              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent flex flex-col justify-end p-3">
                <div className="flex items-center justify-between text-on-primary">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary-fixed text-[20px]">
                      alt_route
                    </span>
                    <span className="text-xs font-bold text-surface-bright">
                      Esquema do Trajeto Ativo
                    </span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-primary text-on-primary font-bold shadow-xs">
                    Bloco A → B → C
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 flex items-center justify-between text-on-surface-variant text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                <span>Piso tátil e iluminação natural em todo o percurso</span>
              </div>
              <button
                onClick={() => setIsExpandedMap(!isExpandedMap)}
                className="font-bold text-primary flex items-center gap-0.5 hover:underline"
                type="button"
              >
                <span>{isExpandedMap ? 'Recolher' : 'Expandir'}</span>
                <span className="material-symbols-outlined text-[16px]">
                  {isExpandedMap ? 'fullscreen_exit' : 'fullscreen'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passo a Passo Guiado */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-sm text-on-surface">Passo a Passo Guiado</span>
          <span className="text-xs text-on-surface-variant font-medium">4 etapas simples</span>
        </div>

        <div className="space-y-2">
          {NAVIGATION_STEPS.map((step, idx) => {
            const isCurrent = isNavigating && currentStepIndex === idx;
            const isCompleted = isNavigating && currentStepIndex > idx;
            const isLast = idx === NAVIGATION_STEPS.length - 1;

            return (
              <div
                key={step.number}
                onClick={() => {
                  if (isNavigating) setCurrentStepIndex(idx);
                }}
                className={`rounded-xl p-3 shadow-xs flex items-start gap-3 border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-secondary-container/40 border-primary ring-2 ring-primary/20'
                    : isLast
                    ? 'bg-secondary-container/20 border-outline-variant/30'
                    : 'bg-surface-container-lowest border-outline-variant/30'
                }`}
              >
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isCompleted
                        ? 'bg-primary text-on-primary'
                        : isCurrent
                        ? 'bg-primary text-on-primary ring-4 ring-primary/20'
                        : isLast
                        ? 'bg-primary text-on-primary'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    ) : (
                      step.number
                    )}
                  </div>
                  {!isLast && <div className="w-0.5 h-10 bg-surface-container mt-1"></div>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm text-on-surface truncate">
                      {step.title}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                        step.distance === 'Destino'
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-high text-on-surface'
                      }`}
                    >
                      {step.distance}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mb-2 leading-relaxed">
                    {step.instruction}
                  </p>

                  {step.badgeText && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-low text-secondary text-[11px] font-semibold border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[14px]">straight</span>
                      <span>{step.badgeText}</span>
                    </div>
                  )}

                  {step.subBadges && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {step.subBadges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            badge.colorClass || 'bg-surface-container-high text-on-surface'
                          }`}
                        >
                          {badge.icon && (
                            <span className="material-symbols-outlined text-[14px]">{badge.icon}</span>
                          )}
                          <span>{badge.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Marcos Visuais no Caminho */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display font-bold text-sm text-on-surface">
            Marcos Visuais no Caminho
          </span>
          <span className="text-xs text-primary font-semibold">Pontos de Certeza</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {VISUAL_LANDMARKS.map((landmark) => (
            <div
              key={landmark.id}
              className="bg-surface-container-lowest rounded-xl p-3 shadow-xs flex flex-col border border-outline-variant/30 hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-24 rounded-lg overflow-hidden mb-2 bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  src={landmark.imageUrl}
                  alt={landmark.title}
                  loading="lazy"
                />
                <span
                  className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${landmark.tagBg}`}
                >
                  {landmark.numberTag}
                </span>
              </div>
              <span className="font-semibold text-xs text-on-surface leading-snug">
                {landmark.title}
              </span>
              <span className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">
                {landmark.location}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Suporte Presencial / DAE */}
      <div className="px-4 pt-1 pb-2">
        <div className="bg-surface-container rounded-xl p-3.5 flex items-center justify-between gap-3 border border-outline-variant/20 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">info</span>
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-on-surface block truncate">
                Precisa de suporte presencial?
              </span>
              <span className="text-[11px] text-on-surface-variant block truncate">
                Balcão da DAE no Hall Central do Bloco A
              </span>
            </div>
          </div>
          <button
            onClick={() => onShowToast('Discando ramal DAE IFAP: (96) 3198-2160', 'call')}
            className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest text-primary text-xs font-bold shadow-xs whitespace-nowrap hover:bg-surface-container-high transition-colors"
            type="button"
          >
            Ligar DAE
          </button>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-20 w-full bg-[#f9f9ff]/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-4 py-2.5 z-30 border-t border-outline-variant/20">
        <div className="flex flex-col gap-2 max-w-lg mx-auto">
          <button
            onClick={handleStartNavigation}
            className={`w-full h-12 rounded-xl text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
              isNavigating ? 'bg-secondary hover:bg-secondary/90' : 'bg-primary hover:bg-primary-container'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isNavigating ? 'explore' : 'navigation'}
            </span>
            <span>
              {isNavigating
                ? `Etapa ${currentStepIndex + 1} de ${NAVIGATION_STEPS.length} (Finalizar)`
                : 'Iniciar Navegação Guiada'}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="h-10 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs border border-outline-variant/30 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">share</span>
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="h-10 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs border border-outline-variant/30 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">qr_code_2</span>
              <span>Abrir QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95">
            <div className="w-10 h-1 rounded-full bg-outline-variant mb-3"></div>
            <span className="font-display font-bold text-lg text-on-surface">
              Compartilhar Trajeto
            </span>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">
              Aponte a câmera para abrir as coordenadas desta rota no aplicativo do IFAP Macapá.
            </p>

            <div className="p-4 bg-surface-container rounded-xl flex items-center justify-center mb-4 shadow-inner">
              <div className="w-44 h-44 bg-surface-container-lowest rounded-lg p-2 flex flex-col items-center justify-center relative shadow-sm border border-outline-variant/30">
                <svg className="w-full h-full text-on-surface" viewBox="0 0 100 100">
                  <path
                    d="M10 10h30v30H10zm6 6v18h18V16zm4 4h10v10H20zm40-10h30v30H60zm6 6v18h18V16zm4 4h10v10H70zM10 60h30v30H10zm6 6v18h18V66zm4 4h10v10H20zm40 0h10v10H60zm10 10h10v10H70zm10-10h10v10H80zm0 10h10v10H80zM60 80h10v10H60zm20 0h10v10H80z"
                    fill="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center text-[12px] font-bold shadow-md">
                    Ri
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full h-11 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm transition-colors"
              type="button"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
