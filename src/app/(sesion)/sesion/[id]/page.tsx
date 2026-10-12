import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Alert, Avatar, Button, Card, Chip, Separator } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { CuentaRegresiva } from "@/components/sesion/cuenta-regresiva";
import { IconoMapa, IconoVideo } from "@/components/ui/iconos";
import { catalogosRepo } from "@/features/catalogos";
import { reservasRepo } from "@/features/reservas";
import { aVista } from "@/features/reservas/vista";
import { exigirUsuario } from "@/features/auth/sesion";
import { apuntesRepo } from "@/features/sesion/apuntes";
import { ApuntesSesion } from "@/components/sesion/apuntes-sesion";
import { BandejaMensajes } from "@/components/mensajes/bandeja-mensajes";
import { enlaceSala } from "@/features/sesion/sala";
import { tutoresRepo } from "@/features/tutores";
import { fechaLarga } from "@/lib/formato";
import { iniciales } from "@/lib/texto";

export const metadata: Metadata = { title: "Sala de la sesión" };

/** Depende del reloj: nunca se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function SalaSesion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const usuario = await exigirUsuario();

  const { id } = await params;
  const reserva = await reservasRepo.obtener(id);

  // A la sala entran los dos participantes y nadie más.
  const participa =
    reserva &&
    (usuario.rol === "estudiante"
      ? reserva.estudianteId === usuario.id
      : reserva.tutorId === usuario.id);

  if (!reserva || !participa) notFound();

  if (
    reserva.estado !== "aceptada" &&
    reserva.estado !== "en-curso" &&
    reserva.estado !== "finalizada"
  ) {
    return <SinAcceso estado={reserva.estado} />;
  }

  const [tutor, materias, niveles, ciudades] = await Promise.all([
    tutoresRepo.obtener(reserva.tutorId),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
  ]);

  const [vista] = aVista([reserva], {
    tutores: tutor ? [tutor] : [],
    materias,
    niveles,
    ciudades,
  });

  const esTutor = usuario.rol === "tutor";
  const enlace = enlaceSala(reserva);
  const apuntes = await apuntesRepo.obtener(reserva.id, usuario.id);
  const ahoraServidor = new Date().getTime();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <EncabezadoPagina
        titulo="Sala de la sesión"
        descripcion="Comprueba cámara y micrófono antes de entrar. La sala se abre diez minutos antes."
      />

      <Card>
        <Card.Header className="flex flex-row items-start gap-3">
          <Avatar size="md" className="shrink-0">
            <Avatar.Fallback>
              {iniciales(esTutor ? vista.estudianteNombre : vista.tutorNombre)}
            </Avatar.Fallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <Card.Title className="text-base">
              {esTutor ? vista.estudianteNombre : vista.tutorNombre}
            </Card.Title>
            <Card.Description>
              {vista.materiaNombre} · {vista.nivelNombre}
            </Card.Description>
          </div>

          <ChipEstado estado={vista.estado} />
        </Card.Header>

        <Card.Content className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="first-letter:uppercase">
              {fechaLarga(`${vista.fecha}T00:00`)}
            </span>
            <span className="text-[var(--muted)] tabular-nums">
              {vista.horaInicio} a {vista.horaFin} ({vista.duracionMinutos} min)
            </span>
            <Chip size="sm" variant="soft">
              {vista.modalidad === "virtual" ? (
                <>
                  <IconoVideo className="size-3.5" /> Virtual
                </>
              ) : (
                <>
                  <IconoMapa className="size-3.5" /> Presencial
                </>
              )}
            </Chip>
          </div>

          <Separator />

          {vista.modalidad === "presencial" ? (
            <Alert status="default">
              <Alert.Content>
                <Alert.Title>Sesión presencial</Alert.Title>
                <Alert.Description>
                  Punto de encuentro: {vista.lugar ?? "por acordar"}
                  {vista.ciudadNombre ? `, ${vista.ciudadNombre}` : ""}. Igual
                  pueden usar la sala virtual si alguno no alcanza a llegar.
                </Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          <CuentaRegresiva
            reserva={reserva}
            enlace={enlace}
            ahoraServidor={ahoraServidor}
          />

          <p className="rounded-lg bg-[var(--surface-2)] p-3 font-mono text-xs break-all">
            {enlace}
          </p>

          {vista.notaEstudiante ? (
            <div>
              <p className="pb-1 text-sm text-[var(--muted)]">
                {esTutor ? "Nota del estudiante" : "Tu nota para el tutor"}
              </p>
              <blockquote className="border-l-2 border-[var(--border)] pl-3 text-sm italic">
                {vista.notaEstudiante}
              </blockquote>
            </div>
          ) : null}
        </Card.Content>

        <Card.Footer className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
          {esTutor && vista.estado !== "finalizada" ? (
            <Button variant="outline" size="sm">
              <Link href={`/sesion/${vista.id}/cierre`}>Cerrar la sesión</Link>
            </Button>
          ) : null}

          <Button variant="ghost" size="sm">
            <Link
              href={
                esTutor ? "/tutor/agenda" : `/estudiante/reservas/${vista.id}`
              }
            >
              Volver
            </Link>
          </Button>
        </Card.Footer>
      </Card>

      <div className="grid gap-4 pt-6 lg:grid-cols-2">
        <section aria-label="Chat de la sesión" className="min-w-0">
          <BandejaMensajes
            compacto
            usuarioId={usuario.id}
            contactos={[
              {
                tutorId: reserva.tutorId,
                estudianteId: reserva.estudianteId,
                nombre: esTutor ? vista.estudianteNombre : vista.tutorNombre,
                titulo: "Chat · se actualiza cada cinco segundos",
                motivo: vista.materiaNombre,
              },
            ]}
          />
        </section>
        <ApuntesSesion reservaId={reserva.id} inicial={apuntes} />
      </div>

      <p className="pt-5 text-xs text-[var(--muted)]">
        La videollamada se abre en Jitsi Meet. Puedes mantener esta página
        abierta para conversar y guardar tus apuntes.
      </p>
    </div>
  );
}

function SinAcceso({ estado }: { estado: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <EncabezadoPagina
        titulo="Sala de la sesión"
        descripcion="Esta sesión todavía no tiene sala."
      />

      <Alert status="warning">
        <Alert.Content>
          <Alert.Title>La sala no está disponible</Alert.Title>
          <Alert.Description>
            {estado === "pendiente"
              ? "El tutor todavía no ha aceptado la solicitud. En cuanto responda, la sala se abre sola."
              : "Esta reserva no sigue activa, así que no hay sala a la que entrar."}
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Button variant="ghost" size="sm" className="mt-5">
        <Link href="/estudiante/reservas">Volver a mis reservas</Link>
      </Button>
    </div>
  );
}
