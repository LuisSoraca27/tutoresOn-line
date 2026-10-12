"use client";

import { useRouter } from "next/navigation";
import { I18nProvider, RouterProvider } from "@heroui/react";
import { ProveedorSesion } from "@/features/sesion/contexto-sesion";
import type { Usuario } from "@/features/auth";

/**
 * Proveedores de toda la aplicación.
 *
 * `I18nProvider` traduce los textos que traen los propios componentes
 * (el botón de quitar una etiqueta, limpiar una búsqueda, los meses del
 * calendario que llegan en el Sprint 3). Sin él la interfaz queda mitad
 * español, mitad inglés.
 *
 * `RouterProvider` hace que los enlaces internos de HeroUI naveguen con el
 * router de Next en vez de recargar la página entera.
 *
 * `ProveedorSesion` recibe del layout raíz el usuario que ya validó la
 * cookie en el servidor. No decide nada: reparte.
 */
export function Proveedores({
  usuario,
  children,
}: {
  usuario: Usuario | null;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <I18nProvider locale="es-CO">
      <RouterProvider navigate={(href, opciones) => router.push(href, opciones)}>
        <ProveedorSesion usuario={usuario}>{children}</ProveedorSesion>
      </RouterProvider>
    </I18nProvider>
  );
}
