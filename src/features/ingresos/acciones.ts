"use server";
import { revalidatePath } from "next/cache";
import { usuarioActual } from "@/features/auth/sesion";
import { ingresosRepo } from "./index";

export async function solicitarRetiro(monto: number, destino: string) {
  const usuario = await usuarioActual();
  if (!usuario || usuario.rol !== "tutor")
    return {
      ok: false,
      mensaje: "Inicia sesión como tutor para solicitar un retiro.",
    };
  if (
    !Number.isSafeInteger(monto) ||
    monto <= 0 ||
    destino.trim().length < 5 ||
    destino.length > 120
  )
    return {
      ok: false,
      mensaje:
        "Escribe un monto entero mayor a cero y un destino de 5 a 120 caracteres.",
    };
  try {
    await ingresosRepo.solicitar(usuario.id, monto, destino.trim());
    revalidatePath("/tutor/ingresos");
    return {
      ok: true,
      mensaje:
        "Retiro solicitado. Puedes consultar su estado o cancelarlo aquí.",
    };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No pudimos solicitar el retiro. Inténtalo de nuevo.",
    };
  }
}

export async function cancelarRetiro(retiroId: string) {
  const usuario = await usuarioActual();
  if (!usuario || usuario.rol !== "tutor")
    return { ok: false, mensaje: "Tu sesión expiró. Vuelve a entrar." };
  try {
    await ingresosRepo.cancelar(usuario.id, retiroId);
    revalidatePath("/tutor/ingresos");
    return {
      ok: true,
      mensaje: "Retiro cancelado. El saldo vuelve a estar disponible.",
    };
  } catch (error) {
    return {
      ok: false,
      mensaje:
        error instanceof Error
          ? error.message
          : "No pudimos cancelar el retiro.",
    };
  }
}
