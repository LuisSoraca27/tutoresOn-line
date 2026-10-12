"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Description,
  Input,
  Label,
  ListBox,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Separator,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  type Key,
} from "@heroui/react";
import { SelectorTurno } from "@/components/reservas/selector-turno";
import type { Materia, Nivel, NivelId } from "@/features/catalogos";
import type { Turno } from "@/features/disponibilidad";
import { crearReserva } from "@/features/reservas/acciones";
import type { Reserva } from "@/features/reservas";
import type { Tutor } from "@/features/tutores";
import { fechaLarga, precio } from "@/lib/formato";

type Modalidad = "virtual" | "presencial";

const PASOS = ["Qué necesitas", "Cuándo", "Confirmar"];

/**
 * Asistente de reserva en tres pasos (F3.1 – F3.6).
 *
 * El orden no es arbitrario: la materia y la duración determinan qué turnos
 * existen, así que preguntar primero por el horario obligaría a recalcularlo
 * todo al final. Cada paso solo deja avanzar cuando está completo.
 */
export function AsistenteReserva({
  tutor,
  materias,
  niveles,
  duraciones,
  estudianteId,
  ciudad,
  puedeReservar,
}: {
  tutor: Tutor;
  materias: Materia[];
  niveles: Nivel[];
  duraciones: number[];
  estudianteId: string;
  ciudad?: string;
  /** F3.6: sin sesión iniciada no se puede confirmar. */
  puedeReservar: boolean;
}) {
  const [paso, setPaso] = useState(0);

  const [materiaId, setMateriaId] = useState<string | null>(
    tutor.materias.length === 1 ? tutor.materias[0].materiaId : null,
  );
  const [nivelId, setNivelId] = useState<NivelId | null>(null);
  const [modalidad, setModalidad] = useState<Modalidad>(
    tutor.modalidad === "presencial" ? "presencial" : "virtual",
  );
  const [duracion, setDuracion] = useState(duraciones[0] ?? 60);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [lugar, setLugar] = useState("");
  const [nota, setNota] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState<Reserva | null>(null);
  const [enviando, iniciar] = useTransition();

  // Solo las materias que el tutor dicta, con su nombre del catálogo.
  const materiasDelTutor = useMemo(
    () =>
      tutor.materias.map((dictada) => ({
        id: dictada.materiaId,
        nombre: materias.find((materia) => materia.id === dictada.materiaId)?.nombre ?? dictada.materiaId,
      })),
    [tutor.materias, materias],
  );

  const dictada = tutor.materias.find((item) => item.materiaId === materiaId);

  // Los niveles dependen de la materia: no todos se dictan en todos.
  const nivelesPosibles = useMemo(
    () =>
      (dictada?.nivelIds ?? []).map((id) => ({
        id,
        nombre: niveles.find((nivel) => nivel.id === id)?.nombre ?? id,
      })),
    [dictada, niveles],
  );

  const precioHora = dictada?.precioHora ?? tutor.precioDesde;
  const total = Math.round((precioHora * duracion) / 60);

  const paso1Completo = Boolean(materiaId && nivelId);
  const paso2Completo = Boolean(turno);

  function confirmar() {
    if (!turno || !materiaId || !nivelId) return;
    setError(null);

    iniciar(async () => {
      const resultado = await crearReserva({
        tutorId: tutor.id,
        estudianteId,
        materiaId,
        nivelId,
        modalidad,
        inicio: turno.inicio,
        fin: turno.fin,
        duracionMinutos: duracion,
        precio: total,
        lugar: modalidad === "presencial" ? lugar.trim() : undefined,
        notaEstudiante: nota.trim() || undefined,
      });

      if (resultado.ok) {
        setConfirmada(resultado.reserva);
      } else {
        setError(resultado.mensaje);
        // Si el turno se ocupó, hay que volver a elegir horario.
        if (resultado.mensaje.includes("turno")) {
          setTurno(null);
          setPaso(1);
        }
      }
    });
  }

  // ------------------------------------------------------- reserva confirmada

  if (confirmada) {
    return (
      <Card>
        <Card.Header>
          <Card.Title className="titulo text-xl">Reserva enviada a {tutor.nombre}</Card.Title>
          <Card.Description>
            Queda pendiente hasta que el tutor la acepte. Te avisamos apenas responda.
          </Card.Description>
        </Card.Header>

        <Card.Content>
          <ResumenReserva
            tutor={tutor.nombre}
            materia={materiasDelTutor.find((m) => m.id === materiaId)?.nombre ?? ""}
            nivel={nivelesPosibles.find((n) => n.id === nivelId)?.nombre ?? ""}
            modalidad={modalidad}
            turno={{ inicio: confirmada.inicio, fin: confirmada.fin } as Turno}
            duracion={duracion}
            lugar={confirmada.lugar}
            total={total}
            codigo={confirmada.id}
          />
        </Card.Content>

        <Card.Footer className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
          <Button variant="primary">
            <Link href="/estudiante">Ir a mi panel</Link>
          </Button>
          <Button variant="ghost">
            <Link href="/buscar">Buscar otro tutor</Link>
          </Button>
        </Card.Footer>
      </Card>
    );
  }

  // ------------------------------------------------------------------ pasos

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-baseline justify-between gap-3 pb-2">
          <p className="text-sm font-medium">{PASOS[paso]}</p>
          <p className="text-sm text-[var(--muted)] tabular-nums">
            Paso {paso + 1} de {PASOS.length}
          </p>
        </div>
        <ProgressBar
          value={paso + 1}
          maxValue={PASOS.length}
          aria-label={`Paso ${paso + 1} de ${PASOS.length}: ${PASOS[paso]}`}
        >
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>

      <Card>
        <Card.Content className="py-6">
          {paso === 0 ? (
            <div className="flex flex-col gap-5">
              <Select
                placeholder="Elige una materia"
                value={materiaId}
                onChange={(valor: Key | null) => {
                  setMateriaId(valor ? String(valor) : null);
                  setNivelId(null);
                }}
              >
                <Label>Materia</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {materiasDelTutor.map((materia) => (
                      <ListBox.Item key={materia.id} id={materia.id} textValue={materia.nombre}>
                        {materia.nombre}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <Select
                placeholder={materiaId ? "Elige un nivel" : "Primero elige la materia"}
                value={nivelId}
                isDisabled={!materiaId}
                onChange={(valor: Key | null) => setNivelId(valor ? (String(valor) as NivelId) : null)}
              >
                <Label>Nivel educativo</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {nivelesPosibles.map((nivel) => (
                      <ListBox.Item key={nivel.id} id={nivel.id} textValue={nivel.nombre}>
                        {nivel.nombre}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              {tutor.modalidad === "ambas" ? (
                <RadioGroup
                  value={modalidad}
                  onChange={(valor) => setModalidad(valor as Modalidad)}
                >
                  <Label>Modalidad</Label>
                  <Radio value="virtual">
                    <Radio.Content>
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      Virtual, por videollamada
                    </Radio.Content>
                  </Radio>
                  <Radio value="presencial">
                    <Radio.Content>
                      <Radio.Control>
                        <Radio.Indicator />
                      </Radio.Control>
                      Presencial{ciudad ? ` en ${ciudad}` : ""}
                    </Radio.Content>
                  </Radio>
                </RadioGroup>
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  Este tutor atiende solo de forma{" "}
                  <span className="text-[var(--foreground)]">{modalidad}</span>.
                </p>
              )}

              <div>
                <p className="pb-2 text-sm font-medium">Duración de la sesión</p>
                <ToggleButtonGroup
                  selectionMode="single"
                  isDetached
                  selectedKeys={[String(duracion)]}
                  onSelectionChange={(claves) => {
                    const clave = [...claves][0];
                    if (clave) setDuracion(Number(clave));
                  }}
                  className="flex flex-wrap gap-2"
                  aria-label="Duración de la sesión"
                >
                  {duraciones.map((minutos) => (
                    <ToggleButton key={minutos} id={String(minutos)}>
                      {minutos} min
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <p className="pt-2 text-sm text-[var(--muted)] tabular-nums">
                  {precio(precioHora)} por hora · esta sesión cuesta{" "}
                  <span className="font-medium text-[var(--foreground)]">{precio(total)}</span>
                </p>
              </div>
            </div>
          ) : null}

          {paso === 1 ? (
            <SelectorTurno
              tutorId={tutor.id}
              duracionMinutos={duracion}
              turnoElegido={turno}
              onElegir={setTurno}
            />
          ) : null}

          {paso === 2 && turno ? (
            <div className="flex flex-col gap-5">
              <ResumenReserva
                tutor={tutor.nombre}
                materia={materiasDelTutor.find((m) => m.id === materiaId)?.nombre ?? ""}
                nivel={nivelesPosibles.find((n) => n.id === nivelId)?.nombre ?? ""}
                modalidad={modalidad}
                turno={turno}
                duracion={duracion}
                total={total}
              />

              <Separator />

              {modalidad === "presencial" ? (
                <TextField value={lugar} onChange={setLugar} isRequired>
                  <Label>Punto de encuentro</Label>
                  <Input placeholder="Biblioteca de la universidad, cra. 45 #26-85…" />
                  <Description>Dónde se encuentran tú y el tutor.</Description>
                </TextField>
              ) : null}

              <TextField value={nota} onChange={setNota}>
                <Label>Nota para el tutor (opcional)</Label>
                <TextArea
                  rows={3}
                  placeholder="Cuéntale qué tema necesitas repasar o para qué parcial es."
                />
              </TextField>

              {!puedeReservar ? (
                <Alert status="warning">
                  <Alert.Content>
                    <Alert.Title>Necesitas una cuenta para reservar</Alert.Title>
                    <Alert.Description>
                      Guardamos lo que elegiste. Inicia sesión como estudiante y vuelve a
                      confirmar.
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}

              {error ? (
                <Alert status="danger">
                  <Alert.Content>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}
            </div>
          ) : null}
        </Card.Content>

        <Card.Footer className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
          <Button variant="ghost" isDisabled={paso === 0 || enviando} onPress={() => setPaso(paso - 1)}>
            Atrás
          </Button>

          {paso < 2 ? (
            <Button
              variant="primary"
              isDisabled={paso === 0 ? !paso1Completo : !paso2Completo}
              onPress={() => setPaso(paso + 1)}
            >
              Continuar
            </Button>
          ) : (
            <Button
              variant="primary"
              isDisabled={!puedeReservar || enviando || (modalidad === "presencial" && !lugar.trim())}
              onPress={confirmar}
            >
              {enviando ? "Enviando…" : "Confirmar reserva"}
            </Button>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------ resumen

function ResumenReserva({
  tutor,
  materia,
  nivel,
  modalidad,
  turno,
  duracion,
  lugar,
  total,
  codigo,
}: {
  tutor: string;
  materia: string;
  nivel: string;
  modalidad: Modalidad;
  turno: Turno;
  duracion: number;
  lugar?: string;
  total: number;
  codigo?: string;
}) {
  const fecha = turno.inicio.slice(0, 10);
  const horaInicio = turno.inicio.slice(11, 16);
  const horaFin = turno.fin.slice(11, 16);

  const filas: [string, string][] = [
    ["Tutor", tutor],
    ["Materia", `${materia} · ${nivel}`],
    ["Fecha", fechaLarga(`${fecha}T00:00`)],
    ["Hora", `${horaInicio} a ${horaFin} (${duracion} min)`],
    ["Modalidad", modalidad === "virtual" ? "Virtual, por videollamada" : "Presencial"],
  ];

  if (lugar) filas.push(["Punto de encuentro", lugar]);
  if (codigo) filas.push(["Código", codigo]);

  return (
    <dl className="flex flex-col gap-0">
      {filas.map(([etiqueta, valor]) => (
        <div
          key={etiqueta}
          className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-[var(--border)] py-2.5 text-sm last:border-0"
        >
          <dt className="text-[var(--muted)]">{etiqueta}</dt>
          <dd className="text-right first-letter:uppercase">{valor}</dd>
        </div>
      ))}

      <div className="flex justify-between gap-6 pt-3">
        <span className="font-medium">Total</span>
        <span className="titulo text-xl tabular-nums">{precio(total)}</span>
      </div>
    </dl>
  );
}
