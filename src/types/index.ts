export type Region = 'Europa' | 'Estados Unidos' | 'Asia' | 'Latam' | 'Global';
export type Brand = 'TIGO' | 'B&D' | 'Straal' | 'Nueva marca' | 'Todas';
export type Priority = 'Alta' | 'Media' | 'Baja';
export type Complexity = 'Baja' | 'Media' | 'Alta';
export type Status = 'Detectada' | 'En evaluación' | 'En prototipo' | 'Descartada' | 'Lista para lanzar';
export type SourceType = 'Red social' | 'Investigación científica' | 'Reporte de mercado' | 'Lanzamiento de producto' | 'Noticia' | 'Supermercado';

export type Category =
  | 'Yogurt y yogurt griego'
  | 'Alimentos altos en proteína'
  | 'Salud digestiva'
  | 'Probióticos y prebióticos'
  | 'Salsas y condimentos'
  | 'Sabores globales'
  | 'Nutrición deportiva'
  | 'Snacks saludables'
  | 'Bebidas funcionales'
  | 'Empaques sostenibles'
  | 'Formatos on-the-go'
  | 'Agua funcional y proteica'
  | 'Leches vegetales'
  | 'Kombucha y fermentados'
  | 'Proteína RTD'
  | 'Bebidas energéticas limpias'
  | 'Colágeno y belleza'
  | 'Nootropics y cognición'
  | 'Nutrición femenina'
  | 'Longevidad y antiaging';

export interface Source {
  label: string;
  url: string;
  type: 'tiktok' | 'instagram' | 'facebook' | 'x' | 'youtube' | 'paper' | 'product' | 'article' | 'report';
}

export interface Brief {
  objetivo: string;
  publicoObjetivo: string;
  mensajeClave: string;
  posicionamiento: string;
  canales: string[];
  timeline: string;
  presupuesto: string;
  kpis: string[];
}

export interface GlobalSignal {
  id: string;
  region: Region;
  country: string;
  brand: 'TIGO' | 'Straal' | 'B&D' | 'Global';
  headline: string;
  context: string;
  peruNovelty: string;
  impact: 'Alto' | 'Medio' | 'Bajo';
  category: Category;
  date: string;
  source: string;
  tags: string[];
}

export interface Launch {
  id: string;
  productName: string;
  company: string;
  interestedBrand: 'TIGO' | 'B&D' | 'Straal';
  market: string;
  region: Region;
  category: Category;
  launchDate: string;
  description: string;
  whatIsNew: string;
  peruRelevance: string;
  score: number;
  tags: string[];
  brief?: Brief;
}

export interface Trend {
  id: string;
  name: string;
  region: Region;
  country: string;
  category: Category;
  sourceType: SourceType;
  sources?: Source[];
  evidence: string;
  brand: Brand;
  peruOpportunity: string;
  suggestedAction: string;
  score: number;
  priority: Priority;
  complexity: Complexity;
  status: Status;
  isFavorite: boolean;
  detectedAt: string;
  tags: string[];
  notes?: string;
  brief: Brief;
}
