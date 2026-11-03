"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Chip, Switch } from "@heroui/react";
import { solicitudesParaTutor, tomarSolicitud } from "@/features/express/acciones";
import type { SolicitudExpress } from "@/features/express";
import { useRealtimeExpress } from "@/features/express/usar-realtime";

type Solicitud = SolicitudExpress & { estudianteNombre: string };

/**
 * Tutor al instante, lado del tutor (F4.4, F4.5).
 *
 * El tutor recibe solicitudes mientras mantenga activa su conexión en esta pantalla.
 */
export function BandejaExpress({
  tutorId,
  disponiblePorDefecto,
  nombresMateria,
}: {
  tutorId: string;
  disponiblePorDefecto: boolean;
  nombresMateria: Record<string, string>;
}) {
  const router = useRouter();
  const [disponible, setDisponible] = useState(disponiblePorDefecto);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tomando, iniciar] = useTransition();
  const habilitado = useRef(disponiblePorDefecto);
  const secuencia = useRef(0);

  async function sincronizar() {
    const numero = ++secuencia.current;
    try { const nuevas = await solicitudesParaTutor(tutorId); if (habilitado.current && secuencia.current === numero) { setSolicitudes(nuevas); setError(null); } }
    catch { if (habilitado.current && secuencia.current === numero) setError("No pudimos consultar las solicitudes. Volveremos a intentarlo automáticamente."); }
  }
  const conectado = useRealtimeExpress(disponible, true, sincronizar);

  function tomar(solicitud: Solicitud) {
    setError(null);
    iniciar(async () => {
      const resultado = await tomarSolicitud(solicitud.id, tutorId);
      if (resultado.ok) {
        router.push("/tutor/agenda");
      } else {
        setError(resultado.mensaje);
        setSolicitudes((previas) => previas.filter((otra) => otra.id !== solicitud.id));
      }
    });
  }

  return (
    <Card>
      <Card.Header className="flex flex-row items-start gap-3">
        <div className="flex-1">
          <Card.Title className="text-base">Tutor al instante</Card.Title>
          <Card.Description>
            Con esto encendido recibes solicitudes para empezar en minutos.
          </Card.Description>
        </div>

        <Switch isSelected={disponible} onChange={(valor) => { habilitado.current = valor; secuencia.current++; setDisponible(valor); setSolicitudes([]); setError(null); }}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <span className="sr-only">Disponible ahora</span>
          </Switch.Content>
        </Switch>
      </Card.Header>

      <Card.Content>
        {!disponible ? (
          <p className="text-sm text-[var(--muted)]">
            Estás desconectado del modo instantáneo. Tus sesiones agendadas siguen igual.
          </p>
        ) : !conectado ? (
          <p className="text-sm text-[var(--muted)]">Reconectando para recibir solicitudes…</p>
        ) : solicitudes.length === 0 ? (
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-[var(--success)]" />
            <p className="text-sm text-[var(--muted)]">
              Conectado y esperando. Ninguna solicitud por ahora.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {solicitudes.map((solicitud) => (
              <li
                key={solicitud.id}
                className="rounded-lg border border-[var(--border)] p-3"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium">{solicitud.estudianteNombre}</span>
                  <Chip size="sm" color="warning" variant="soft">
                    Ahora
                  </Chip>
                  <span className="ml-auto text-sm text-[var(--muted)] tabular-nums">
                    {solicitud.duracionMinutos} min
                  </span>
                </div>

                <p className="pt-1 text-sm text-[var(--muted)]">
                  {nombresMateria[solicitud.materiaId] ?? solicitud.materiaId} ·{" "}
                  {solicitud.modalidad === "virtual" ? "Virtual" : "Presencial"}
                </p>

                {solicitud.nota ? (
                  <p className="pt-1.5 text-sm italic">{solicitud.nota}</p>
                ) : null}

                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  isDisabled={tomando}
                  onPress={() => tomar(solicitud)}
                >
                  {tomando ? "Tomando…" : "Tomar la clase"}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {error ? (
          <Alert status="warning" className="mt-3">
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Content>
    </Card>
  );
}
