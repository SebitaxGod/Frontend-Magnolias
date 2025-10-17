/**
 * Punto de entrada centralizado para todos los tipos
 */

// Postulante
export type {
  Postulante,
  PostulanteDetalle,
  PostulanteRanking,
} from "./postulante.types";

// Empresa
export type { Empresa, EmpresaDetalle } from "./empresa.types";

// Cargo
export type {
  Cargo,
  CargoDetalle,
  PreguntaCargo,
  CreateCargoDTO,
  TipoContrato,
  Modalidad,
} from "./cargo.types";

// Postulación
export type {
  Postulacion,
  PostulacionDetalle,
  RespuestaPostulacion,
  CreatePostulacionDTO,
  PostulacionFormData,
  EstadoPostulacion,
} from "./postulacion.types";

// Auth
export type {
  LoginCredentials,
  LoginResponse,
  RegisterEmpresaDTO,
  RegisterPostulanteDTO,
  AuthUser,
  UserType,
} from "./auth.types";

// Common
export type { ApiResponse, PaginatedResponse, ApiError } from "./common.types";
