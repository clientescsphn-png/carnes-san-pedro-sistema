// Tipos de productos
export type TipoProducto = 'chorizo' | 'carne_molida';

export type TipoPaquete = 
  | 'detalle_1_2' 
  | 'mayoreo_1_2' 
  | 'paquete_4_onz' 
  | 'paquete_4_onz_mayoreo' 
  | 'distribuidor' 
  | 'distribuido_4_onzas';

// Precios por tipo de paquete (valores por defecto)
export const PRECIOS_DEFAULT: Record<TipoPaquete, number> = {
  detalle_1_2: 27,
  mayoreo_1_2: 0, // Definir por usuario
  paquete_4_onz: 0, // Definir por usuario
  paquete_4_onz_mayoreo: 0,
  distribuidor: 0,
  distribuido_4_onzas: 0,
};

// Nombres descriptivos para mostrar
export const NOMBRES_PAQUETE: Record<TipoPaquete, string> = {
  detalle_1_2: 'Detalle 1/2',
  mayoreo_1_2: 'Mayoreo 1/2',
  paquete_4_onz: 'Paquete 4 Onz.',
  paquete_4_onz_mayoreo: 'Paquete 4 Onz. Mayoreo',
  distribuidor: 'Distribuidor',
  distribuido_4_onzas: 'Distribuido 4 Onzas',
};

// Meses del año
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

export type Mes = typeof MESES[number];

// Semanas (1-5)
export const SEMANAS = [1, 2, 3, 4, 5] as const;

// Días de la semana
export const DIAS_SEMANA = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
] as const;

export type DiaSemana = typeof DIAS_SEMANA[number];

// Registro de venta individual
export interface VentaDia {
  id: string;
  mes: Mes;
  semana: number;
  dia: DiaSemana;
  producto: TipoProducto;
  paquete: TipoPaquete;
  unidades: number;
  precioUnitario: number;
  total: number;
  fechaRegistro: string;
}

// Totales por día
export interface TotalDia {
  dia: DiaSemana;
  ventas: Record<TipoPaquete, number>;
  totalDia: number;
}

// Totales por semana
export interface TotalSemana {
  semana: number;
  dias: TotalDia[];
  totalSemana: number;
}

// Totales por mes
export interface TotalMes {
  mes: Mes;
  semanas: TotalSemana[];
  totalMes: number;
}

// Precios configurados por el usuario
export interface ConfiguracionPrecios {
  chorizo: Record<TipoPaquete, number>;
  carne_molida: Record<TipoPaquete, number>;
}

// Estado global de la aplicación
export interface AppState {
  ventas: VentaDia[];
  precios: ConfiguracionPrecios;
  mesSeleccionado: Mes;
  semanaSeleccionada: number;
  diaSeleccionado: DiaSemana;
}
