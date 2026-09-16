export type TabType = 'inicio-mapa' | 'rotas' | 'avisos-mudancas' | 'acessibilidade';

export type MapLayerType = 'satellite' | 'street' | 'isometric';

export interface GpsCoordinate {
  lat: number;
  lng: number;
}

export interface CampusLocation {
  id: string;
  name: string;
  category: 'labs' | 'salas' | 'admin' | 'biblioteca' | 'cantina' | 'acessivel';
  block: string;
  floor: string;
  distance: string;
  statusText: string;
  icon: string;
  coordinates?: GpsCoordinate;
}

export interface NavigationStep {
  number: number;
  title: string;
  distance: string;
  instruction: string;
  badgeText?: string;
  coordinates?: GpsCoordinate;
  heading?: number;
  subBadges?: { label: string; icon?: string; colorClass?: string }[];
}

export interface VisualLandmark {
  id: string;
  numberTag: string;
  title: string;
  location: string;
  imageUrl: string;
  tagBg: string;
  coordinates?: GpsCoordinate;
}

export interface CampusNotice {
  id: string;
  title: string;
  subtitle?: string;
  category: 'mudanca' | 'prova' | 'manutencao';
  isUrgent?: boolean;
  timeTag: string;
  courseTag?: string;
  fromLocation?: string;
  toLocation?: string;
  reason?: string;
  instructor?: string;
  discipline?: string;
  actionText?: string;
  actionTarget?: string;
}

export interface AccessibleFacility {
  id: string;
  title: string;
  category: 'sanitarios' | 'elevadores' | 'piso' | 'napne';
  block: string;
  room?: string;
  description: string;
  statusBadge: string;
  statusIcon?: string;
  capacityOrStandard?: string;
  actionLabel: string;
  coordinates?: GpsCoordinate;
}
