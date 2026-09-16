import React from 'react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'Turma ADS 2024 remanejada',
      desc: 'Hoje às 19:00: Aula de Programação Web II no Lab Redes 01 (Bloco C).',
      time: 'Há 5 min',
      unread: true,
      type: 'warning',
    },
    {
      id: 2,
      title: 'Manutenção do Elevador Bloco C',
      desc: 'Utilize a rampa de conexão sul para acessar os pisos 1 e 2.',
      time: 'Há 45 min',
      unread: true,
      type: 'info',
    },
    {
      id: 3,
      title: 'Abertura do Vestibular IFAP',
      desc: 'Candidatos com inscrição A-M alocados no Auditório Central (Bloco A).',
      time: 'Hoje 08:30',
      unread: false,
      type: 'general',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in fade-in zoom-in-95 border border-outline-variant/30 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-secondary-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
            </span>
            <h3 className="font-display font-bold text-base text-on-surface">
              Notificações do Campus
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 my-1 pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onNavigateToTab('avisos-mudancas');
                onClose();
              }}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                n.unread
                  ? 'bg-secondary-container/20 border-primary/40'
                  : 'bg-surface-container-low border-outline-variant/30'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-display font-semibold text-xs text-on-surface">
                  {n.title}
                </span>
                <span className="text-[10px] text-on-surface-variant">{n.time}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-tight">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-outline-variant/20 flex gap-2">
          <button
            onClick={() => {
              onShowToast('Todas as notificações marcadas como lidas', 'done_all');
              onClose();
            }}
            className="flex-1 py-2 rounded-lg bg-surface-container text-on-surface font-semibold text-xs"
          >
            Marcar lidas
          </button>
          <button
            onClick={() => {
              onNavigateToTab('avisos-mudancas');
              onClose();
            }}
            className="flex-1 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs"
          >
            Ver Mural
          </button>
        </div>
      </div>
    </div>
  );
};
