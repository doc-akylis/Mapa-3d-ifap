import React from 'react';
import { ASSETS } from '../data/campusData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onShowToast }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-sm p-5 shadow-2xl animate-in fade-in zoom-in-95 border border-outline-variant/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-xs">
              IF
            </span>
            <h3 className="font-display font-bold text-base text-on-surface">
              Identificação Estudantil IFAP
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Student Digital ID Badge Card */}
        <div className="bg-gradient-to-br from-[#006c2d] to-[#0d532b] rounded-xl p-4 text-white shadow-lg relative overflow-hidden my-2">
          {/* IFAP Watermark */}
          <div className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none">
            <span className="material-symbols-outlined text-[110px]">school</span>
          </div>

          <div className="flex items-start gap-3 relative z-10">
            <div className="relative">
              <img
                src={ASSETS.STUDENT_PROFILE}
                alt="Foto Estudante IFAP"
                className="w-16 h-20 rounded-lg object-cover border-2 border-white/90 shadow-md"
              />
              <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-400 text-[#002109] rounded-full p-0.5 text-[10px] font-bold">
                ✓
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 block">
                IFAP • Campus Macapá
              </span>
              <h4 className="font-display font-bold text-sm truncate text-white">
                Larissa Silva dos Santos
              </h4>
              <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                TADS • Análise e Desenvolvimento de Sistemas
              </p>
              <div className="mt-2 text-[10px] bg-black/20 backdrop-blur-xs px-2 py-1 rounded inline-block">
                Matrícula: <strong className="text-white">20241010042</strong>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[11px] text-emerald-100 relative z-10">
            <span>Status: <strong className="text-emerald-300">Regular</strong></span>
            <span>Válido até: 12/2026</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={() => {
              onShowToast('Carteirinha digital sincronizada com SUAP', 'sync');
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-surface-container text-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code</span>
            <span>Abrir no SUAP</span>
          </button>
          <button
            onClick={() => {
              onShowToast('Comprovante de matrícula compartilhado', 'share');
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Comprovante</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-bold text-xs"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
