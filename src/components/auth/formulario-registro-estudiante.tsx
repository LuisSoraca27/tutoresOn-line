"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  Description,
  ErrorMessage,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
  type Key,
} from "@heroui/react";
import { CampoClave, claveValida } from "@/components/auth/campo-clave";
import { AYUDA_CORREO, useEstadoCorreo } from "@/components/auth/usar-estado-correo";
import { registrarEstudiante } from "@/features/auth/acciones";
import type { Ciudad, Nivel, NivelId } from "@/features/catalogos";

/**
 * Registro de estudiante (F1.2, F1.12).
 *
 * Un solo paso: pedirle tres pantallas a alguien que solo quiere buscar un
 * tutor es la forma más segura de perderlo. Ciudad y teléfono son opcionales
 * porque el buscador funciona sin ellos.
 */
export function FormularioRegistroEstudiante({
  niveles,
  ciudades,
}: {
  niveles: Nivel[];
  ciudades: Ciudad[];
}) {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nivelId, setNivelId] = useState<NivelId | null>(null);
  const [ciudadId, setCiudadId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [creando, iniciar] = useTransition();

  const estadoCorreo = useEstadoCorreo(correo);

  const completo =
    nombre.trim().length >= 3 &&
    claveValida(clave) &&
    nivelId !== null &&
    (estadoCorreo === "libre" || estadoCorreo === "revisando");

  function crear() {
    if (!completo) return;
    setError(null);

    iniciar(async () => {
      const resultado = await registrarEstudiante({
        nombre,
        correo,
        clave,
        telefono: telefono.trim() || undefined,
        ciudadId: ciudadId ?? undefined,
        nivelId,
      });

      if (!resultado.ok) {
        setError(resultado.mensaje);
        return;
      }

      // El layout raíz lee la cookie en el servidor: sin `refresh` la barra
      // superior seguiría mostrando "Iniciar sesión" después de entrar.
      router.replace(resultado.destino);
      router.refresh();
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="titulo text-2xl">Crear cuenta de estudiante</Card.Title>
        <Card.Description>
          Con esto ya puedes reservar. Lo demás —foto, preferencias de aviso— se completa
          después desde tu perfil.
        </Card.Description>
      </Card.Header>

      <Card.Content>
        <form
          className="flex flex-col gap-5"
          onSubmit={(evento) => {
            evento.preventDefault();
            crear();
          }}
        >
          <TextField value={nombre} onChange={setNombre} autoComplete="name" isRequired>
            <Label>Nombre completo</Label>
            <Input placeholder="Sara Betancur" autoFocus />
          </TextField>

          <TextField
            value={correo}
            onChange={setCorreo}
            type="email"
            autoComplete="email"
            isRequired
            isInvalid={estadoCorreo === "ocupado"}
          >
            <Label>Correo electrónico</Label>
            <Input placeholder="tucorreo@ejemplo.co" />
            {/*
              HeroUI oculta la descripción cuando el campo es inválido y en su
              lugar muestra el mensaje de error: el aviso de correo ocupado
              tiene que ir por ese canal o no se ve.
            */}
            {estadoCorreo === "ocupado" ? (
              <ErrorMessage>{AYUDA_CORREO.ocupado}</ErrorMessage>
            ) : (
              <Description>{AYUDA_CORREO[estadoCorreo]}</Description>
            )}
          </TextField>

          <CampoClave valor={clave} onCambio={setClave} />

          <Select
            placeholder="Elige tu nivel"
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
            <Description>
              Filtra la búsqueda para que no te aparezcan tutores de otro nivel.
            </Description>
          </Select>

          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              placeholder="Sin ciudad"
              value={ciudadId}
              onChange={(valor: Key | null) => setCiudadId(valor ? String(valor) : null)}
            >
              <Label>Ciudad (opcional)</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox items={ciudades}>
                  {(ciudad: Ciudad) => (
                    <ListBox.Item id={ciudad.id} textValue={ciudad.nombre}>
                      {ciudad.nombre}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  )}
                </ListBox>
              </Select.Popover>
              <Description>Solo si te interesan tutorías presenciales.</Description>
            </Select>

            <TextField value={telefono} onChange={setTelefono} type="tel" autoComplete="tel">
              <Label>Teléfono (opcional)</Label>
              <Input placeholder="+57 300 123 4567" />
              <Description>Para avisarte de cambios de última hora.</Description>
            </TextField>
          </div>

          {error ? (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          ) : null}

          <Button type="submit" variant="primary" isDisabled={!completo || creando}>
            {creando ? "Creando tu cuenta…" : "Crear cuenta y entrar"}
          </Button>
        </form>
      </Card.Content>

      <Card.Footer className="border-t border-[var(--border)] pt-4 text-sm text-[var(--muted)]">
        <p>
          ¿Vas a dictar clases?{" "}
          <Link
            href="/auth/registro/tutor"
            className="text-[var(--accent)] underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
          >
            Regístrate como tutor
          </Link>
        </p>
      </Card.Footer>
    </Card>
  );
}
