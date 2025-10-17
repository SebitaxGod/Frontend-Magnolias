/**
 * Tipos relacionados con Postulantes
 */

export interface Postulante {
  id: number;
  rut: string;
  nombre: string;
  correo: string;
  telefono?: string;
  linkedinUrl?: string;
  skillsJson?: any; // JSON con habilidades y datos adicionales
  experienciaAnios?: number;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostulanteDetalle extends Postulante {
  // Campos adicionales para vista detallada
  contrasenaHash?: string; // No se debe exponer al frontend normalmente
}

export interface PostulanteRanking {
  id: number;
  nombre_completo: string;
  email: string;
  puntajeIa: number;
  feedback?: string;
  fecha_postulacion: string;
}
