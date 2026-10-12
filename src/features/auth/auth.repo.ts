import type {
  Credenciales,
  RegistroEstudiante,
  RegistroTutor,
  Usuario,
} from "./auth.types";

export interface AuthRepo {
  registrarEstudiante(datos: RegistroEstudiante): Promise<Usuario>;
  registrarTutor(datos: RegistroTutor): Promise<Usuario>;
  /** Devuelve el usuario si las credenciales son correctas, `null` si no. */
  iniciarSesion(credenciales: Credenciales): Promise<Usuario | null>;
  porId(id: string): Promise<Usuario | null>;
  correoDisponible(correo: string): Promise<boolean>;
  actualizarPerfil(
    id: string,
    cambios: Partial<Omit<Usuario, "id" | "rol">>,
  ): Promise<Usuario>;
  solicitarRecuperacion(correo: string): Promise<{ tokenDemo?: string }>;
  restablecerClave(token: string, clave: string): Promise<void>;
}
