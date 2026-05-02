export type PersonaTipo = "particular" | "monotributista" | "responsable_inscripto" | "empresa";
export type VehiculoTipo =
  | "utilitario" | "furgon" | "camion_chico" | "camion_grande"
  | "semi" | "tractor" | "batea" | "tolva" | "cisterna" | "porta_contenedor" | "otro";
export type DocumentoTipo =
  | "dni" | "cuit" | "ruta" | "poliza_seguro" | "vtv" | "cedula_verde"
  | "cedula_azul" | "licencia_conducir" | "libreta_sanitaria" | "monotributo" | "otro";
export type DocumentoEstado = "pendiente" | "aprobado" | "rechazado" | "vencido";

export interface TransportistaProfile {
  user_id: string;
  cuit: string;
  razon_social: string | null;
  tipo: PersonaTipo;
  ciudad: string | null;
  provincia: string | null;
  radio_operacion_km: number;
  bio: string | null;
  rating_promedio: number;
  cantidad_viajes: number;
  suscripcion_activa: boolean;
}

export interface Vehiculo {
  id: string;
  tipo: VehiculoTipo;
  patente: string;
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  capacidad_kg: number;
  refrigerado: boolean;
  tiene_hidrogrua: boolean;
  foto_principal_url: string | null;
  verificado: boolean;
}

export interface Documento {
  id: string;
  tipo: DocumentoTipo;
  archivo_url: string;
  vencimiento: string | null;
  estado: DocumentoEstado;
  motivo_rechazo: string | null;
  created_at: string;
}

export const PROVINCIAS_AR = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

export const VEHICULO_TIPO_LABELS: Record<VehiculoTipo, string> = {
  utilitario: "Utilitario", furgon: "Furgón", camion_chico: "Camión chico",
  camion_grande: "Camión grande", semi: "Semi", tractor: "Tractor",
  batea: "Batea", tolva: "Tolva", cisterna: "Cisterna",
  porta_contenedor: "Porta contenedor", otro: "Otro",
};
