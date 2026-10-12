import Link from "next/link";
import type { Metadata } from "next";
import { Button, Chip, EmptyState, Separator } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { IconoCampana } from "@/components/ui/iconos";
import { notificacionesRepo } from "@/features/notificaciones";
import { exigirUsuario } from "@/features/auth/sesion";
import { marcarMisNotificacionesLeidas } from "@/features/notificaciones/acciones";
import { CANALES } from "@/features/preferencias";
import { fechaLarga } from "@/lib/formato";

export const metadata: Metadata = { title: "Notificaciones" };

/** Datos de una persona concreta: no se prerenderizan en el build. */
export const dynamic = "force-dynamic";

export default async function PaginaNotificaciones() {
  const usuario = await exigirUsuario();
  const avisos = (await notificacionesRepo.de(usuario.id)).sort((a, b) =>
    b.creadaEn.localeCompare(a.creadaEn),
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      <EncabezadoPagina
        titulo="Notificaciones"
        descripcion="Todo lo que ha pasado con tus sesiones, lo más reciente primero."
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={
            usuario.rol === "tutor" ? "/tutor/perfil" : "/estudiante/perfil"
          }
          className="rounded text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
        >
          Configurar correo, SMS y WhatsApp
        </Link>
        {avisos.some((aviso) => !aviso.leida) ? (
          <form action={marcarMisNotificacionesLeidas}>
            <Button type="submit" variant="outline" size="sm">
              Marcar todas como leídas
            </Button>
          </form>
        ) : null}
      </div>

      {avisos.length === 0 ? (
        <EmptyState className="py-16 text-center">
          <IconoCampana className="mx-auto size-8 text-[var(--muted)]" />
          <h2 className="titulo pt-3 text-lg">Nada por aquí todavía</h2>
          <p className="mx-auto max-w-[44ch] pt-1.5 text-sm text-[var(--muted)]">
            Los avisos aparecen cuando reservas una sesión, cuando el tutor
            responde o cuando alguien te califica.
          </p>
        </EmptyState>
      ) : (
        <ul className="flex flex-col rounded-xl border border-[var(--border)]">
          {avisos.map((aviso, indice) => (
            <li key={aviso.id}>
              {indice > 0 ? <Separator /> : null}
              <Link
                href={aviso.enlace}
                className="block p-4 hover:bg-[var(--surface-2)] focus-visible:ring-2 focus-visible:ring-[var(--focus)] focus-visible:outline-none"
              >
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium">{aviso.titulo}</span>
                  {!aviso.leida ? (
                    <Chip size="sm" color="accent" variant="soft">
                      Nuevo
                    </Chip>
                  ) : null}
                  <span className="ml-auto text-sm text-[var(--muted)] first-letter:uppercase">
                    {fechaLarga(aviso.creadaEn)}
                  </span>
                </span>
                <span className="block pt-1 text-sm text-[var(--muted)]">
                  {aviso.detalle}
                </span>
                {aviso.entregas?.length ? (
                  <span
                    className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--muted)]"
                    aria-label="Historial de entrega"
                  >
                    {aviso.entregas.map((entrega) => (
                      <span key={entrega.canal} title={entrega.detalle}>
                        {
                          CANALES.find((canal) => canal.id === entrega.canal)
                            ?.etiqueta
                        }{" "}
                        · {entrega.estado}
                      </span>
                    ))}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="pt-6 text-sm text-[var(--muted)]">
        Cada aviso muestra los canales externos definidos en tus preferencias y
        su estado de entrega. El estado «simulado» corresponde a la demostración
        y no envía mensajes fuera de esta aplicación.
      </p>
    </div>
  );
}
