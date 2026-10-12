"use client";

import { createContext, useContext, useMemo } from "react";
import type { Rol } from "@/config/sitio";
import type { Usuario } from "@/features/auth";

/**
 * Sesión del lado del cliente.
 *
 * No decide nada: recibe del servidor el usuario que ya validó la cookie y
 * lo reparte a los componentes que necesitan pintar un nombre o un menú. La
 * autoridad sobre quién eres vive en `features/auth/sesion.ts`; esto es solo
 * el eco de esa decisión, para no tener que pasar el usuario por props a
 * través de media aplicación.
 *
 * Reemplaza a `sesion-demo.tsx` del Sprint 0 conservando la forma de
 * `useSesion()`, así que ningún componente que ya lo usaba tuvo que cambiar.
 */
export interface ValorSesion {
  usuario: Usuario | null;
  rol: Rol;
}

const ContextoSesion = createContext<ValorSesion | null>(null);

export function ProveedorSesion({
  usuario,
  children,
}: {
  usuario: Usuario | null;
  children: React.ReactNode;
}) {
  const valor = useMemo<ValorSesion>(
    () => ({ usuario, rol: usuario?.rol ?? "visitante" }),
    [usuario],
  );

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion);
  if (!valor) throw new Error("useSesion debe usarse dentro de <ProveedorSesion>.");
  return valor;
}
