"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Card,
  Description,
  Label,
  ListBox,
  Radio,
  RadioGroup,
  Select,
  Slider,
  type Key,
} from "@heroui/react";
import type { Ciudad } from "@/features/catalogos";
import { guardarCobertura } from "@/features/tutores/acciones";
import type { Modalidad } from "@/features/tutores";

const RADIO_POR_DEFECTO = 10;

/**
 * Cobertura para tutorías presenciales (F5.8).
 *
 * La ciudad y el radio solo tienen sentido si el tutor sale de casa, así que
 * el formulario los oculta cuando la modalidad es solo virtual en vez de
 * dejarlos ahí deshabilitados sin explicación.
 */
export function EditorCobertura({
  tutorId,
  modalidadInicial,
  ciudadInicial,
  radioInicial,
  ciudades,
}: {
  tutorId: string;
  modalidadInicial: Modalidad;
  ciudadInicial: string | null;
  radioInicial: number | null;
  ciudades: Ciudad[];
}) {
  const [modalidad, setModalidad] = useState<Modalidad>(modalidadInicial);
  const [ciudadId, setCiudadId] = useState(ciudadInicial);
  const [radioKm, setRadioKm] = useState(radioInicial ?? RADIO_POR_DEFECTO);
  const [aviso, setAviso] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const [guardando, iniciar] = useTransition();

  const presencial = modalidad !== "virtual";

  const cambiado =
    modalidad !== modalidadInicial ||
    ciudadId !== ciudadInicial ||
    (presencial && radioKm !== (radioInicial ?? RADIO_POR_DEFECTO));

  function guardar() {
    iniciar(async () => {
      const resultado = await guardarCobertura(tutorId, {
        modalidad,
        ciudadId,
        radioKm: presencial ? radioKm : null,
      });

      setAviso(
        resultado.ok
          ? { ok: true, mensaje: "Cobertura guardada." }
          : { ok: false, mensaje: resultado.mensaje },
      );
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Dónde atiendo</Card.Title>
        <Card.Description>
          Define en qué búsquedas apareces: el filtro de ciudad de los estudiantes usa esto.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-6">
        <RadioGroup value={modalidad} onChange={(valor) => setModalidad(valor as Modalidad)}>
          <Label>Modalidad</Label>
          <Radio value="virtual">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              Solo virtual
            </Radio.Content>
          </Radio>
          <Radio value="presencial">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              Solo presencial
            </Radio.Content>
          </Radio>
          <Radio value="ambas">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              Las dos, según lo que pida el estudiante
            </Radio.Content>
          </Radio>
        </RadioGroup>

        {presencial ? (
          <>
            <Select
              placeholder="Elige tu ciudad"
              value={ciudadId}
              onChange={(valor: Key | null) => setCiudadId(valor ? String(valor) : null)}
            >
              <Label>Ciudad base</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {ciudades.map((ciudad) => (
                    <ListBox.Item key={ciudad.id} id={ciudad.id} textValue={ciudad.nombre}>
                      {ciudad.nombre}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
              <Description>Desde aquí se mide cuánto te desplazas.</Description>
            </Select>

            <Slider
              value={radioKm}
              onChange={(valor) => setRadioKm(valor as number)}
              minValue={1}
              maxValue={40}
              step={1}
            >
              <div className="flex items-baseline justify-between gap-3">
                <Label>Hasta dónde me desplazo</Label>
                <span className="text-sm tabular-nums text-[var(--muted)]">{radioKm} km</span>
              </div>
              <Slider.Track>
                <Slider.Fill />
                <Slider.Thumb />
              </Slider.Track>
            </Slider>
          </>
        ) : (
          <Alert status="default">
            <Alert.Content>
              <Alert.Description>
                Al ser solo virtual desapareces del filtro por ciudad, pero apareces para
                estudiantes de todo el país.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
      </Card.Content>

      <Card.Footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
        <Button variant="primary" isDisabled={!cambiado || guardando} onPress={guardar}>
          {guardando ? "Guardando…" : "Guardar cobertura"}
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
