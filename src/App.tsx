/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabType } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { InicioMapaScreen } from './components/InicioMapaScreen';
import { RotasScreen } from './components/RotasScreen';
import { AvisosScreen } from './components/AvisosScreen';
import { AcessibilidadeScreen } from './components/AcessibilidadeScreen';
import { ProfileModal } from './components/ProfileModal';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio-mapa');
  const [currentCampus, setCurrentCampus] = useState('Campus Macapá');
  const [selectedDestination, setSelectedDestination] = useState<string>(
    'Lab. de Informática 03 (Bloco C • 1º Andar)'
  );

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; icon: string; visible: boolean }>({
    message: '',
    icon: 'check_circle',
    visible: false,
  });

  const showToast = (message: string, icon: string = 'check_circle') => {
    setToast({ message, icon, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  };

  const handleNavigateToRotas = (destination?: string) => {
    if (destination) {
      setSelectedDestination(destination);
    }
    setActiveTab('rotas');
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] font-sans text-on-surface flex flex-col antialiased">
      {/* Top Header */}
      <Header
        currentCampus={currentCampus}
        onSelectCampus={(c) => {
          setCurrentCampus(c);
          showToast(`Unidade alterada para ${c}`, 'domain');
        }}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        unreadCount={2}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col w-full pt-16">
        {activeTab === 'inicio-mapa' && (
          <InicioMapaScreen
            onNavigateToRotas={handleNavigateToRotas}
            onNavigateToTab={setActiveTab}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'rotas' && (
          <RotasScreen
            initialDestination={selectedDestination}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'avisos-mudancas' && (
          <AvisosScreen
            onSelectRoute={handleNavigateToRotas}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'acessibilidade' && (
          <AcessibilidadeScreen
            onSelectRoute={handleNavigateToRotas}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unreadNoticesCount={3}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onShowToast={showToast}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onNavigateToTab={setActiveTab}
        onShowToast={showToast}
      />

      {/* Global Floating Toast */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-full shadow-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 z-50 max-w-[90%] border border-outline-variant/30 ${
          toast.visible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-primary-fixed">
          {toast.icon}
        </span>
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
}
