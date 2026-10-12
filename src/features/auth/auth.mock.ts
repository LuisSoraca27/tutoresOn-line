import { almacen, siguienteId } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import { randomBytes } from "node:crypto";
import type { Tutor } from "@/features/tutores/tutor.types";
import type { AuthRepo } from "./auth.repo";
import type {
  Credenciales,
  RegistroEstudiante,
  RegistroTutor,
  Usuario,
} from "./auth.types";

/** Normaliza el correo: la gente escribe "Sara@Ejemplo.CO " y espera entrar. */
function limpiarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

/**
 * Autenticación simulada.
 *
 * Las claves se guardan en claro porque este repositorio nunca sale del
 * proceso de desarrollo. El hash es responsabilidad de FastAPI —bcrypt o
 * argon2— y por eso `AuthRepo` nunca expone la clave: entra en el registro
 * y en el inicio de sesión, y no vuelve a salir.
 */
export class AuthMockRepo implements AuthRepo {
  async solicitarRecuperacion(correo: string): Promise<{ tokenDemo?: string }> {
    await demora(300);
    const cuenta = almacen.cuentas.find(
      (item) => item.usuario.correo === limpiarCorreo(correo),
    );
    if (!cuenta) return {};
    const token = randomBytes(32).toString("hex");
    almacen.recuperaciones = almacen.recuperaciones.filter(
      (item) =>
        item.usuarioId !== cuenta.usuario.id && item.venceEn > Date.now(),
    );
    almacen.recuperaciones.push({
      token,
      usuarioId: cuenta.usuario.id,
      venceEn: Date.now() + 15 * 60 * 1000,
    });
    return { tokenDemo: token };
  }

  async restablecerClave(token: string, clave: string): Promise<void> {
    await demora(300);
    const recuperacion = almacen.recuperaciones.find(
      (item) => item.token === token && item.venceEn > Date.now(),
    );
    const cuenta =
      recuperacion &&
      almacen.cuentas.find(
        (item) => item.usuario.id === recuperacion.usuarioId,
      );
    if (!cuenta || !recuperacion)
      throw new Error("El enlace venció o ya fue usado. Solicita uno nuevo.");
    cuenta.clave = clave;
    almacen.recuperaciones = almacen.recuperaciones.filter(
      (item) => item.usuarioId !== cuenta.usuario.id,
    );
  }

  async iniciarSesion({
    correo,
    clave,
  }: Credenciales): Promise<Usuario | null> {
    await demora(500);

    const cuenta = almacen.cuentas.find(
      (candidata) => candidata.usuario.correo === limpiarCorreo(correo),
    );

    // Mismo tiempo de respuesta exista o no la cuenta: si no, se puede
    // averiguar qué correos están registrados midiendo la demora.
    if (!cuenta || cuenta.clave !== clave) return null;

    return cuenta.usuario;
  }

  async porId(id: string): Promise<Usuario | null> {
    return (
      almacen.cuentas.find((cuenta) => cuenta.usuario.id === id)?.usuario ??
      null
    );
  }

  async correoDisponible(correo: string): Promise<boolean> {
    await demora(200);
    return !almacen.cuentas.some(
      (cuenta) => cuenta.usuario.correo === limpiarCorreo(correo),
    );
  }

  async registrarEstudiante(datos: RegistroEstudiante): Promise<Usuario> {
    await demora(600);

    const correo = limpiarCorreo(datos.correo);
    if (!(await this.correoDisponible(correo))) {
      throw new Error("Ya hay una cuenta con ese correo.");
    }

    const usuario: Usuario = {
      id: siguienteId("e"),
      nombre: datos.nombre.trim(),
      correo,
      rol: "estudiante",
      telefono: datos.telefono?.trim() || undefined,
      ciudadId: datos.ciudadId,
      nivelId: datos.nivelId,
      creadoEn: new Date().toISOString(),
    };

    almacen.cuentas.push({ usuario, clave: datos.clave });
    return usuario;
  }

  async registrarTutor(datos: RegistroTutor): Promise<Usuario> {
    await demora(700);

    const correo = limpiarCorreo(datos.correo);
    if (!(await this.correoDisponible(correo))) {
      throw new Error("Ya hay una cuenta con ese correo.");
    }

    const id = siguienteId("t");

    const usuario: Usuario = {
      id,
      nombre: datos.nombre.trim(),
      correo,
      rol: "tutor",
      telefono: datos.telefono?.trim() || undefined,
      ciudadId: datos.ciudadId,
      creadoEn: new Date().toISOString(),
    };

    // Registrarse como tutor crea también el perfil público: si no, el
    // tutor entraría a la plataforma sin existir en la búsqueda.
    const perfil: Tutor = {
      id,
      nombre: usuario.nombre,
      titulo: datos.titulo.trim(),
      bio: datos.bio.trim(),
      avatarUrl: null,
      modalidad: datos.modalidad,
      ciudadId: datos.ciudadId ?? null,
      radioKm: datos.radioKm ?? null,
      materias: datos.materias,
      precioDesde: Math.min(
        ...datos.materias.map((materia) => materia.precioHora),
      ),
      // Empieza sin reputación: no se hereda ni se regala.
      reputacion: {
        promedio: 0,
        total: 0,
        distribucion: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
      },
      sesionesCompletadas: 0,
      verificado: false,
      respondeRapido: false,
      disponibleAhora: false,
      idiomas: datos.idiomas,
    };

    almacen.cuentas.push({ usuario, clave: datos.clave });
    almacen.tutores.push(perfil);

    return usuario;
  }

  async actualizarPerfil(
    id: string,
    cambios: Partial<Omit<Usuario, "id" | "rol">>,
  ): Promise<Usuario> {
    await demora(400);

    const cuenta = almacen.cuentas.find(
      (candidata) => candidata.usuario.id === id,
    );
    if (!cuenta) throw new Error("No encontramos esa cuenta.");

    if (cambios.correo) {
      const correo = limpiarCorreo(cambios.correo);
      const ocupado = almacen.cuentas.some(
        (otra) => otra.usuario.correo === correo && otra.usuario.id !== id,
      );
      if (ocupado) throw new Error("Ese correo ya está en uso.");
      cambios = { ...cambios, correo };
    }

    Object.assign(cuenta.usuario, cambios);

    // El nombre también se ve en el perfil público del tutor.
    const perfil = almacen.tutores.find((tutor) => tutor.id === id);
    if (perfil && cambios.nombre) perfil.nombre = cambios.nombre;

    return cuenta.usuario;
  }
}
