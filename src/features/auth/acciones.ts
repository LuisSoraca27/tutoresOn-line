"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { INICIO_POR_ROL } from "@/config/sitio";
import { env } from "@/lib/env";
import { authRepo } from "./index";
import { borrarSesion, guardarSesion, usuarioActual } from "./sesion";
import type { RegistroTutor } from "./auth.types";

/**
 * Validación en el servidor (F1.12).
 *
 * Los mismos esquemas los usa el formulario para avisar mientras se escribe,
 * pero la comprobación que cuenta es esta: el navegador se puede saltar.
 */
const correo = z
  .string()
  .trim()
  .toLowerCase()
  .email("Ese correo no parece válido.");

const clave = z
  .string()
  .min(8, "La contraseña necesita al menos 8 caracteres.")
  .regex(/[a-zA-Z]/, "Incluye al menos una letra.")
  .regex(/[0-9]/, "Incluye al menos un número.");

const nombre = z.string().trim().min(3, "Escribe tu nombre completo.");

// Sin `export`: un archivo "use server" solo puede exportar funciones
// asíncronas, y un esquema de Zod es un objeto.
const esquemaEstudiante = z.object({
  nombre,
  correo,
  clave,
  telefono: z.string().trim().optional(),
  ciudadId: z.string().optional(),
  nivelId: z.enum(
    ["primaria", "bachillerato", "tecnico", "universitario", "posgrado"],
    {
      message: "Elige tu nivel educativo.",
    },
  ),
});

export type ResultadoAuth =
  { ok: true; destino: string } | { ok: false; mensaje: string };

/** Inicio de sesión (F1.5). */
export async function iniciarSesion(
  datos: { correo: string; clave: string },
  siguiente?: string,
): Promise<ResultadoAuth> {
  const validado = z
    .object({ correo, clave: z.string().min(1) })
    .safeParse(datos);

  if (!validado.success) {
    return { ok: false, mensaje: "Revisa el correo y la contraseña." };
  }

  const usuario = await authRepo.iniciarSesion(validado.data);

  // Un solo mensaje para correo inexistente y clave errada: decir cuál de
  // los dos falló le regala al atacante la mitad del trabajo.
  if (!usuario) {
    return { ok: false, mensaje: "Correo o contraseña incorrectos." };
  }

  await guardarSesion({ id: usuario.id, rol: usuario.rol });

  return { ok: true, destino: siguiente || INICIO_POR_ROL[usuario.rol] };
}

/** Registro de estudiante (F1.2). */
export async function registrarEstudiante(
  datos: unknown,
): Promise<ResultadoAuth> {
  const validado = esquemaEstudiante.safeParse(datos);

  if (!validado.success) {
    return {
      ok: false,
      mensaje: validado.error.issues[0]?.message ?? "Revisa los datos.",
    };
  }

  try {
    const usuario = await authRepo.registrarEstudiante(validado.data);
    await guardarSesion({ id: usuario.id, rol: usuario.rol });

    return { ok: true, destino: INICIO_POR_ROL.estudiante };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error ? error.message : "No pudimos crear la cuenta.",
    };
  }
}

/** Registro de tutor (F1.3). */
export async function registrarTutor(
  datos: RegistroTutor,
): Promise<ResultadoAuth> {
  const base = z.object({ nombre, correo, clave }).safeParse(datos);
  if (!base.success) {
    return {
      ok: false,
      mensaje: base.error.issues[0]?.message ?? "Revisa los datos.",
    };
  }

  if (datos.titulo.trim().length < 5) {
    return { ok: false, mensaje: "Escribe tu título o profesión." };
  }

  if (datos.bio.trim().length < 40) {
    return {
      ok: false,
      mensaje:
        "La presentación necesita al menos 40 caracteres: es lo primero que lee un estudiante.",
    };
  }

  if (datos.materias.length === 0) {
    return { ok: false, mensaje: "Agrega al menos una materia con su tarifa." };
  }

  if (datos.materias.some((materia) => materia.nivelIds.length === 0)) {
    return {
      ok: false,
      mensaje: "Cada materia necesita al menos un nivel educativo.",
    };
  }

  if (datos.modalidad !== "virtual" && !datos.ciudadId) {
    return {
      ok: false,
      mensaje: "Elige la ciudad donde atiendes presencialmente.",
    };
  }

  try {
    const usuario = await authRepo.registrarTutor({ ...datos, ...base.data });
    await guardarSesion({ id: usuario.id, rol: usuario.rol });

    revalidatePath("/buscar");

    return { ok: true, destino: INICIO_POR_ROL.tutor };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error ? error.message : "No pudimos crear la cuenta.",
    };
  }
}

/** Editar el perfil propio (F1.9). */
export async function actualizarPerfil(datos: {
  nombre: string;
  correo: string;
  telefono?: string;
}): Promise<ResultadoAuth> {
  const usuario = await usuarioActual();
  if (!usuario)
    return { ok: false, mensaje: "Tu sesión expiró. Vuelve a entrar." };

  const validado = z.object({ nombre, correo }).safeParse(datos);
  if (!validado.success) {
    return {
      ok: false,
      mensaje: validado.error.issues[0]?.message ?? "Revisa los datos.",
    };
  }

  try {
    await authRepo.actualizarPerfil(usuario.id, {
      ...validado.data,
      telefono: datos.telefono?.trim() || undefined,
    });

    revalidatePath("/estudiante/perfil");
    revalidatePath("/tutor/perfil");

    return { ok: true, destino: "" };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No pudimos guardar los cambios.",
    };
  }
}

/** Cerrar sesión (F1.11). */
export async function cerrarSesion(): Promise<never> {
  await borrarSesion();
  redirect("/");
}

/** Comprobación en vivo mientras se escribe el correo (F1.12). */
export async function correoDisponible(valor: string): Promise<boolean> {
  const validado = correo.safeParse(valor);
  if (!validado.success) return true;

  return authRepo.correoDisponible(validado.data);
}

export async function solicitarRecuperacion(
  valor: string,
): Promise<{ ok: boolean; mensaje: string; tokenDemo?: string }> {
  const validado = correo.safeParse(valor);
  if (!validado.success)
    return { ok: false, mensaje: "Escribe un correo electrónico válido." };
  try {
    const resultado = await authRepo.solicitarRecuperacion(validado.data);
    return {
      ok: true,
      mensaje:
        "Si hay una cuenta con ese correo, recibirás un enlace para cambiar la contraseña.",
      tokenDemo: env.usarDatosSimulados ? resultado.tokenDemo : undefined,
    };
  } catch {
    return {
      ok: false,
      mensaje: "No pudimos solicitar el enlace. Inténtalo de nuevo.",
    };
  }
}

export async function restablecerClave(
  token: string,
  nueva: string,
): Promise<{ ok: boolean; mensaje: string }> {
  const validado = clave.safeParse(nueva);
  if (!validado.success)
    return {
      ok: false,
      mensaje: validado.error.issues[0]?.message ?? "Revisa la contraseña.",
    };
  if (!token || token.length > 512)
    return { ok: false, mensaje: "Solicita un enlace de recuperación válido." };
  try {
    await authRepo.restablecerClave(token, validado.data);
    await borrarSesion();
    return {
      ok: true,
      mensaje:
        "Contraseña actualizada. Ya puedes entrar con tu nueva contraseña.",
    };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No pudimos cambiar la contraseña.",
    };
  }
}
