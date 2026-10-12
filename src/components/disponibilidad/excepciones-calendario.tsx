"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Calendar, Card } from "@heroui/react";
import { getLocalTimeZone, parseDate, today, type DateValue } from "@internationalized/date";
import { guardarExcepciones } from "@/features/disponibilidad/acciones";
import type { Excepcion } from "@/features/disponibilidad";
import { fechaLarga } from "@/lib/formato";

/**
 * Días bloqueados (F5.3): vacaciones, un festivo, una cita médica.
 *
 * El calendario va en selección múltiple, así que bloquear una semana entera
 * es hacer siete clics seguidos sin salir de la vista. Los días marcados
 * desaparecen de los turnos que ve el estudiante.
 */
export function ExcepcionesCalendario({
  tutorId,
  excepcionesIniciales,
}: {
  tutorId: string;
  excepcionesIniciales: Excepcion[];
}) {
  const [fechas, setFechas] = useState<string[]>(
    excepcionesIniciales.map((excepcion) => excepcion.fecha).sort(),
  );
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const iniciales = excepcionesIniciales.map((excepcion) => excepcion.fecha).sort();
  const cambiado = JSON.stringify(fechas) !== JSON.stringify(iniciales);

  const seleccion = fechas.map((fecha) => parseDate(fecha));

  function alCambiar(valores: readonly DateValue[]) {
    // `toString()` de un CalendarDate ya devuelve "AAAA-MM-DD".
    setFechas(valores.map((valor) => valor.toString()).sort());
    setAviso(null);
  }

  function guardar() {
    iniciar(async () => {
      const resultado = await guardarExcepciones(
        tutorId,
        fechas.map((fecha) => ({ fecha })),
      );
      setAviso({ ok: resultado.ok, mensaje: resultado.mensaje ?? "" });
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Días que no atiendo</Card.Title>
        <Card.Description>
          Toca un día para bloquearlo y vuelve a tocarlo para liberarlo. Se descuentan de tu
          horario semanal solo esa fecha.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-6 lg:flex-row">
        <Calendar
          selectionMode="multiple"
          value={seleccion}
          onChange={alCambiar}
          minValue={today(getLocalTimeZone())}
          aria-label="Días bloqueados"
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
            <Calendar.GridBody>{(fecha) => <Calendar.Cell date={fecha} />}</Calendar.GridBody>
          </Calendar.Grid>
        </Calendar>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium">
            {fechas.length === 0
              ? "Ningún día bloqueado"
              : `${fechas.length} ${fechas.length === 1 ? "día bloqueado" : "días bloqueados"}`}
          </h3>

          {fechas.length === 0 ? (
            <p className="pt-1.5 text-sm text-[var(--muted)]">
              Tu horario semanal se aplica sin excepciones.
            </p>
          ) : (
            <ul className="flex flex-col gap-1 pt-3">
              {fechas.map((fecha) => (
                <li
                  key={fecha}
                  className="flex items-center justify-between gap-3 border-b border-[var(--border)] py-1.5 text-sm last:border-0"
                >
                  <span className="first-letter:uppercase">{fechaLarga(`${fecha}T00:00`)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => setFechas(fechas.filter((otra) => otra !== fecha))}
                    aria-label={`Liberar el ${fechaLarga(`${fecha}T00:00`)}`}
                  >
                    Liberar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar días bloqueados"}
        </Button>

        {aviso ? (
          <Alert status={aviso.ok ? "success" : "danger"} className="w-full">
            <Alert.Content>
              <Alert.Description>{aviso.mensaje}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Footer>
    </Card>
  );
}
