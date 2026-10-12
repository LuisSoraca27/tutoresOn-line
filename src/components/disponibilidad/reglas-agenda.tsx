"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Description,
  Label,
  NumberField,
} from "@heroui/react";
import { guardarReglas } from "@/features/disponibilidad/acciones";
import type { ReglasAgenda } from "@/features/disponibilidad";

const DURACIONES_POSIBLES = [30, 45, 60, 90, 120];

/**
 * Reglas de la agenda (F5.4): qué duraciones ofrece el tutor, cuánto
 * descansa entre sesiones y con cuánta antelación acepta reservas.
 *
 * Los tres valores entran directo en el cálculo de turnos, así que cambiarlos
 * cambia lo que ve el estudiante en el paso 2 de la reserva.
 */
export function ReglasAgendaFormulario({
  tutorId,
  reglasIniciales,
}: {
  tutorId: string;
  reglasIniciales: ReglasAgenda;
}) {
  const [reglas, setReglas] = useState(reglasIniciales);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const cambiado = JSON.stringify(reglas) !== JSON.stringify(reglasIniciales);

  function guardar() {
    iniciar(async () => {
      const resultado = await guardarReglas(tutorId, reglas);
      setAviso({ ok: resultado.ok, mensaje: resultado.mensaje ?? "" });
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Reglas de mis sesiones</Card.Title>
        <Card.Description>
          Definen los turnos que puede elegir el estudiante dentro de tu horario.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-6">
        <CheckboxGroup
          value={reglas.duraciones.map(String)}
          onChange={(valores) =>
            setReglas({ ...reglas, duraciones: valores.map(Number).sort((a, b) => a - b) })
          }
        >
          <Label>Duraciones que ofrezco</Label>
          <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
            {DURACIONES_POSIBLES.map((duracion) => (
              <Checkbox key={duracion} value={String(duracion)}>
                <Checkbox.Content>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  {duracion} min
                </Checkbox.Content>
              </Checkbox>
            ))}
          </div>
        </CheckboxGroup>

        <div className="grid gap-5 sm:grid-cols-2">
          <NumberField
            value={reglas.descansoMinutos}
            onChange={(valor) => setReglas({ ...reglas, descansoMinutos: valor })}
            minValue={0}
            maxValue={60}
            step={5}
          >
            <Label>Descanso entre sesiones</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
            <Description>Minutos libres antes del siguiente turno.</Description>
          </NumberField>

          <NumberField
            value={reglas.antelacionHoras}
            onChange={(valor) => setReglas({ ...reglas, antelacionHoras: valor })}
            minValue={0}
            maxValue={72}
            step={1}
          >
            <Label>Antelación mínima</Label>
            <NumberField.Group>
              <NumberField.DecrementButton />
              <NumberField.Input />
              <NumberField.IncrementButton />
            </NumberField.Group>
            <Description>Horas de aviso antes de que empiece la sesión.</Description>
          </NumberField>
        </div>
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar reglas"}
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
