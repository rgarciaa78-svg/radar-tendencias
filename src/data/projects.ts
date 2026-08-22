export interface Project {
  id: string;
  marca: 'tigo' | 'straal' | 'byd';
  familia: string;
  nombre: string;
  objetivo: string;
  claims: string[];
  fecha: string;
  etapas: boolean[];
  ingredientes: string;
}

export const projectsData: Project[] = [
  // ── TIGO ─────────────────────────────────────────────────────────────────
  {
    id: 't01', marca: 'tigo', familia: 'Yogurt Natural',
    nombre: 'Yogurt de arándano · Vaso 150 g',
    objetivo: 'Ampliación de portafolio con nuevos sabores regionales de alto valor',
    claims: ['Sin octógonos', 'Sin azúcar añadida', 'Con probióticos', 'Pulpa edulcorada arándano', 'Alto en proteína 10%'],
    fecha: 'Dic-26',
    etapas: [true,true,true,true,true,true,true,true,true,true,false],
    ingredientes: 'Leche parcialmente descremada, cultivos lácticos activos (Streptococcus thermophilus, Lactobacillus bulgaricus), pulpa de arándano edulcorada, sucralosa.',
  },
  {
    id: 't02', marca: 'tigo', familia: 'Yogurt Bebible',
    nombre: 'Bebida láctea fermentada · Botella 1 L',
    objetivo: 'Reposicionar el yogurt bebible como opción familiar de gran formato',
    claims: ['Sin conservantes', 'Fuente de calcio', 'Con probióticos', 'Sin colorantes artificiales'],
    fecha: 'Ene-27',
    etapas: [true,true,true,true,true,true,true,false,false,false,false],
    ingredientes: 'Leche entera, cultivos lácticos (S. thermophilus, L. bulgaricus), azúcar, saborizante natural de fresa.',
  },
  {
    id: 't03', marca: 'tigo', familia: 'Quesos',
    nombre: 'Queso fresco bajo en sodio · 500 g',
    objetivo: 'Capturar segmento salud con queso reducido en sodio para consumo diario',
    claims: ['35% menos sodio', 'Sin conservantes', 'Fuente de calcio'],
    fecha: 'Feb-27',
    etapas: [true,true,true,true,true,false,false,false,false,false,false],
    ingredientes: 'Leche entera pasteurizada, cuajo microbiano, cultivos lácticos, cloruro de calcio. Sin adición de sal.',
  },
  {
    id: 't04', marca: 'tigo', familia: 'Cremas',
    nombre: 'Crema de leche UHT · 200 mL',
    objetivo: 'Ingresar al segmento de cremas UHT de larga vida con formato individual',
    claims: ['Sin conservantes', 'Larga vida útil', 'Formato individual'],
    fecha: 'Mar-27',
    etapas: [true,true,true,false,false,false,false,false,false,false,false],
    ingredientes: '',
  },
  {
    id: 't05', marca: 'tigo', familia: 'Mantequilla',
    nombre: 'Mantequilla con sal marina · 200 g',
    objetivo: 'Premiumizar la línea de mantequillas con sal marina de origen natural',
    claims: ['Sal marina natural', 'Sin aditivos', 'Hecha con leche fresca'],
    fecha: 'Abr-27',
    etapas: [true,true,false,false,false,false,false,false,false,false,false],
    ingredientes: '',
  },

  // ── TIGO Reformulaciones ──────────────────────────────────────────────────
  {
    id: 't06', marca: 'tigo', familia: 'Yogurt Natural',
    nombre: 'Reformulación yogurt natural · Reducción azúcar',
    objetivo: 'Reducir azúcar añadida en 30% para cumplir nuevo perfil nutricional sin octógonos',
    claims: ['30% menos azúcar', 'Sin octógonos', 'Con probióticos'],
    fecha: 'Nov-26',
    etapas: [true,true,true,true,true,true,true,true,true,false,false],
    ingredientes: 'Leche entera pasteurizada, cultivos lácticos (S. thermophilus, L. bulgaricus), azúcar (reducida), pectina.',
  },
  {
    id: 't07', marca: 'tigo', familia: 'Leche Fórmula',
    nombre: 'Leche en polvo reformulada · Hierro + Zinc',
    objetivo: 'Incorporar hierro y zinc para reforzar posición nutricional frente a competencia',
    claims: ['Fuente de hierro', 'Con zinc', 'Vitamina D'],
    fecha: 'Ene-27',
    etapas: [true,true,true,true,true,true,false,false,false,false,false],
    ingredientes: '',
  },

  // ── STRAAL ───────────────────────────────────────────────────────────────
  {
    id: 's01', marca: 'straal', familia: 'Snacks Saludables',
    nombre: 'Barra proteica quinua-chía · 40 g',
    objetivo: 'Entrar al mercado de snacks funcionales con ingredientes andinos de alta proteína',
    claims: ['10 g de proteína', 'Sin gluten', 'Fuente de omega-3', 'Ingredientes andinos', 'Sin azúcar añadida'],
    fecha: 'Nov-26',
    etapas: [true,true,true,true,true,true,true,true,false,false,false],
    ingredientes: 'Quinua inflada, semillas de chía, miel de abeja, proteína de suero, pasas, sal marina.',
  },
  {
    id: 's02', marca: 'straal', familia: 'Bebidas Funcionales',
    nombre: 'Agua funcional electrolitos · 500 mL',
    objetivo: 'Capturar el segmento de hidratación premium post-ejercicio sin azúcar',
    claims: ['Sin azúcar', 'Electrolitos naturales', 'Sin colorantes', 'Isotónico'],
    fecha: 'Dic-26',
    etapas: [true,true,true,true,true,true,true,false,false,false,false],
    ingredientes: 'Agua purificada, cloruro de sodio, cloruro de potasio, citrato de magnesio, saborizante natural de limón.',
  },
  {
    id: 's03', marca: 'straal', familia: 'Smoothies',
    nombre: 'Smoothie vegano mango-maracuyá · 300 mL',
    objetivo: 'Ampliar el portafolio plant-based con frutas tropicales peruanas',
    claims: ['100% vegano', 'Sin lácteos', 'Frutas tropicales peruanas', 'Sin conservantes'],
    fecha: 'Feb-27',
    etapas: [true,true,true,true,false,false,false,false,false,false,false],
    ingredientes: '',
  },
  {
    id: 's04', marca: 'straal', familia: 'Cereales',
    nombre: 'Granola artesanal cacao-pecanas · 300 g',
    objetivo: 'Posicionar granola premium con insumos peruanos para canal moderno',
    claims: ['Sin gluten', 'Cacao peruano', 'Alto en fibra', 'Sin azúcar refinada'],
    fecha: 'Mar-27',
    etapas: [true,true,true,false,false,false,false,false,false,false,false],
    ingredientes: '',
  },
  {
    id: 's05', marca: 'straal', familia: 'Untables',
    nombre: 'Mantequilla de maní natural · 250 g',
    objetivo: 'Ofrecer mantequilla de maní sin aditivos para el segmento fit y familiar',
    claims: ['100% maní', 'Sin azúcar añadida', 'Sin aceite de palma', 'Alto en proteína'],
    fecha: 'Abr-27',
    etapas: [true,true,false,false,false,false,false,false,false,false,false],
    ingredientes: '',
  },

  // ── B&D ──────────────────────────────────────────────────────────────────
  {
    id: 'b01', marca: 'byd', familia: 'B&D Innovación',
    nombre: 'Conservas gourmet de mariscos',
    objetivo: 'Desarrollar línea premium de conservas con mariscos de extracción sostenible',
    claims: ['Pesca sostenible', 'Sin conservantes', 'Gourmet', 'Alto en omega-3'],
    fecha: 'Dic-26',
    etapas: [true,true,true,true,true,false,false,false,false,false,false],
    ingredientes: '',
  },
  {
    id: 'b02', marca: 'byd', familia: 'B&D Innovación',
    nombre: 'Snacks liofilizados frutas peruanas',
    objetivo: 'Aprovechar tecnología de liofilización para snack de exportación con frutas andinas',
    claims: ['Liofilizado', 'Sin azúcar añadida', 'Frutas peruanas', '100% natural'],
    fecha: 'Ene-27',
    etapas: [true,true,true,true,false,false,false,false,false,false,false],
    ingredientes: '',
  },
  {
    id: 'b03', marca: 'byd', familia: 'B&D Innovación',
    nombre: 'Pasta de quinua alta en proteína',
    objetivo: 'Crear pasta funcional con quinua peruana dirigida al segmento deportivo',
    claims: ['8 g proteína / porción', 'Sin gluten', 'Quinua peruana', 'Alto en hierro'],
    fecha: 'Feb-27',
    etapas: [true,true,true,false,false,false,false,false,false,false,false],
    ingredientes: '',
  },
  {
    id: 'b04', marca: 'byd', familia: 'B&D Investigación',
    nombre: 'Estudio de mercado bebidas RTD',
    objetivo: 'Evaluar viabilidad de ingresar al segmento de bebidas listas para beber en mercado local',
    claims: ['Investigación de mercado', 'Análisis competitivo'],
    fecha: 'Set-26',
    etapas: [true,true,false,false,false,false,false,false,false,false,false],
    ingredientes: '',
  },
];
