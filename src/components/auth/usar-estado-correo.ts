"use client";

import { useEffect, useState } from "react";
import { correoDisponible } from "@/features/auth/acciones";

export type EstadoCorreo = "vacio" | "invalido" | "revisando" | "libre" | "ocupado";

const FORMATO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ESPERA_MS = 450;

export const AYUDA_CORREO: Record<EstadoCorreo, string> = {
  vacio: "Con este correo entrarás a la plataforma.",
  invalido: "Ese correo no parece válido.",
  revisando: "Comprobando si está disponible…",
  libre: "Disponible.",
  ocupado: "Ya hay una cuenta con ese correo. Entra en vez de registrarte.",
};

/**
 * Comprobación en vivo del correo mientras se escribe (F1.12).
 *
 * Lo comparten los dos registros: descubrir que el correo ya existe al
 * enviar obliga a rehacer el formulario, y en el asistente del tutor son
 * tres pasos que se rehacen.
 *
 * Solo guarda en estado la respuesta del servidor, junto al correo que se
 * consultó. El resto —vacío, con formato inválido, esperando— se deriva al
 * renderizar: son consecuencias de lo que hay escrito, no hechos aparte que
 * puedan quedar desincronizados.
 */
export function useEstadoCorreo(correo: string): EstadoCorreo {
  const [comprobado, setComprobado] = useState<{ correo: string; libre: boolean } | null>(null);
  const valor = correo.trim();

  useEffect(() => {
    if (!FORMATO.test(valor)) return;

    // Un temporizador por pulsación sería una consulta por tecla; solo
    // sobrevive el de la última.
    let vigente = true;
    const temporizador = setTimeout(async () => {
      const libre = await correoDisponible(valor);
      if (vigente) setComprobado({ correo: valor, libre });
    }, ESPERA_MS);

    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [valor]);

  if (!valor) return "vacio";
  if (!FORMATO.test(valor)) return "invalido";
  if (comprobado?.correo !== valor) return "revisando";

  return comprobado.libre ? "libre" : "ocupado";
}
