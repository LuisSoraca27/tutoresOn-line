"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { INICIO_POR_ROL } from "@/config/sitio";
import { pedir, ErrorHttp } from "@/lib/http";
import { borrarSesion, guardarSesion, tokenSesion, usuarioActual } from "./sesion";
import type { RegistroTutor, Usuario } from "./auth.types";

type RespuestaSesion = { usuario: Usuario; token: string };

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

  try {
    const resultado = await pedir<RespuestaSesion>("/auth/login", { method: "POST", body: validado.data, cache: "no-store" });
    await guardarSesion(resultado.token);
    const destinoSeguro = siguiente?.startsWith("/") && !siguiente.startsWith("//") && !siguiente.includes("\\") ? siguiente : undefined;
    return { ok: true, destino: destinoSeguro || INICIO_POR_ROL[resultado.usuario.rol] };
  } catch (error) {
    if (error instanceof ErrorHttp && error.estado === 401) return { ok: false, mensaje: "Correo o contraseña incorrectos." };
    return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos iniciar sesión." };
  }
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
    const resultado = await pedir<RespuestaSesion>("/auth/registro/estudiante", { method: "POST", body: validado.data });
    await guardarSesion(resultado.token);

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
    const resultado = await pedir<RespuestaSesion>("/auth/registro/tutor", { method: "POST", body: { ...datos, ...base.data } });
    await guardarSesion(resultado.token);

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
    const token = await tokenSesion();
    await pedir<Usuario>("/auth/me", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: { ...validado.data, telefono: datos.telefono?.trim() || undefined } });

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

  try { return await pedir<boolean>("/auth/correo-disponible", { query: { correo: validado.data } }); } catch { return true; }
}

export async function solicitarRecuperacion(_valor: string): Promise<{ ok: boolean; mensaje: string; tokenDemo?: string }> {
  return { ok: false, mensaje: "La recuperación de contraseña todavía no está disponible." };
}

export async function restablecerClave(_token: string, _nueva: string): Promise<{ ok: boolean; mensaje: string }> {
  return { ok: false, mensaje: "La recuperación de contraseña todavía no está disponible." };
}
