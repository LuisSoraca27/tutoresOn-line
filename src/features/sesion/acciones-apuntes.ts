"use server";
import { usuarioActual } from "@/features/auth/sesion";
import { reservasRepo } from "@/features/reservas";
import { apuntesRepo } from "./apuntes";

export async function guardarApuntes(reservaId: string, texto: string) {
  const usuario = await usuarioActual();
  const reserva = await reservasRepo.obtener(reservaId);
  if (
    !usuario ||
    !reserva ||
    (usuario.rol === "tutor"
      ? usuario.id !== reserva.tutorId
      : usuario.id !== reserva.estudianteId)
  )
    return {
      ok: false,
      mensaje: "No tienes acceso a los apuntes de esta sesión.",
    };
  if (texto.length > 10000)
    return {
      ok: false,
      mensaje: "Los apuntes admiten hasta 10.000 caracteres.",
    };
  try {
    await apuntesRepo.guardar(reservaId, usuario.id, texto);
    return { ok: true, mensaje: "Apuntes guardados." };
  } catch {
    return {
      ok: false,
      mensaje: "No pudimos guardar tus apuntes. Inténtalo de nuevo.",
    };
  }
}
