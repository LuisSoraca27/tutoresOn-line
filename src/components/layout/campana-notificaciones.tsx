"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button, Popover, Separator } from "@heroui/react";
import { IconoCampana } from "@/components/ui/iconos";
import {
  consultarNotificaciones,
  marcarLeidas,
} from "@/features/notificaciones/acciones";
import type { Notificacion } from "@/features/notificaciones";
import { useSesion } from "@/features/sesion/contexto-sesion";

/**
 * Centro de avisos (F9.1, F9.2).
 *
 * Los avisos los genera el servidor cuando cambia algo —una reserva aceptada,
 * una reseña nueva—. La campana los consulta al abrirse y cada diez segundos.
 */
export function CampanaNotificaciones() {
  const { usuario } = useSesion();

  const destinatario = usuario ? usuario.id : null;

  const [bandeja, setBandeja] = useState<{
    id: string;
    avisos: Notificacion[];
  } | null>(null);
  const avisos = bandeja?.id === destinatario ? bandeja.avisos : [];
  const [abierto, setAbierto] = useState(false);
  const [, iniciar] = useTransition();

  const sinLeer = avisos.filter((aviso) => !aviso.leida).length;

  useEffect(() => {
    if (!destinatario) return;
    let activo = true;
    let consultando = false;
    async function cargar() {
      if (consultando) return;
      consultando = true;
      try {
        const nuevas = await consultarNotificaciones(destinatario!);
        if (activo) setBandeja({ id: destinatario!, avisos: nuevas });
      } catch {
        /* Conserva los avisos visibles y reintenta en la siguiente consulta. */
      } finally {
        consultando = false;
      }
    }
    iniciar(cargar);
    const reloj = setInterval(cargar, 10000);
    return () => {
      activo = false;
      clearInterval(reloj);
    };
  }, [destinatario, abierto]);

  if (!destinatario) return null;

  function alAbrir(nuevo: boolean) {
    setAbierto(nuevo);

    // Se marcan al cerrar, no al abrir: si se marcaran al abrir, el contador
    // desaparecería antes de que a la persona le diera tiempo de leerlos.
    if (!nuevo && sinLeer > 0 && destinatario) {
      iniciar(async () => {
        await marcarLeidas(destinatario);
        setBandeja((previa) =>
          previa
            ? {
                ...previa,
                avisos: previa.avisos.map((aviso) => ({
                  ...aviso,
                  leida: true,
                })),
              }
            : previa,
        );
      });
    }
  }

  return (
    <Popover isOpen={abierto} onOpenChange={alAbrir}>
      <Badge.Anchor>
        <Popover.Trigger
          aria-label={
            sinLeer > 0
              ? `Notificaciones: ${sinLeer} sin leer`
              : "Notificaciones"
          }
          className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] outline-none hover:bg-[var(--default-soft)] focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          <IconoCampana />
        </Popover.Trigger>

        {sinLeer > 0 ? (
          <Badge size="sm" color="accent" aria-hidden>
            {sinLeer}
          </Badge>
        ) : null}
      </Badge.Anchor>

      <Popover.Content placement="bottom end">
        <Popover.Dialog className="w-80 max-w-[calc(100vw-2rem)] p-0">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <h2 className="font-medium">Notificaciones</h2>
            {sinLeer > 0 ? (
              <span className="text-xs text-[var(--muted)] tabular-nums">
                {sinLeer} sin leer
              </span>
            ) : null}
          </div>

          <Separator />

          {avisos.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              No tienes avisos todavía.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {avisos.slice(0, 6).map((aviso) => (
                <li
                  key={aviso.id}
                  className="border-b border-[var(--border)] last:border-0"
                >
                  <Link
                    href={aviso.enlace}
                    onClick={() => setAbierto(false)}
                    className="block px-4 py-3 hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none"
                  >
                    <span className="flex items-start gap-2">
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${
                          aviso.leida ? "bg-transparent" : "bg-[var(--accent)]"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">
                          {aviso.titulo}
                        </span>
                        <span className="block text-sm text-[var(--muted)]">
                          {aviso.detalle}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Separator />

          <div className="px-4 py-3">
            <Button variant="ghost" size="sm" onPress={() => setAbierto(false)}>
              <Link href="/notificaciones">Ver todas</Link>
            </Button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
