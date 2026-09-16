import React, { useState } from 'react';
import { NOTICES_DATA } from '../data/campusData';
import { CampusNotice } from '../types';

interface AvisosScreenProps {
  onSelectRoute: (destination: string) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const AvisosScreen: React.FC<AvisosScreenProps> = ({
  onSelectRoute,
  onShowToast,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'mudanca' | 'prova' | 'manutencao'>('all');
  const [subscribedMatricula, setSubscribedMatricula] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedQuickNav, setSelectedQuickNav] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos (5)', icon: 'all_inbox' },
    { id: 'mudanca', label: 'Mudanças de Sala (3)', icon: 'move_up' },
    { id: 'prova', label: 'Provas & Vestibular (1)', icon: 'assignment_turned_in' },
    { id: 'manutencao', label: 'Manutenção (1)', icon: 'engineering' },
  ];

  const filteredNotices = NOTICES_DATA.filter((notice) => {
    const matchesCat = activeCategory === 'all' || notice.category === activeCategory;
    const matchesQuery =
      filterQuery === '' ||
      notice.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (notice.subtitle && notice.subtitle.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (notice.courseTag && notice.courseTag.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (notice.instructor && notice.instructor.toLowerCase().includes(filterQuery.toLowerCase())) ||
      (notice.toLocation && notice.toLocation.toLowerCase().includes(filterQuery.toLowerCase()));

    return matchesCat && matchesQuery;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribedMatricula.trim()) {
      onShowToast('Digite seu curso ou matrícula', 'warning');
      return;
    }
    setIsSubscribed(true);
    onShowToast('Alertas ativados para ' + subscribedMatricula, 'notifications_active');
  };

  const handleShareNotice = (notice: CampusNotice) => {
    const text = encodeURIComponent(
      `[IFAP Alerta] ${notice.title}: Transferido para ${notice.toLocation || 'novo local'}. Saiba mais no Mapa IFAP.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto px-4 pb-28 gap-4">
      {/* Top Intro & Realtime Status Indicator */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="text-xs text-secondary font-bold uppercase tracking-wider">
            Mural em Tempo Real
          </span>
        </div>
        <span className="text-[11px] text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full border border-outline-variant/20">
          Atualizado há 3 min
        </span>
      </div>

      {/* Search and Course Filter */}
      <div className="relative w-full">
        <div className="flex items-center bg-surface-container-lowest rounded-xl shadow-sm px-3.5 py-2.5 gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined text-outline text-[22px]">search</span>
          <input
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none font-medium"
            id="noticesSearch"
            placeholder="Filtrar por curso, turma ou professor..."
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
          {filterQuery && (
            <button
              aria-label="Limpar busca"
              className="text-outline hover:text-on-surface p-1 transition-colors"
              onClick={() => setFilterQuery('')}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id as any)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold shadow-xs transition-all ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* High-Priority Alert Card: Vestibular / Processo Seletivo */}
      {(activeCategory === 'all' || activeCategory === 'prova') && (
        <div className="relative overflow-hidden bg-error-container text-on-error-container rounded-xl shadow-md p-4 flex flex-col gap-3 border border-error/20">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px] text-error">priority_high</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 bg-error text-on-error px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
              <span className="material-symbols-outlined text-[14px]">warning</span> URGENTE
            </span>
            <div className="flex items-center gap-1.5 text-on-error-container text-xs font-semibold">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Hoje • 14:00</span>
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-base text-on-error-container leading-tight">
              Prova do Vestibular IFAP • Processo Seletivo
            </h2>
            <p className="text-xs text-on-error-container opacity-90 mt-1 leading-relaxed">
              Mudança extraordinária de local para acomodação de candidatos com mobilidade facilitada.
            </p>
          </div>

          {/* Candidate Filter Tag */}
          <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest/90 text-on-surface px-3 py-1.5 rounded-lg text-xs w-fit shadow-xs border border-outline-variant/30">
            <span className="material-symbols-outlined text-[16px] text-primary">groups</span>
            <span>
              Candidatos com inscrição <strong>A — M</strong>
            </span>
          </div>

          {/* Migration Route Indicator */}
          <div className="bg-surface-container-lowest rounded-xl p-3 shadow-xs flex flex-col gap-2 text-on-surface border border-outline-variant/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-outline block uppercase font-bold">
                  De (Local Anterior)
                </span>
                <span className="text-xs text-outline line-through truncate block font-medium">
                  Bloco B • Sala 04
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-secondary-container text-secondary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">east</span>
              </div>
              <div className="flex-1 min-w-0 text-right">
                <span className="text-[10px] text-primary block uppercase font-bold">
                  Para (Novo Local)
                </span>
                <span className="text-xs text-primary font-bold truncate block">
                  Auditório Central (Bloco A)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
            <button
              className="flex-1 bg-primary text-on-primary py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all"
              onClick={() => {
                setSelectedQuickNav('Auditório Central (Bloco A)');
                onSelectRoute('Auditório Central (Bloco A)');
              }}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">pin_drop</span>
              <span>Ver nova sala no Mapa</span>
            </button>
            <button
              className="bg-surface-container-lowest text-on-surface py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container-low transition-colors border border-outline-variant/30"
              onClick={() =>
                handleShareNotice({
                  id: 'vestibular',
                  title: 'Prova do Vestibular IFAP',
                  category: 'prova',
                  timeTag: 'Hoje 14h',
                  toLocation: 'Auditório Central (Bloco A)',
                })
              }
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Avisar colegas</span>
            </button>
          </div>
        </div>
      )}

      {/* Notice Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="font-display font-bold text-sm text-on-surface">Alterações de Turmas</h3>
        <span className="text-xs text-secondary font-medium">Horário Noturno e Vespertino</span>
      </div>

      {/* Notice List */}
      <div className="space-y-3">
        {filteredNotices
          .filter((n) => n.category !== 'prova')
          .map((notice) => (
            <div
              key={notice.id}
              className="bg-surface-container-lowest rounded-xl shadow-xs p-4 flex flex-col gap-3 border border-outline-variant/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  {notice.courseTag && (
                    <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit mb-1">
                      <span className="material-symbols-outlined text-[14px]">
                        {notice.category === 'manutencao' ? 'engineering' : 'desktop_windows'}
                      </span>
                      {notice.courseTag}
                    </span>
                  )}
                  {notice.category === 'manutencao' && (
                    <span className="inline-flex items-center gap-1 bg-surface-container-highest text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit mb-1">
                      <span className="material-symbols-outlined text-[14px] text-tertiary">
                        accessible_forward
                      </span>
                      AVISO DE ACESSIBILIDADE
                    </span>
                  )}
                  <h4 className="font-display font-semibold text-sm text-on-surface">
                    {notice.title}
                  </h4>
                  {notice.subtitle && (
                    <span className="text-xs text-on-surface-variant">{notice.subtitle}</span>
                  )}
                </div>
                <span className="text-[11px] bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-md flex-shrink-0 font-medium">
                  {notice.timeTag}
                </span>
              </div>

              {/* Movement Pill Grid */}
              {notice.fromLocation && notice.toLocation && (
                <div className="bg-surface-container-low rounded-lg p-2.5 flex items-center justify-between gap-2 border border-outline-variant/20">
                  <div className="min-w-0">
                    <span className="text-[10px] text-outline block">Sala Original</span>
                    <span className="text-xs text-on-surface-variant line-through truncate block font-medium">
                      {notice.fromLocation}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    arrow_forward
                  </span>
                  <div className="text-right min-w-0">
                    <span className="text-[10px] text-primary font-bold block">Transferida Para</span>
                    <span className="text-xs text-primary font-bold truncate block">
                      {notice.toLocation}
                    </span>
                  </div>
                </div>
              )}

              {/* Justification & Meta */}
              {notice.reason && (
                <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">info</span>
                  <span>{notice.reason}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-outline">
                  {notice.category === 'manutencao' ? 'Previsão: 2 dias' : 'Confirmado pela Coordenação'}
                </span>
                <button
                  className="bg-secondary text-on-secondary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-xs"
                  onClick={() => {
                    const target = notice.actionTarget || notice.toLocation || 'Local da Turma';
                    setSelectedQuickNav(target);
                    onSelectRoute(target);
                  }}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {notice.category === 'manutencao' ? 'navigation' : 'directions_walk'}
                  </span>
                  <span>{notice.actionText || 'Como chegar'}</span>
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Subscription Box (WhatsApp Alerts) */}
      <div className="bg-surface-container rounded-2xl p-4 flex flex-col gap-3 border border-outline-variant/30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-display font-bold text-sm text-on-surface">
              Alertas da sua turma no WhatsApp
            </h4>
            <p className="text-xs text-on-surface-variant">
              Nunca perca uma troca de sala ou comunicado do IFAP Macapá.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubscribe} className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-surface-container-lowest rounded-lg px-3 py-2.5 text-xs text-on-surface focus:outline-none placeholder:text-outline border border-outline-variant/30"
              id="notifInput"
              placeholder="Seu curso ou nº de matrícula..."
              type="text"
              value={subscribedMatricula}
              onChange={(e) => setSubscribedMatricula(e.target.value)}
            />
            <button
              className={`text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm active:scale-95 transition-all whitespace-nowrap ${
                isSubscribed
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
              type="submit"
            >
              {isSubscribed ? 'Salvo!' : 'Ativar'}
            </button>
          </div>
          {isSubscribed && (
            <span className="text-xs text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Alertas ativados com sucesso para o seu dispositivo!
            </span>
          )}
        </form>
      </div>

      {/* Quick Nav Floating Sheet */}
      {selectedQuickNav && (
        <div className="fixed inset-x-0 bottom-20 z-40 px-4 transition-all">
          <div className="max-w-md mx-auto bg-inverse-surface text-inverse-on-surface p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-outline-variant/30">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-primary-fixed text-[24px] flex-shrink-0">
                turn_right
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-surface-dim">Destino selecionado</span>
                <span className="font-bold text-xs truncate">{selectedQuickNav}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Fechar"
                className="p-1.5 text-surface-dim hover:text-inverse-on-surface rounded-full transition-colors"
                onClick={() => setSelectedQuickNav(null)}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              <button
                onClick={() => onSelectRoute(selectedQuickNav)}
                className="bg-primary-fixed text-on-primary-fixed text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-xs"
                type="button"
              >
                Navegar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
