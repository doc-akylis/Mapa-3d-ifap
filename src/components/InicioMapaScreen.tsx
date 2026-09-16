import React, { useState } from 'react';
import { POPULAR_LOCATIONS } from '../data/campusData';
import { CampusLocation, TabType } from '../types';
import { CampusGpsMap } from './CampusGpsMap';

interface InicioMapaScreenProps {
  onNavigateToRotas: (destination?: string) => void;
  onNavigateToTab: (tab: TabType) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const InicioMapaScreen: React.FC<InicioMapaScreenProps> = ({
  onNavigateToRotas,
  onNavigateToTab,
  onShowToast,
}) => {
  const [mapDisplayMode, setMapDisplayMode] = useState<'satellite-gps' | 'isometric-2d'>('satellite-gps');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showTactileLayer, setShowTactileLayer] = useState<boolean>(true);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'Todos', icon: 'apps' },
    { id: 'labs', label: 'Laboratórios', icon: 'science' },
    { id: 'salas', label: 'Salas de Aula', icon: 'school' },
    { id: 'admin', label: 'Secretaria & Coord.', icon: 'badge' },
    { id: 'biblioteca', label: 'Biblioteca', icon: 'local_library' },
    { id: 'cantina', label: 'Cantina & Grêmio', icon: 'restaurant' },
    { id: 'acessivel', label: 'Banheiros PWD', icon: 'accessible' },
  ];

  const filteredLocations = POPULAR_LOCATIONS.filter((loc) => {
    const matchesCat = activeCategory === 'all' || loc.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.statusText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 1.8));
    onShowToast('Zoom aumentado', 'zoom_in');
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.8));
    onShowToast('Zoom reduzido', 'zoom_out');
  };

  const handleRecenter = () => {
    setZoomLevel(1);
    setSelectedBlock(null);
    onShowToast('Centralizado na sua posição atual (Guarita)', 'my_location');
  };

  const handleBlockClick = (blockName: string, desc: string) => {
    setSelectedBlock(blockName);
    setSearchQuery(blockName);
    onShowToast(`Selecionado: ${blockName} - ${desc}`, 'location_on');
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onShowToast('Busca por voz simulada: ouvindo...', 'mic');
      setIsVoiceListening(true);
      setTimeout(() => {
        setIsVoiceListening(false);
        setSearchQuery('Lab. de Informática');
        onShowToast('Encontrado: "Lab. de Informática"', 'check');
      }, 1500);
      return;
    }

    try {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      setIsVoiceListening(true);
      onShowToast('Fale o local desejado (ex: Bloco C, Biblioteca)...', 'mic');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceListening(false);
        onShowToast(`Buscando por: "${transcript}"`, 'search');
      };

      recognition.onerror = () => {
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch {
      setIsVoiceListening(false);
      setSearchQuery('Lab. de Informática');
    }
  };

  return (
    <div className="flex flex-col w-full relative max-w-2xl mx-auto pb-24">
      {/* Search & Action Top Deck */}
      <div className="px-4 pt-2 pb-1 flex flex-col gap-2 bg-[#f9f9ff] z-20">
        <div className="relative w-full shadow-md rounded-xl bg-surface-container-lowest flex items-center px-3.5 py-1 border border-outline-variant/30">
          <span className="material-symbols-outlined text-primary text-[22px] mr-2 select-none">
            search
          </span>
          <input
            aria-label="Buscar sala, laboratório, bloco ou setor"
            className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none min-w-0 py-2.5 font-medium"
            id="campus-search"
            placeholder="Buscar sala, bloco, laboratório..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-outline hover:text-on-surface p-1 mr-1"
              aria-label="Limpar busca"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <div className="flex items-center gap-1 pl-1">
            <button
              aria-label="Busca por voz"
              onClick={handleVoiceSearch}
              className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors ${
                isVoiceListening ? 'bg-primary text-white animate-pulse' : 'text-on-surface-variant'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
            <button
              aria-label="Escanear QR Code no totem do campus"
              onClick={() => onShowToast('Escaneando totem do campus...', 'qr_code_scanner')}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed-dim transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  onShowToast(`Filtro: ${cat.label}`, cat.icon);
                }}
                className={`filter-chip px-3.5 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap shadow-sm flex items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Urgent Academic Shift Alert Banner */}
        <button
          onClick={() => onNavigateToTab('avisos-mudancas')}
          className="w-full bg-secondary-fixed/50 hover:bg-secondary-fixed/80 p-3 rounded-xl shadow-sm flex items-center justify-between gap-2 transition-all group text-left border border-secondary/20"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-primary flex-shrink-0">
              <span className="material-symbols-outlined text-[18px]">info</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  Aviso Hoje
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              </div>
              <p className="text-xs text-on-secondary-fixed font-medium truncate">
                ADS 2024 remanejada: Bloco B • Sala 12
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-secondary text-[20px] group-hover:translate-x-0.5 transition-transform flex-shrink-0">
            chevron_right
          </span>
        </button>
      </div>

      {/* Map Mode Toggle Deck */}
      <div className="px-4 pt-1.5 pb-1 flex items-center justify-between">
        <div className="bg-surface-container rounded-xl p-1 flex items-center gap-1 shadow-xs border border-outline-variant/30">
          <button
            onClick={() => {
              setMapDisplayMode('satellite-gps');
              onShowToast('Modo Maps: Satélite & GPS Ao Vivo ativado', 'satellite_alt');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapDisplayMode === 'satellite-gps'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">satellite_alt</span>
            <span>Satélite & GPS Maps</span>
          </button>
          <button
            onClick={() => {
              setMapDisplayMode('isometric-2d');
              onShowToast('Modo Planta 2.5D Isométrica ativado', 'layers');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapDisplayMode === 'isometric-2d'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">layers</span>
            <span>Planta 2.5D</span>
          </button>
        </div>

        <span className="text-[11px] font-semibold text-secondary flex items-center gap-1 bg-secondary-container px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
          BR-210 Km 3
        </span>
      </div>

      {mapDisplayMode === 'satellite-gps' ? (
        <div className="px-4 my-1">
          <CampusGpsMap
            onNavigateToRotas={onNavigateToRotas}
            onShowToast={onShowToast}
            initialDestination="Lab. de Informática 03 (Bloco C • 1º Andar)"
          />
        </div>
      ) : (
        /* Interactive 2.5D Campus Spatial Map Stage */
        <div className="relative w-full h-[470px] overflow-hidden bg-[#f0f3ff] select-none rounded-xl mx-auto my-1 border border-outline-variant/20 shadow-inner">
        {/* SVG Vector Stylized Campus Map Layout */}
        <svg
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
          fill="none"
          viewBox="0 0 1000 750"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="groundGrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="greenFieldGrad" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#D1FAE5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </linearGradient>
            <linearGradient id="roofGrad" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </linearGradient>
            <filter height="130%" id="mapShadow" width="130%" x="-10%" y="-10%">
              <feDropShadow dx="2" dy="8" floodColor="#0f172a" floodOpacity="0.12" stdDeviation="6" />
            </filter>
            <filter height="140%" id="softGlow" width="140%" x="-20%" y="-20%">
              <feGaussianBlur result="blur" stdDeviation="3" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Campus Terrain Background */}
          <rect fill="url(#groundGrad)" height="750" width="1000" />

          {/* Forest & Green Reserves (Amazonian campus character) */}
          <path
            d="M 20 20 Q 220 50 320 20 L 400 120 Q 250 180 30 140 Z"
            fill="url(#greenFieldGrad)"
            opacity="0.65"
          />
          <path
            d="M 700 30 C 820 40 920 120 980 200 L 980 20 L 700 20 Z"
            fill="url(#greenFieldGrad)"
            opacity="0.65"
          />
          <path
            d="M 780 480 Q 940 500 960 700 L 760 720 Z"
            fill="url(#greenFieldGrad)"
            opacity="0.5"
          />

          {/* Paved Internal Campus Walkways */}
          <path
            d="M 120 730 L 140 540 L 320 540 L 320 380 L 520 380 L 520 200 L 760 200 L 760 480 L 520 480"
            stroke="#CBD5E1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="26"
          />
          <path
            d="M 320 540 L 520 540 L 520 380"
            stroke="#CBD5E1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="26"
          />
          <path
            d="M 520 380 L 760 380"
            stroke="#CBD5E1"
            strokeLinecap="round"
            strokeWidth="26"
          />

          {/* Accessible Ramp / Tactile Guiding Line */}
          {showTactileLayer && (
            <path
              d="M 140 680 L 140 540 L 320 540 L 320 400 L 480 400"
              opacity="0.9"
              stroke="#1976D2"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeWidth="4"
            />
          )}

          {/* Estacionamento */}
          <g opacity="0.8" transform="translate(60, 410)">
            <rect fill="#E2E8F0" height="90" rx="8" width="130" stroke="#CBD5E1" />
            <text
              fill="#64748B"
              fontFamily="Inter"
              fontSize="12"
              fontWeight="600"
              textAnchor="middle"
              x="65"
              y="48"
            >
              ESTACIONAMENTO
            </text>
            <circle cx="65" cy="24" fill="#94A3B8" r="10" />
            <text
              fill="#FFFFFF"
              fontFamily="Inter"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              x="65"
              y="28"
            >
              P
            </text>
          </g>

          {/* Ginásio Poliesportivo */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            filter="url(#mapShadow)"
            onClick={() => handleBlockClick('Ginásio Poliesportivo', 'Quadra Coberta')}
            transform="translate(680, 500)"
          >
            <rect fill="#0284C7" height="150" opacity="0.88" rx="14" width="220" />
            <rect fill="#38BDF8" height="120" opacity="0.4" rx="6" width="190" x="15" y="15" />
            <circle cx="110" cy="75" fill="none" r="28" stroke="#FFFFFF" strokeWidth="3" />
            <line stroke="#FFFFFF" strokeWidth="3" x1="110" x2="110" y1="15" y2="135" />
            <text
              fill="#FFFFFF"
              fontFamily="Plus Jakarta Sans"
              fontSize="13"
              fontWeight="700"
              textAnchor="middle"
              x="110"
              y="80"
            >
              GINÁSIO POLIESPORTIVO
            </text>
          </g>

          {/* BLOCO A */}
          <g
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            filter="url(#mapShadow)"
            id="block-a"
            onClick={() => handleBlockClick('Bloco A', 'Biblioteca Central & Secretaria')}
            transform="translate(180, 220)"
          >
            <path d="M 0 120 L 0 135 L 200 135 L 200 120 Z" fill="#94A3B8" />
            <path d="M 200 120 L 200 135 L 215 125 L 215 110 Z" fill="#64748B" />
            <rect
              fill="url(#roofGrad)"
              height="120"
              rx="12"
              width="200"
              stroke={selectedBlock === 'Bloco A' ? '#006C2D' : 'transparent'}
              strokeWidth="3"
            />
            <rect fill="#FFFFFF" height="104" rx="8" width="184" x="8" y="8" />
            <rect fill="#006C2D" height="24" rx="6" width="38" x="16" y="16" />
            <text
              fill="#FFFFFF"
              fontFamily="Plus Jakarta Sans"
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              x="35"
              y="32"
            >
              A
            </text>
            <text
              fill="#111C2C"
              fontFamily="Plus Jakarta Sans"
              fontSize="13"
              fontWeight="700"
              x="62"
              y="32"
            >
              BLOCO A
            </text>
            <text fill="#475569" fontFamily="Inter" fontSize="11" fontWeight="500" x="18" y="62">
              Biblioteca Central Mário Ypiranga
            </text>
            <text fill="#475569" fontFamily="Inter" fontSize="11" fontWeight="500" x="18" y="80">
              Secretaria Acadêmica · CRA · Direção
            </text>
            <circle cx="180" cy="28" fill="#E8F8F0" r="9" />
            <text
              fill="#006C2D"
              fontFamily="Inter"
              fontSize="10"
              fontWeight="700"
              textAnchor="middle"
              x="180"
              y="32"
            >
              ♿
            </text>
          </g>

          {/* BLOCO B */}
          <g
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            filter="url(#mapShadow)"
            id="block-b"
            onClick={() => handleBlockClick('Bloco B', 'Salas de Aula 01 a 16')}
            transform="translate(440, 110)"
          >
            <path d="M 0 130 L 0 145 L 220 145 L 220 130 Z" fill="#94A3B8" />
            <path d="M 220 130 L 220 145 L 235 135 L 235 120 Z" fill="#64748B" />
            <rect
              fill="url(#roofGrad)"
              height="130"
              rx="12"
              width="220"
              stroke={selectedBlock === 'Bloco B' ? '#006C2D' : 'transparent'}
              strokeWidth="3"
            />
            <rect fill="#FFFFFF" height="114" rx="8" width="204" x="8" y="8" />
            <rect fill="#006C2D" height="24" rx="6" width="38" x="16" y="16" />
            <text
              fill="#FFFFFF"
              fontFamily="Plus Jakarta Sans"
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              x="35"
              y="32"
            >
              B
            </text>
            <text
              fill="#111C2C"
              fontFamily="Plus Jakarta Sans"
              fontSize="13"
              fontWeight="700"
              x="62"
              y="32"
            >
              BLOCO B · ENSINO
            </text>
            <text fill="#475569" fontFamily="Inter" fontSize="11" fontWeight="500" x="18" y="62">
              Salas 01 a 16 · 2 Pavimentos
            </text>
            <text fill="#15803D" fontFamily="Inter" fontSize="11" fontWeight="600" x="18" y="82">
              📍 Turma ADS 2024 na Sala 12
            </text>
            <rect fill="#E0F2FE" height="18" rx="4" width="70" x="18" y="94" />
            <text
              fill="#0369A1"
              fontFamily="Inter"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
              x="53"
              y="106"
            >
              ELEVADOR
            </text>
          </g>

          {/* BLOCO C */}
          <g
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            filter="url(#mapShadow)"
            id="block-c"
            onClick={() => handleBlockClick('Bloco C', 'Laboratórios de Informática & Redes')}
            transform="translate(440, 280)"
          >
            <path d="M 0 140 L 0 155 L 230 155 L 230 140 Z" fill="#94A3B8" />
            <path d="M 230 140 L 230 155 L 245 145 L 245 130 Z" fill="#64748B" />
            <rect
              fill="url(#roofGrad)"
              height="140"
              rx="12"
              width="230"
              stroke={selectedBlock === 'Bloco C' ? '#006C2D' : 'transparent'}
              strokeWidth="3"
            />
            <rect fill="#FFFFFF" height="124" rx="8" width="214" x="8" y="8" />
            <rect fill="#006C2D" height="24" rx="6" width="38" x="16" y="16" />
            <text
              fill="#FFFFFF"
              fontFamily="Plus Jakarta Sans"
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              x="35"
              y="32"
            >
              C
            </text>
            <text
              fill="#111C2C"
              fontFamily="Plus Jakarta Sans"
              fontSize="13"
              fontWeight="700"
              x="62"
              y="32"
            >
              BLOCO C · LABS
            </text>
            <text fill="#475569" fontFamily="Inter" fontSize="11" fontWeight="500" x="18" y="62">
              Lab. Informática 01 a 06 · Redes
            </text>
            <text fill="#475569" fontFamily="Inter" fontSize="11" fontWeight="500" x="18" y="80">
              Lab. Mineração, Química e Física
            </text>
            <rect fill="#DCFCE7" height="20" rx="5" width="86" x="18" y="98" />
            <text
              fill="#166534"
              fontFamily="Inter"
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
              x="61"
              y="112"
            >
              ABERTO AGORA
            </text>
          </g>

          {/* BLOCO D */}
          <g
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            filter="url(#mapShadow)"
            id="block-d"
            onClick={() => handleBlockClick('Bloco D', 'Cantina e Espaço de Convivência')}
            transform="translate(240, 430)"
          >
            <path d="M 0 100 L 0 112 L 180 112 L 180 100 Z" fill="#94A3B8" />
            <path d="M 180 100 L 180 112 L 192 104 L 192 92 Z" fill="#64748B" />
            <rect
              fill="url(#roofGrad)"
              height="100"
              rx="12"
              width="180"
              stroke={selectedBlock === 'Bloco D' ? '#006C2D' : 'transparent'}
              strokeWidth="3"
            />
            <rect fill="#FFFFFF" height="84" rx="8" width="164" x="8" y="8" />
            <rect fill="#006C2D" height="24" rx="6" width="38" x="16" y="16" />
            <text
              fill="#FFFFFF"
              fontFamily="Plus Jakarta Sans"
              fontSize="12"
              fontWeight="700"
              textAnchor="middle"
              x="35"
              y="32"
            >
              D
            </text>
            <text
              fill="#111C2C"
              fontFamily="Plus Jakarta Sans"
              fontSize="13"
              fontWeight="700"
              x="62"
              y="32"
            >
              BLOCO D
            </text>
            <text fill="#475569" fontFamily="Inter" fontSize="11" fontWeight="500" x="18" y="60">
              Cantina & Espaço de Alimentação
            </text>
            <text fill="#475569" fontFamily="Inter" fontSize="11" fontWeight="500" x="18" y="78">
              Grêmio · Mesas de Jogos
            </text>
          </g>

          {/* Portaria Principal */}
          <g transform="translate(80, 620)">
            <rect fill="#334155" height="56" rx="10" width="140" />
            <text
              fill="#F8FAFC"
              fontFamily="Plus Jakarta Sans"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              x="70"
              y="26"
            >
              PORTARIA PRINCIPAL
            </text>
            <text
              fill="#94A3B8"
              fontFamily="Inter"
              fontSize="10"
              fontWeight="500"
              textAnchor="middle"
              x="70"
              y="44"
            >
              Catracas & Segurança
            </text>
          </g>

          {/* LIVE USER LOCATION PIN: Pulsing Radar Marker */}
          <g id="user-location" transform="translate(150, 590)">
            <circle cx="0" cy="0" fill="#1B873F" opacity="0.25" r="28">
              <animate
                attributeName="r"
                dur="2.4s"
                repeatCount="indefinite"
                values="10;36;10"
              />
              <animate
                attributeName="opacity"
                dur="2.4s"
                repeatCount="indefinite"
                values="0.4;0.0;0.4"
              />
            </circle>
            <circle cx="0" cy="0" fill="#FFFFFF" filter="url(#softGlow)" r="14" />
            <circle cx="0" cy="0" fill="#1B873F" r="9" />
            <path d="M 0 -7 L 6 0 L -6 0 Z" fill="#0D532B" />
            <g transform="translate(18, -26)">
              <rect fill="#0F172A" height="26" opacity="0.92" rx="6" width="138" />
              <text fill="#FFFFFF" fontFamily="Inter" fontSize="11" fontWeight="600" x="10" y="17">
                Você está aqui
              </text>
              <circle cx="124" cy="13" fill="#4ADE80" r="4" />
            </g>
          </g>
        </svg>

        {/* Map Floating Compass & View Controls (Right Side) */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <button
            aria-label="Centralizar na minha localização"
            className="w-11 h-11 rounded-full bg-surface-container-lowest text-on-surface shadow-md hover:bg-surface-container flex items-center justify-center transition-transform active:scale-95 border border-outline-variant/30"
            onClick={handleRecenter}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px] text-primary">my_location</span>
          </button>

          <div className="flex flex-col rounded-xl bg-surface-container-lowest shadow-md overflow-hidden border border-outline-variant/30">
            <button
              aria-label="Aproximar mapa"
              className="w-11 h-10 text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
              onClick={handleZoomIn}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
            <div className="h-px bg-outline-variant/30 w-full"></div>
            <button
              aria-label="Afastar mapa"
              className="w-11 h-10 text-on-surface hover:bg-surface-container flex items-center justify-center transition-colors"
              onClick={handleZoomOut}
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
          </div>

          <button
            aria-label="Alternar camadas de acessibilidade"
            className={`w-11 h-11 rounded-full bg-surface-container-lowest text-on-surface shadow-md hover:bg-surface-container flex items-center justify-center transition-transform active:scale-95 border border-outline-variant/30 ${
              showTactileLayer ? 'ring-2 ring-tertiary text-tertiary' : ''
            }`}
            onClick={() => {
              setShowTactileLayer(!showTactileLayer);
              onShowToast(
                showTactileLayer ? 'Trilha podotátil oculta' : 'Trilha podotátil ativa no mapa',
                'layers'
              );
            }}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">layers</span>
          </button>

          <button
            aria-label="Norte magnético"
            className="w-11 h-11 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center border border-outline-variant/30 active:scale-95"
            onClick={() => onShowToast('Orientação: Norte verdadeiro', 'explore')}
            type="button"
          >
            <span className="font-display font-bold text-lg text-error">N</span>
          </button>
        </div>

        {/* Campus Ground Legend Capsule (Left Bottom) */}
        <div className="absolute left-3 bottom-3 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-outline-variant/30">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-on-surface">Campus Macapá · Ativo</span>
          </div>
        </div>
      </div>
      )}

      {/* Bottom Wayfinding & Discovery Peek Sheet */}
      <div className="w-full bg-surface-container-lowest rounded-t-3xl shadow-xl px-4 pt-4 pb-6 flex flex-col gap-4 z-20 -mt-3 border-t border-outline-variant/30">
        <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto -mt-1 cursor-pointer"></div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-on-surface">
              Destinos Populares
            </h2>
            <p className="text-xs text-on-surface-variant">Rotas rápidas a partir da sua posição</p>
          </div>
          <button
            onClick={() => onNavigateToRotas()}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Ver todos ({POPULAR_LOCATIONS.length})
          </button>
        </div>

        {/* List of Destinations */}
        <div className="flex flex-col gap-2.5">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => onNavigateToRotas(loc.name)}
                className="p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between gap-3 cursor-pointer group border border-outline-variant/20 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-primary flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]">{loc.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-on-surface truncate">
                        {loc.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold flex-shrink-0">
                        {loc.block}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">
                      {loc.floor} · {loc.distance} • {loc.statusText}
                    </p>
                  </div>
                </div>

                <button
                  aria-label={`Traçar rota até ${loc.name}`}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0 shadow-sm"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">directions</span>
                </button>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-on-surface-variant text-sm">
              Nenhum local encontrado para &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>

        {/* Primary Floating Command Bar */}
        <div className="w-full pt-1 flex gap-2">
          <button
            onClick={() => onNavigateToRotas('Lab. de Informática 03 (Bloco C • 1º Andar)')}
            className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-primary-container transition-all active:scale-[0.98]"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">explore</span>
            <span>Iniciar Navegação Guiada</span>
          </button>
          <button
            aria-label="Rotas 100% acessíveis para cadeirantes"
            onClick={() => onNavigateToTab('acessibilidade')}
            className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary font-bold flex items-center justify-center shadow-md hover:bg-tertiary transition-all active:scale-95 flex-shrink-0"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">accessible</span>
          </button>
        </div>
      </div>
    </div>
  );
};
