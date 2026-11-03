"use server";

import { revalidatePath } from "next/cache";
import { tokenSesion, usuarioActual } from "@/features/auth/sesion";
import { ErrorHttp, pedir } from "@/lib/http";
import type { MateriaDictada } from "./tutor.types";

export type ResultadoPerfil = { ok: true } | { ok: false; mensaje: string };

function refrescar(id: string) {
  revalidatePath(`/tutores/${id}`);
  revalidatePath("/tutor/materias");
  revalidatePath("/tutor/cobertura");
  revalidatePath("/tutor/perfil");
  revalidatePath("/buscar");
}

/**
 * Materias, niveles y tarifas (F5.7).
 *
 * Es lo que determina en qué búsquedas aparece el tutor y cuánto cobra cada
 * sesión, así que se valida entero antes de guardar: una tarifa en cero o una
 * materia sin nivel lo dejarían invisible o regalando clases.
 */
export async function guardarMaterias(
  tutorId: string,
  materias: MateriaDictada[],
): Promise<ResultadoPerfil> {
  if (!(await esPropietario(tutorId)))
    return { ok: false, mensaje: "No puedes editar este perfil." };
  if (materias.length === 0) {
    return {
      ok: false,
      mensaje: "Necesitas al menos una materia para aparecer en la búsqueda.",
    };
  }

  const repetida = materias.find(
    (materia, indice) =>
      materias.findIndex((otra) => otra.materiaId === materia.materiaId) !==
      indice,
  );
  if (repetida) {
    return {
      ok: false,
      mensaje: "Hay una materia repetida. Únelas en una sola línea.",
    };
  }

  if (materias.some((materia) => materia.nivelIds.length === 0)) {
    return {
      ok: false,
      mensaje: "Cada materia necesita al menos un nivel educativo.",
    };
  }

  const barata = materias.find((materia) => materia.precioHora < 10000);
  if (barata) {
    return { ok: false, mensaje: "La tarifa mínima por hora es de $ 10.000." };
  }

  try {
    const token = await tokenSesion();
    if (!token) return { ok: false, mensaje: "Tu sesión expiró. Vuelve a iniciar sesión." };
    await pedir(`/tutores/${encodeURIComponent(tutorId)}/materias`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: { materias }, cache: "no-store" });
    refrescar(tutorId);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos guardar las materias." };
  }
}

/** Cobertura para tutorías presenciales (F5.8). */
export async function guardarCobertura(
  tutorId: string,
  datos: {
    modalidad: "virtual" | "presencial" | "ambas";
    ciudadId: string | null;
    radioKm: number | null;
  },
): Promise<ResultadoPerfil> {
  if (!(await esPropietario(tutorId)))
    return { ok: false, mensaje: "No puedes editar este perfil." };
  if (datos.modalidad !== "virtual" && !datos.ciudadId) {
    return { ok: false, mensaje: "Elige la ciudad donde atiendes en persona." };
  }

  const cambios = {
    modalidad: datos.modalidad,
    // La cobertura presencial deja de mostrarse al pasar a solo virtual.
    ciudadId: datos.modalidad === "virtual" ? null : datos.ciudadId,
    radioKm: datos.modalidad === "virtual" ? null : datos.radioKm,
  };

  try {
    const token = await tokenSesion();
    if (!token) return { ok: false, mensaje: "Tu sesión expiró. Vuelve a iniciar sesión." };
    await pedir(`/tutores/${encodeURIComponent(tutorId)}/cobertura`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: cambios, cache: "no-store" });
    refrescar(tutorId);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos guardar la cobertura." };
  }
}

/** Presentación pública (F5.12). */
export async function guardarPresentacion(
  tutorId: string,
  datos: { titulo: string; bio: string; idiomas: string[] },
): Promise<ResultadoPerfil> {
  if (!(await esPropietario(tutorId)))
    return { ok: false, mensaje: "No puedes editar este perfil." };
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

  if (datos.idiomas.length === 0) {
    return {
      ok: false,
      mensaje: "Indica al menos un idioma en el que dictas.",
    };
  }

  try {
    const token = await tokenSesion();
    if (!token) return { ok: false, mensaje: "Tu sesión expiró. Vuelve a iniciar sesión." };
    await pedir(`/tutores/${encodeURIComponent(tutorId)}/presentacion`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: { titulo: datos.titulo.trim(), bio: datos.bio.trim(), idiomas: datos.idiomas }, cache: "no-store" });
    refrescar(tutorId);
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return { ok: false, mensaje: error instanceof Error ? error.message : "No pudimos guardar tu presentación." };
  }
}

async function esPropietario(tutorId: string) {
  const usuario = await usuarioActual();
  return usuario?.rol === "tutor" && usuario.id === tutorId;
}

/** Guarda la imagen en el perfil del tutor autenticado. */
export async function guardarFoto(datos: FormData): Promise<ResultadoPerfil> {
  const usuario = await usuarioActual();
  if (!usuario || usuario.rol !== "tutor")
    return {
      ok: false,
      mensaje: "Inicia sesión como tutor para editar la foto.",
    };
  try {
    const token = await tokenSesion();
    if (!token) return { ok: false, mensaje: "Tu sesión expiró. Vuelve a iniciar sesión." };
    let avatarUrl: string | null;
    if (datos.get("quitar") === "si") {
      avatarUrl = null;
    } else {
      const foto = datos.get("foto");
      if (!(foto instanceof File) || foto.size === 0 || foto.size > 512000)
        return { ok: false, mensaje: "Elige una imagen de hasta 500 KB." };
      const bytes = Buffer.from(await foto.arrayBuffer());
      const png = bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const webp =
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP";
      const tipo = png
        ? "image/png"
        : jpeg
          ? "image/jpeg"
          : webp
            ? "image/webp"
            : null;
      if (!tipo)
        return {
          ok: false,
          mensaje: "La foto debe ser una imagen PNG, JPG o WebP válida.",
        };
      avatarUrl = `data:${tipo};base64,${bytes.toString("base64")}`;
    }
    await pedir(`/tutores/${encodeURIComponent(usuario.id)}/foto`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: { avatarUrl }, cache: "no-store" });
    refrescar(usuario.id);
    revalidatePath("/");
    revalidatePath("/estudiante");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      mensaje: error instanceof ErrorHttp ? error.message : "No pudimos guardar la foto. Inténtalo de nuevo.",
    };
  }
}
