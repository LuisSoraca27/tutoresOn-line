"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Chip,
  Label,
  ListBox,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  type Key,
} from "@heroui/react";
import { IconoReloj } from "@/components/ui/iconos";
import type { Materia, Nivel, NivelId } from "@/features/catalogos";
import {
  cancelarBusqueda,
  consultarBusqueda,
  lanzarBusqueda,
  type EstadoBusqueda,
} from "@/features/express/acciones";
import { MINUTOS_VIGENCIA, SEGUNDOS_SONDEO } from "@/features/express";
import { iniciales } from "@/lib/texto";

const DURACIONES = [30, 60, 90];

/**
 * Tutor al instante, lado del estudiante (F4.1 – F4.3, F4.6, F4.7).
 *
 * Tres estados: el formulario, la búsqueda en vivo y el emparejamiento.
 * Mientras busca, la pantalla pregunta al servidor cada pocos segundos y
 * muestra a quién se le está avisando, para que la espera no sea una caja
 * negra con una ruedita girando.
 */
export function BuscadorExpress({
  estudianteId,
  materias,
  niveles,
}: {
  estudianteId: string;
  materias: Materia[];
  niveles: Nivel[];
}) {
  const [materiaId, setMateriaId] = useState<string | null>(null);
  const [nivelId, setNivelId] = useState<NivelId | null>(null);
  const [modalidad, setModalidad] = useState<"virtual" | "presencial">("virtual");
  const [duracion, setDuracion] = useState(60);
  const [nota, setNota] = useState("");

  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoBusqueda | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  // Sondeo mientras la búsqueda sigue viva.
  useEffect(() => {
    if (!solicitudId) return;

    let activo = true;

    async function preguntar() {
      const nuevo = await consultarBusqueda(solicitudId!);
      if (activo) setEstado(nuevo);
    }

    preguntar();
    const reloj = setInterval(preguntar, SEGUNDOS_SONDEO * 1000);

    return () => {
      activo = false;
      clearInterval(reloj);
    };
  }, [solicitudId]);

  function lanzar() {
    if (!materiaId || !nivelId) return;
    setError(null);

    iniciar(async () => {
      const resultado = await lanzarBusqueda({
        estudianteId,
        materiaId,
        nivelId,
        modalidad,
        duracionMinutos: duracion,
        nota: nota.trim() || undefined,
      });

      if (resultado.ok) setSolicitudId(resultado.solicitud.id);
      else setError(resultado.mensaje);
    });
  }

  function cancelar() {
    if (!solicitudId) return;
    iniciar(async () => {
      await cancelarBusqueda(solicitudId);
      setSolicitudId(null);
      setEstado(null);
    });
  }

  // ------------------------------------------------------------ emparejada

  if (estado?.solicitud?.estado === "emparejada" && estado.tutor) {
    return (
      <Card>
        <Card.Header className="flex flex-row items-start gap-3">
          <Avatar size="md" className="shrink-0">
            <Avatar.Fallback>{iniciales(estado.tutor.nombre)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <Card.Title className="text-base">{estado.tutor.nombre} te tomó la clase</Card.Title>
            <Card.Description>{estado.tutor.titulo}</Card.Description>
          </div>
          <Chip size="sm" color="success" variant="soft">
            Emparejado
          </Chip>
        </Card.Header>

        <Card.Content>
          <p className="text-sm">
            La sesión empieza en unos minutos. Entra a la sala cuando quieras y prueba cámara y
            micrófono.
          </p>
        </Card.Content>

        <Card.Footer className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
          <Button variant="primary">
            <Link href={`/sesion/${estado.solicitud.reservaId}`}>Ir a la sala</Link>
          </Button>
          <Button variant="ghost" onPress={() => { setSolicitudId(null); setEstado(null); }}>
            Buscar otra
          </Button>
        </Card.Footer>
      </Card>
    );
  }

  // ------------------------------------------------------------- buscando

  if (estado?.solicitud?.estado === "buscando") {
    return (
      <Card>
        <Card.Content className="py-10 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <IconoReloj className="size-7 animate-pulse text-[var(--accent)]" />
          </div>

          <h2 className="titulo pt-4 text-xl">Buscando un tutor disponible</h2>
          <p className="mx-auto max-w-[46ch] pt-2 text-sm text-[var(--muted)]">
            {estado.candidatos.length === 0
              ? "Ahora mismo no hay tutores conectados para esa materia. Seguimos intentando durante unos minutos."
              : `Avisando a ${estado.candidatos.length} ${
                  estado.candidatos.length === 1 ? "tutor conectado" : "tutores conectados"
                }. El primero que responda se queda con la clase.`}
          </p>

          {estado.candidatos.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2 pt-5">
              {estado.candidatos.map((candidato) => (
                <Chip key={candidato.id} size="sm" variant="soft">
                  {candidato.nombre}
                </Chip>
              ))}
            </div>
          ) : null}

          <div className="mx-auto max-w-sm pt-7">
            <ProgressBar isIndeterminate aria-label="Buscando tutor">
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            <p className="pt-2 text-xs text-[var(--muted)]">
              La búsqueda se cierra sola a los {MINUTOS_VIGENCIA} minutos.
            </p>
          </div>
        </Card.Content>

        <Card.Footer className="justify-center border-t border-[var(--border)] pt-4">
          <Button variant="outline" isDisabled={enviando} onPress={cancelar}>
            Cancelar la búsqueda
          </Button>
        </Card.Footer>
      </Card>
    );
  }

  // ----------------------------------------------- expirada o cancelada

  if (estado?.solicitud) {
    return (
      <Alert status="warning">
        <Alert.Content>
          <Alert.Title>
            {estado.solicitud.estado === "expirada"
              ? "Nadie tomó la solicitud"
              : "Cancelaste la búsqueda"}
          </Alert.Title>
          <Alert.Description>
            Puedes intentarlo otra vez o reservar con horario, que siempre encuentra a alguien.
          </Alert.Description>
        </Alert.Content>
        <div className="flex flex-wrap gap-2 pt-3">
          <Button variant="primary" size="sm" onPress={() => { setSolicitudId(null); setEstado(null); }}>
            Intentar de nuevo
          </Button>
          <Button variant="ghost" size="sm">
            <Link href="/buscar">Reservar con horario</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  // ------------------------------------------------------------ formulario

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">¿Qué necesitas ahora?</Card.Title>
        <Card.Description>
          Cuatro datos y lanzamos la búsqueda entre los tutores conectados.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-5">
        <Select
          placeholder="Elige una materia"
          value={materiaId}
          onChange={(valor: Key | null) => setMateriaId(valor ? String(valor) : null)}
        >
          <Label>Materia</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {materias.map((materia) => (
                <ListBox.Item key={materia.id} id={materia.id} textValue={materia.nombre}>
                  {materia.nombre}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <Select
          placeholder="Elige un nivel"
          value={nivelId}
          onChange={(valor: Key | null) => setNivelId(valor ? (String(valor) as NivelId) : null)}
        >
          <Label>Nivel educativo</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {niveles.map((nivel) => (
                <ListBox.Item key={nivel.id} id={nivel.id} textValue={nivel.nombre}>
                  {nivel.nombre}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <RadioGroup
          value={modalidad}
          onChange={(valor) => setModalidad(valor as "virtual" | "presencial")}
        >
          <Label>Modalidad</Label>
          <Radio value="virtual">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              Virtual, empezamos ya
            </Radio.Content>
          </Radio>
          <Radio value="presencial">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              Presencial, cerca de mí
            </Radio.Content>
          </Radio>
        </RadioGroup>

        <div>
          <p className="pb-2 text-sm font-medium">Cuánto tiempo</p>
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
            {DURACIONES.map((minutos) => (
              <ToggleButton key={minutos} id={String(minutos)}>
                {minutos} min
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>

        <TextField value={nota} onChange={setNota}>
          <Label>Qué tema, en una línea (opcional)</Label>
          <TextArea rows={2} placeholder="Ejercicio 4 del taller de integrales por partes." />
        </TextField>

        {error ? (
          <Alert status="danger">
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Content>

      <Card.Footer className="border-t border-[var(--border)] pt-4">
        <Button
          variant="primary"
          isDisabled={enviando || !materiaId || !nivelId}
          onPress={lanzar}
        >
          {enviando ? "Lanzando…" : "Buscar tutor ahora"}
        </Button>
      </Card.Footer>
    </Card>
  );
}
