import React, { useState } from 'react';
import { ACCESSIBLE_FACILITIES } from '../data/campusData';
import { AccessibleFacility } from '../types';

interface AcessibilidadeScreenProps {
  onSelectRoute: (destination: string) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const AcessibilidadeScreen: React.FC<AcessibilidadeScreenProps> = ({
  onSelectRoute,
  onShowToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'elevadores' | 'sanitarios' | 'piso' | 'napne'>('all');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showEscortModal, setShowEscortModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [barrierLocation, setBarrierLocation] = useState('Bloco C');
  const [elevationProgress, setElevationProgress] = useState(45);

  const filters = [
    { id: 'all', label: 'Todos', icon: 'view_list' },
    { id: 'elevadores', label: 'Rampas & Elevadores', icon: 'elevator' },
    { id: 'sanitarios', label: 'Sanitários Adaptados', icon: 'wc' },
    { id: 'piso', label: 'Piso Tátil & Braille', icon: 'blind' },
    { id: 'napne', label: 'NAPNE & Apoio', icon: 'hearing' },
  ];

  const filteredFacilities = ACCESSIBLE_FACILITIES.filter((f) => {
    return activeFilter === 'all' || f.category === activeFilter;
  });

  const handleToggleAudioGuide = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(false);
      onShowToast('Áudio guia pausado.', 'volume_off');
      return;
    }

    const textToSpeak =
      'Bem-vindo ao Mapa Acessível do IFAP Campus Macapá. Você está localizado próximo à Guarita Principal. ' +
      'O eixo central possui piso tátil contínuo e rampas suaves de até 5% de inclinação, interligando todos os blocos acadêmicos, ' +
      'a Biblioteca Central e os laboratórios sem nenhum degrau.';

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      onShowToast('Reproduzindo audiodescrição espacial do campus IFAP...', 'volume_up');
    } else {
      onShowToast('Iniciando audiodescrição espacial do campus IFAP...', 'volume_up');
      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 5000);
    }
  };

  const handleEscortSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEscortModal(false);
    onShowToast('Chamada enviada ao plantão NAPNE! Monitor a caminho.', 'support_agent');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowReportModal(false);
    setReportDescription('');
    onShowToast(`Barreira reportada no ${barrierLocation} para o setor de infraestrutura!`, 'check_circle');
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-28 gap-3">
      {/* Hero Welcome Card */}
      <section className="px-4 pt-2 pb-1">
        <div className="bg-surface-container-low rounded-xl p-4 shadow-sm relative overflow-hidden border border-outline-variant/30">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-secondary-container/30 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              NBR 9050 Ativa
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              Macapá
            </span>
          </div>

          <h1 className="font-display font-bold text-xl text-primary tracking-tight">
            Campus Inclusivo IFAP
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Rotas acessíveis, rampas, elevadores e recursos de acolhimento para pessoas com deficiência física, sensorial ou mobilidade reduzida.
          </p>

          <div className="mt-3 pt-2 flex items-center justify-between border-t border-outline-variant/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                <span className="material-symbols-outlined text-[18px]">accessible</span>
              </div>
              <div>
                <p className="text-xs text-on-surface font-semibold">100% Rotas Niveladas</p>
                <p className="text-[11px] text-on-surface-variant">Conexão livre de degraus</p>
              </div>
            </div>

            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95 shadow-sm border ${
                isPlayingAudio
                  ? 'bg-primary text-on-primary border-primary animate-pulse'
                  : 'bg-surface-container text-primary border-outline-variant/30 hover:bg-surface-container-high'
              }`}
              onClick={handleToggleAudioGuide}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPlayingAudio ? 'volume_off' : 'volume_up'}
              </span>
              <span>{isPlayingAudio ? 'Pausar Áudio' : 'Áudio Guia'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 py-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
            Filtrar Recursos
          </span>
          <span className="text-xs text-primary font-medium">
            {filteredFacilities.length} {filteredFacilities.length === 1 ? 'Categoria' : 'Categorias'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {filters.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setActiveFilter(f.id as any);
                  onShowToast(`Filtrado: ${f.label}`, f.icon);
                }}
                className={`filter-pill flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 shadow-xs border ${
                  isActive
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface border-outline-variant/30 hover:bg-surface-container-highest'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Planta de Conectividade Nivelada (Interactive Slope Graph) */}
      <section className="px-4 py-1">
        <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden relative border border-outline-variant/30">
          <div className="p-4 pb-2 flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Em tempo real
              </span>
              <h2 className="font-display font-bold text-sm text-on-surface mt-1">
                Planta de Conectividade Nivelada
              </h2>
              <p className="text-xs text-on-surface-variant">
                Trajetos sem escadas interligando Blocos A, B, C, Reitoria e Biblioteca Central.
              </p>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-90 transition-transform shadow-xs border border-outline-variant/30"
              onClick={() => {
                setElevationProgress(45);
                onShowToast('Centralizando rota no Pátio Central...', 'my_location');
              }}
              type="button"
              title="Centralizar"
            >
              <span className="material-symbols-outlined text-[20px]">my_location</span>
            </button>
          </div>

          <div className="relative w-full h-56 bg-surface-container-high overflow-hidden border-y border-outline-variant/20">
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-highest/60 to-surface-container/95 flex flex-col justify-between p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm text-on-surface text-xs font-semibold border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">alt_route</span>
                  <span>Corredor Aclive Suave: 3.8%</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm text-on-surface text-xs font-semibold border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[16px] text-primary">navigation</span>
                  <span>Você: Pátio Central</span>
                </div>
              </div>

              {/* Vector SVG Cross-Section Elevation Graphic */}
              <div className="relative w-full h-24 my-auto">
                <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 340 100">
                  {/* Roadway Base */}
                  <path
                    d="M 20 80 Q 90 20 170 50 T 320 20"
                    stroke="#CBD5E1"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                  {/* Active Guided Track */}
                  <path
                    className="animate-[dash_20s_linear_infinite]"
                    d="M 20 80 Q 90 20 170 50 T 320 20"
                    stroke="#1B873F"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    strokeWidth="4"
                  />
                  {/* Points */}
                  <circle cx="20" cy="80" fill="#1B873F" r="7" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="170" cy="50" fill="#1976D2" r="6" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="320" cy="20" fill="#BA1A1A" r="8" stroke="#FFFFFF" strokeWidth="2" />
                </svg>

                <div className="absolute left-2 bottom-0 px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface text-[10px] shadow-sm font-bold border border-outline-variant/30">
                  Entrada Principal
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-4 px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface text-[10px] shadow-sm font-bold border border-outline-variant/30">
                  Rampa Bloco B
                </div>
                <div className="absolute right-2 top-0 px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface text-[10px] shadow-sm font-bold border border-outline-variant/30">
                  Biblioteca
                </div>
              </div>

              {/* Status Box */}
              <div className="bg-surface-container-lowest/95 backdrop-blur-md rounded-lg p-2.5 flex items-center justify-between shadow-xs border border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  </div>
                  <span className="text-xs text-on-surface font-semibold">
                    Nenhum obstáculo ativo no eixo central
                  </span>
                </div>
                <span className="text-[11px] text-primary font-bold">320m sem degraus</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-3 text-on-surface-variant text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Rota Coberta
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> Piso Tátil Integral
              </span>
            </div>
            <button
              onClick={() => onShowToast('Abrindo modelo tridimensional das rampas...', 'view_in_ar')}
              className="text-primary text-xs font-bold flex items-center gap-0.5 hover:underline"
              type="button"
            >
              <span>Ver em 3D</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </button>
          </div>
        </div>
      </section>

      {/* Instalações e Pontos Adaptados */}
      <section className="px-4 py-1 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-on-surface">
            Instalações e Pontos Adaptados
          </h2>
          <span className="text-xs text-on-surface-variant">Campus Macapá</span>
        </div>

        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="facility-card bg-surface-container-lowest rounded-xl p-4 shadow-xs hover:shadow-sm transition-all border border-outline-variant/30 flex flex-col gap-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    facility.category === 'sanitarios'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : facility.category === 'elevadores'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : facility.category === 'napne'
                      ? 'bg-surface-container-high text-tertiary'
                      : 'bg-surface-container-high text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {facility.category === 'sanitarios'
                      ? 'wc'
                      : facility.category === 'elevadores'
                      ? 'elevator'
                      : facility.category === 'napne'
                      ? 'support_agent'
                      : 'spatial_tracking'}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                      {facility.block}
                    </span>
                    {facility.room && (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface text-[11px] font-medium">
                        {facility.room}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-sm text-on-surface mt-1">
                    {facility.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    {facility.description}
                  </p>
                </div>
              </div>

              <span
                className="w-3 h-3 rounded-full bg-primary flex-shrink-0 mt-1"
                title="Livre e Desobstruído"
              ></span>
            </div>

            <div className="mt-1 pt-2 flex items-center justify-between border-t border-outline-variant/20 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                {facility.statusIcon && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-primary">
                      {facility.statusIcon}
                    </span>
                    {facility.statusBadge}
                  </span>
                )}
                {facility.capacityOrStandard && (
                  <>
                    <span>•</span>
                    <span>{facility.capacityOrStandard}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {facility.category === 'napne' && (
                  <button
                    onClick={() => onShowToast('Ligando para ramal NAPNE IFAP: (96) 3198-2150', 'call')}
                    className="px-3 py-1.5 rounded-full bg-surface-container text-tertiary text-xs font-semibold flex items-center gap-1 active:scale-95 transition-transform hover:bg-surface-container-high"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">call</span>
                    <span>Contatar</span>
                  </button>
                )}

                <button
                  className="px-3 py-1.5 rounded-full bg-primary-container text-on-primary text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-transform hover:bg-primary"
                  onClick={() => onSelectRoute(facility.title)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">turn_sharp_right</span>
                  <span>{facility.actionLabel}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Emergency Assistance & Barrier Reporting */}
      <section className="px-4 py-1">
        <div className="bg-surface-container-high rounded-xl p-4 shadow-sm relative overflow-hidden border border-outline-variant/30">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[26px]">handshake</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-on-surface">
                Precisa de Auxílio ou Encontrou Obstáculo?
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Solicite um monitor do NAPNE para te encontrar no campus ou reporte um piso danificado, elevador em manutenção ou rampa com bloqueio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => setShowEscortModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-primary-container text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform text-center hover:bg-primary"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">person_pin_circle</span>
              <span>Apoio Imediato</span>
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest text-error text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform text-center hover:bg-surface-container border border-error/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">report_problem</span>
              <span>Relatar Barreira</span>
            </button>
          </div>
        </div>
      </section>

      {/* Escort Monitor Modal */}
      {showEscortModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary-container text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_pin_circle</span>
                </span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Solicitar Monitor NAPNE
                </h3>
              </div>
              <button
                onClick={() => setShowEscortModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant mb-3 leading-relaxed">
              Um monitor treinado em acessibilidade irá até a sua localização para te auxiliar no deslocamento no campus.
            </p>

            <form onSubmit={handleEscortSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Onde você está agora?
                </label>
                <input
                  type="text"
                  defaultValue="Próximo à Guarita Principal / Entrada Rodovia"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Qual o seu destino?
                </label>
                <input
                  type="text"
                  defaultValue="Bloco C - Laboratório de Informática"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Tipo de auxílio necessário:
                </label>
                <select className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary">
                  <option>Cadeirante / Mobilidade Reduzida</option>
                  <option>Deficiência Visual / Guia e Piso Tátil</option>
                  <option>Intérprete de Libras</option>
                  <option>Apoio Geral</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscortModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-surface-container text-on-surface font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary-container"
                >
                  Confirmar Chamada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barrier Reporting Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">report_problem</span>
                </span>
                <h3 className="font-display font-bold text-base text-on-surface">
                  Relatar Barreira no Campus
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant mb-3">
              Ajude a manter o campus 100% acessível reportando buracos, pisos soltos ou portas travadas.
            </p>

            <form onSubmit={handleReportSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Localização da barreira:
                </label>
                <select
                  value={barrierLocation}
                  onChange={(e) => setBarrierLocation(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Bloco A (Administrativo)">Bloco A (Administrativo / Biblioteca)</option>
                  <option value="Bloco B (Salas de Aula)">Bloco B (Salas de Aula 01 a 16)</option>
                  <option value="Bloco C (Laboratórios)">Bloco C (Laboratórios de Informática)</option>
                  <option value="Bloco D (Cantina)">Bloco D (Cantina e Convivência)</option>
                  <option value="Passarela Central">Passarela Central Coberta</option>
                  <option value="Estacionamento">Estacionamento</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant block mb-1">
                  Descrição do problema:
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  placeholder="Ex: Piso tátil danificado perto da rampa leste..."
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-surface-container text-on-surface font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-error text-on-error font-bold text-xs shadow-sm hover:opacity-90"
                >
                  Enviar Relato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
