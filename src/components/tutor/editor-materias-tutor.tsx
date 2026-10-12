"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Label,
  ListBox,
  NumberField,
  Select,
  Separator,
  type Key,
} from "@heroui/react";
import type { Materia, Nivel, NivelId } from "@/features/catalogos";
import { guardarMaterias } from "@/features/tutores/acciones";
import type { MateriaDictada } from "@/features/tutores";
import { precio } from "@/lib/formato";

/**
 * Materias, niveles y tarifas del tutor (F5.7).
 *
 * Una fila por materia, con su propia tarifa: cobrar lo mismo por cálculo
 * universitario que por matemáticas de primaria no tiene sentido, y el
 * dominio ya lo modelaba así desde el Sprint 0.
 */
export function EditorMateriasTutor({
  tutorId,
  materiasIniciales,
  catalogo,
  niveles,
}: {
  tutorId: string;
  materiasIniciales: MateriaDictada[];
  catalogo: Materia[];
  niveles: Nivel[];
}) {
  const [materias, setMaterias] = useState(materiasIniciales);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const cambiado = JSON.stringify(materias) !== JSON.stringify(materiasIniciales);
  const usadas = new Set(materias.map((materia) => materia.materiaId));
  const disponibles = catalogo.filter((materia) => !usadas.has(materia.id));

  function agregar(materiaId: string) {
    setMaterias([...materias, { materiaId, nivelIds: [], precioHora: 40000 }]);
    setAviso(null);
  }

  function actualizar(materiaId: string, parcial: Partial<MateriaDictada>) {
    setMaterias(
      materias.map((materia) =>
        materia.materiaId === materiaId ? { ...materia, ...parcial } : materia,
      ),
    );
    setAviso(null);
  }

  function quitar(materiaId: string) {
    setMaterias(materias.filter((materia) => materia.materiaId !== materiaId));
    setAviso(null);
  }

  function guardar() {
    iniciar(async () => {
      const resultado = await guardarMaterias(tutorId, materias);
      setAviso(
        resultado.ok
          ? { ok: true, mensaje: "Materias y tarifas guardadas." }
          : { ok: false, mensaje: resultado.mensaje },
      );
    });
  }

  const desde = materias.length > 0 ? Math.min(...materias.map((m) => m.precioHora)) : 0;

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Lo que dicto</Card.Title>
        <Card.Description>
          {materias.length === 0
            ? "Sin materias no apareces en ninguna búsqueda."
            : `En tu tarjeta de resultados aparecerá “desde ${precio(desde)} / hora”.`}
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-1">
        {materias.length === 0 ? (
          <p className="py-4 text-sm text-[var(--muted)]">
            Agrega tu primera materia abajo.
          </p>
        ) : (
          materias.map((materia, indice) => {
            const nombre =
              catalogo.find((otra) => otra.id === materia.materiaId)?.nombre ?? materia.materiaId;

            return (
              <div key={materia.materiaId}>
                {indice > 0 ? <Separator className="my-3" /> : null}

                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-medium">{nombre}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => quitar(materia.materiaId)}
                      aria-label={`Dejar de dictar ${nombre}`}
                    >
                      Quitar
                    </Button>
                  </div>

                  <CheckboxGroup
                    value={materia.nivelIds}
                    onChange={(valores) =>
                      actualizar(materia.materiaId, { nivelIds: valores as NivelId[] })
                    }
                  >
                    <Label className="text-sm">Niveles</Label>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
                      {niveles.map((nivel) => (
                        <Checkbox key={nivel.id} value={nivel.id}>
                          <Checkbox.Content>
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                            {nivel.nombre}
                          </Checkbox.Content>
                        </Checkbox>
                      ))}
                    </div>
                  </CheckboxGroup>

                  <NumberField
                    className="max-w-56"
                    value={materia.precioHora}
                    onChange={(valor) => actualizar(materia.materiaId, { precioHora: valor })}
                    minValue={10000}
                    maxValue={500000}
                    step={5000}
                    formatOptions={{ style: "currency", currency: "COP", maximumFractionDigits: 0 }}
                  >
                    <Label className="text-sm">Tarifa por hora</Label>
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                </div>
              </div>
            );
          })
        )}

        {disponibles.length > 0 ? (
          <div className="pt-4">
            <Select
              placeholder="Agregar una materia…"
              value={null}
              onChange={(valor: Key | null) => {
                if (valor) agregar(String(valor));
              }}
            >
              <Label className="sr-only">Agregar una materia</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                {/*
                  Colección dinámica con `items`: la lista se encoge cada vez
                  que se agrega una materia, y React Aria no admite que los
                  identificadores de una colección estática cambien en sitio.
                */}
                <ListBox items={disponibles}>
                  {(materia: Materia) => (
                    <ListBox.Item id={materia.id} textValue={materia.nombre}>
                      {materia.nombre}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  )}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        ) : null}
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </Button>

        {cambiado && !guardando ? (
          <Button variant="ghost" onPress={() => setMaterias(materiasIniciales)}>
            Descartar
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
