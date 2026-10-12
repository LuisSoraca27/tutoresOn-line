"use client";

import { useState, useTransition } from "react";
import { Alert, Button, Card, Separator } from "@heroui/react";
import { CampoHora } from "@/components/disponibilidad/campo-hora";
import { guardarBloques } from "@/features/disponibilidad/acciones";
import { DIAS, type BloqueSemanal, type DiaSemana } from "@/features/disponibilidad";

let contador = 0;
const nuevoId = () => `nuevo-${(contador += 1)}`;

/**
 * Editor del horario semanal recurrente (F5.2).
 *
 * El tutor no agenda día por día: declara en qué franjas atiende cada semana.
 * De aquí salen todos los turnos que verá el estudiante.
 */
export function EditorHorario({
  tutorId,
  bloquesIniciales,
}: {
  tutorId: string;
  bloquesIniciales: BloqueSemanal[];
}) {
  const [bloques, setBloques] = useState(bloquesIniciales);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const cambiado = JSON.stringify(bloques) !== JSON.stringify(bloquesIniciales);

  function agregar(dia: DiaSemana) {
    const delDia = bloques.filter((bloque) => bloque.dia === dia);
    // La franja nueva empieza donde terminó la última, que es lo que casi
    // siempre se quiere; si el día está vacío, la mañana estándar.
    const ultima = delDia.at(-1);
    const inicio = ultima ? ultima.fin : "08:00";
    const fin = ultima ? sumarUnaHora(ultima.fin) : "12:00";

    setBloques([...bloques, { id: nuevoId(), dia, inicio, fin }]);
    setAviso(null);
  }

  function actualizar(id: string, parcial: Partial<BloqueSemanal>) {
    setBloques(bloques.map((bloque) => (bloque.id === id ? { ...bloque, ...parcial } : bloque)));
    setAviso(null);
  }

  function quitar(id: string) {
    setBloques(bloques.filter((bloque) => bloque.id !== id));
    setAviso(null);
  }

  function guardar() {
    iniciar(async () => {
      const resultado = await guardarBloques(tutorId, bloques);
      setAviso({ ok: resultado.ok, mensaje: resultado.mensaje ?? "" });
    });
  }

  const horasSemanales = bloques.reduce(
    (total, bloque) => total + (minutos(bloque.fin) - minutos(bloque.inicio)) / 60,
    0,
  );

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Horario semanal</Card.Title>
        <Card.Description>
          Se repite todas las semanas. Suma{" "}
          <span className="font-medium text-[var(--foreground)] tabular-nums">
            {horasSemanales.toLocaleString("es-CO", { maximumFractionDigits: 1 })} horas
          </span>{" "}
          disponibles.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-1">
        {DIAS.map((dia, indice) => {
          const delDia = bloques.filter((bloque) => bloque.dia === dia.id);

          return (
            <div key={dia.id}>
              {indice > 0 ? <Separator className="my-1" /> : null}

              <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start">
                <p className="w-28 shrink-0 pt-1.5 text-sm font-medium">{dia.nombre}</p>

                <div className="flex flex-1 flex-col gap-2">
                  {delDia.length === 0 ? (
                    <p className="pt-1.5 text-sm text-[var(--muted)]">No atiendo este día</p>
                  ) : (
                    delDia.map((bloque) => (
                      <div key={bloque.id} className="flex flex-wrap items-end gap-2">
                        <CampoHora
                          valor={bloque.inicio}
                          onCambio={(valor) => actualizar(bloque.id, { inicio: valor })}
                          etiqueta={`Hora de inicio, ${dia.nombre}`}
                          ocultarEtiqueta
                        />
                        <span className="pb-2 text-sm text-[var(--muted)]">a</span>
                        <CampoHora
                          valor={bloque.fin}
                          onCambio={(valor) => actualizar(bloque.id, { fin: valor })}
                          etiqueta={`Hora de fin, ${dia.nombre}`}
                          ocultarEtiqueta
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => quitar(bloque.id)}
                          aria-label={`Quitar la franja de ${bloque.inicio} a ${bloque.fin} del ${dia.nombre}`}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onPress={() => agregar(dia.id)}
                >
                  Agregar franja
                </Button>
              </div>
            </div>
          );
        })}
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar horario"}
        </Button>

        {cambiado && !guardando ? (
          <Button variant="ghost" onPress={() => setBloques(bloquesIniciales)}>
            Descartar cambios
          </Button>
        ) : null}

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

function minutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function sumarUnaHora(hora: string): string {
  const total = Math.min(minutos(hora) + 60, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
