import React, { useState } from 'react';
import { ASSETS } from '../data/campusData';

interface HeaderProps {
  currentCampus: string;
  onSelectCampus: (campus: string) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentCampus,
  onSelectCampus,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const campuses = [
    { id: 'macapa', name: 'Campus Macapá', status: 'Ativo • Seu campus' },
    { id: 'santana', name: 'Campus Santana', status: 'Disponível' },
    { id: 'laranjal', name: 'Campus Laranjal do Jari', status: 'Disponível' },
    { id: 'portogrande', name: 'Campus Porto Grande', status: 'Disponível' },
    { id: 'oiapoque', name: 'Campus Oiapoque', status: 'Disponível' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f9f9ff]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-2xl mx-auto">
        {/* Left: Logo and Campus Selector */}
        <div className="flex items-center gap-2 min-w-0">
          <img
            alt="Mapa IFAP Logo"
            className="h-8 w-auto object-contain flex-shrink-0 cursor-pointer"
            src={ASSETS.LOGO_LIGHT}
          />
          <div className="flex flex-col min-w-0 relative">
            <span className="font-display font-semibold text-lg text-primary leading-tight truncate">
              Mapa IFAP
            </span>
            <button
              className="flex items-center gap-1 text-left text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-expanded={showDropdown}
            >
              <span className="text-[11px] font-semibold truncate">
                {currentCampus}
              </span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>

            {/* Campus dropdown menu */}
            {showDropdown && (
              <div className="absolute top-10 left-0 w-56 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-outline">
                  Unidades do IFAP
                </div>
                {campuses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCampus(c.name);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-surface-container transition-colors ${
                      c.name === currentCampus ? 'bg-secondary-container/30 text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-on-surface-variant font-normal">{c.status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Notifications and Profile */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            aria-label="Alertas do Campus"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors relative"
            type="button"
            onClick={onOpenNotifications}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary ring-2 ring-surface"></span>
            )}
          </button>

          <button
            aria-label="Perfil Institucional"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:opacity-90 transition-opacity ring-2 ring-primary/20"
            type="button"
            onClick={onOpenProfile}
          >
            <img
              alt="Perfil da Estudante"
              className="w-8 h-8 rounded-full object-cover"
              src={ASSETS.STUDENT_PROFILE}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
