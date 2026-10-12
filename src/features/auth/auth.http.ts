import { pedir } from "@/lib/http";
import type { AuthRepo } from "./auth.repo";
import type {
  Credenciales,
  RegistroEstudiante,
  RegistroTutor,
  Usuario,
} from "./auth.types";

export class AuthHttpRepo implements AuthRepo {
  solicitarRecuperacion(correo: string) {
    return pedir<{ tokenDemo?: string }>("/auth/recuperar", {
      method: "POST",
      body: { correo },
    });
  }
  async restablecerClave(token: string, clave: string) {
    await pedir<void>("/auth/restablecer", {
      method: "POST",
      body: { token, clave },
    });
  }

  registrarEstudiante(datos: RegistroEstudiante) {
    return pedir<Usuario>("/auth/registro/estudiante", {
      method: "POST",
      body: datos,
    });
  }

  registrarTutor(datos: RegistroTutor) {
    return pedir<Usuario>("/auth/registro/tutor", {
      method: "POST",
      body: datos,
    });
  }

  iniciarSesion(credenciales: Credenciales) {
    return pedir<Usuario | null>("/auth/login", {
      method: "POST",
      body: credenciales,
    });
  }

  porId(id: string) {
    return pedir<Usuario | null>(`/usuarios/${id}`);
  }

  correoDisponible(correo: string) {
    return pedir<boolean>("/auth/correo-disponible", { query: { correo } });
  }

  actualizarPerfil(id: string, cambios: Partial<Omit<Usuario, "id" | "rol">>) {
    return pedir<Usuario>(`/usuarios/${id}`, {
      method: "PATCH",
      body: cambios,
    });
  }
}
