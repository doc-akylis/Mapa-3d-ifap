import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadNoticesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadNoticesCount = 3,
}) => {
  const tabs: { id: TabType; label: string; icon: string; hasBadge?: boolean }[] = [
    { id: 'inicio-mapa', label: 'Início / Mapa', icon: 'map' },
    { id: 'rotas', label: 'Rotas', icon: 'turn_right' },
    { id: 'avisos-mudancas', label: 'Avisos', icon: 'campaign', hasBadge: true },
    { id: 'acessibilidade', label: 'Acessível', icon: 'accessible_forward' },
  ];

  return (
    <nav
      className="fixed bottom-0 w-full z-40 pb-safe bg-[#f9f9ff]/95 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.06)] border-t border-outline-variant/20"
      aria-label="Navegação Principal"
    >
      <div className="h-20 px-2 max-w-2xl mx-auto grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <div
                className={`w-12 h-8 flex items-center justify-center rounded-full mb-0.5 transition-colors relative ${
                  isActive ? 'bg-secondary-container/60 text-primary' : ''
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">{tab.icon}</span>
                {tab.hasBadge && unreadNoticesCount > 0 && (
                  <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-error ring-1 ring-white"></span>
                )}
              </div>
              <span className="text-[11px] text-center truncate max-w-full px-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
