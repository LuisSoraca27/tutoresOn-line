"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Alert,
  Button,
  Calendar,
  EmptyState,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import {
  getLocalTimeZone,
  today,
  type CalendarDate,
} from "@internationalized/date";
import { turnosParaReprogramar } from "@/features/reservas/acciones";
import { consultarTurnos } from "@/features/disponibilidad/acciones";
import type { DiaConTurnos, Turno } from "@/features/disponibilidad";
import { aIsoFecha } from "@/features/disponibilidad/calcular-turnos";
import { fechaLarga } from "@/lib/formato";

/** Cuántos días hacia adelante se ofrecen. Dos meses cubren cualquier semestre. */
const HORIZONTE_DIAS = 60;

/**
 * Paso 2 de la reserva (F3.2): calendario de disponibilidad y turnos.
 *
 * Los días sin ningún turno libre quedan deshabilitados en el calendario, en
 * vez de dejar que el estudiante los toque para descubrir que no hay nada.
 */
export function SelectorTurno({
  tutorId,
  duracionMinutos,
  turnoElegido,
  onElegir,
  reservaId,
}: {
  tutorId: string;
  duracionMinutos: number;
  turnoElegido: Turno | null;
  onElegir: (turno: Turno | null) => void;
  reservaId?: string;
}) {
  const [dias, setDias] = useState<DiaConTurnos[]>([]);
  const [fecha, setFecha] = useState<CalendarDate | null>(null);
  const [cargando, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  // Cada duración produce turnos distintos, así que se recarga todo el
  // horizonte cuando cambia.
  useEffect(() => {
    let vigente = true;
    iniciar(async () => {
      try {
        const resultado = reservaId
          ? await turnosParaReprogramar(
              reservaId,
              aIsoFecha(new Date()),
              HORIZONTE_DIAS,
            )
          : await consultarTurnos({
              tutorId,
              desde: aIsoFecha(new Date()),
              dias: HORIZONTE_DIAS,
              duracionMinutos,
            });
        if (!vigente) return;
        setError(null);
        setDias(resultado);
        setFecha(null);
        onElegir(null);
      } catch (fallo) {
        if (vigente)
          setError(
            fallo instanceof Error
              ? fallo.message
              : "No pudimos cargar los horarios.",
          );
      }
    });
    return () => {
      vigente = false;
    };
    // `onElegir` cambia en cada render del padre; solo interesan estos dos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId, duracionMinutos, reservaId, intento]);

  const porFecha = useMemo(
    () => new Map(dias.map((dia) => [dia.fecha, dia.turnos])),
    [dias],
  );

  const conTurnos = useMemo(
    () =>
      new Set(
        dias.filter((dia) => dia.turnos.length > 0).map((dia) => dia.fecha),
      ),
    [dias],
  );

  const turnosDelDia = fecha ? (porFecha.get(fecha.toString()) ?? []) : [];

  if (error)
    return (
      <Alert status="danger">
        <Alert.Content>
          <Alert.Description>{error}</Alert.Description>
          <Button
            size="sm"
            variant="outline"
            onPress={() => setIntento((valor) => valor + 1)}
          >
            Reintentar
          </Button>
        </Alert.Content>
      </Alert>
    );

  if (cargando && dias.length === 0) {
    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <Skeleton className="h-80 w-full rounded-xl lg:w-80" />
        <Skeleton className="h-80 flex-1 rounded-xl" />
      </div>
    );
  }

  if (conTurnos.size === 0) {
    return (
      <EmptyState className="py-12 text-center">
        <h3 className="titulo text-lg">Sin horarios disponibles</h3>
        <p className="mx-auto max-w-[48ch] pt-1.5 text-sm text-[var(--muted)]">
          Este tutor no tiene turnos libres en los próximos {HORIZONTE_DIAS}{" "}
          días para sesiones de {duracionMinutos} minutos. Prueba con otra
          duración o escríbele para acordar un horario.
        </p>
      </EmptyState>
    );
  }

  return (
    <div
      className={`flex flex-col gap-6 lg:flex-row ${cargando ? "opacity-60" : ""}`}
    >
      <Calendar
        value={fecha}
        onChange={(valor) => {
          setFecha(valor as CalendarDate | null);
          onElegir(null);
        }}
        minValue={today(getLocalTimeZone())}
        isDateUnavailable={(dia) => !conTurnos.has(dia.toString())}
        aria-label="Elegir el día de la sesión"
        className="shrink-0"
      >
        <Calendar.Header>
          <Calendar.NavButton slot="previous" />
          <Calendar.Heading />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(dia) => <Calendar.HeaderCell>{dia}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>
            {(dia) => <Calendar.Cell date={dia} />}
          </Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>

      <div className="min-w-0 flex-1">
        {!fecha ? (
          <p className="text-sm text-[var(--muted)]">
            Elige un día en el calendario. Los días atenuados no tienen turnos
            libres.
          </p>
        ) : (
          <>
            <h3 className="text-sm font-medium first-letter:uppercase">
              {fechaLarga(`${fecha.toString()}T00:00`)}
            </h3>
            <p className="pt-1 pb-3 text-sm text-[var(--muted)]">
              {turnosDelDia.length}{" "}
              {turnosDelDia.length === 1 ? "turno libre" : "turnos libres"} de{" "}
              {duracionMinutos} minutos
            </p>

            <ToggleButtonGroup
              selectionMode="single"
              isDetached
              selectedKeys={turnoElegido ? [turnoElegido.inicio] : []}
              onSelectionChange={(claves) => {
                const clave = [...claves][0];
                onElegir(
                  turnosDelDia.find((turno) => turno.inicio === clave) ?? null,
                );
              }}
              className="flex flex-wrap gap-2"
              aria-label="Turnos disponibles"
            >
              {turnosDelDia.map((turno) => (
                <ToggleButton key={turno.inicio} id={turno.inicio}>
                  {turno.horaInicio}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </>
        )}
      </div>
    </div>
  );
}
