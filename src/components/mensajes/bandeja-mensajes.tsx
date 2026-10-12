"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  EmptyState,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { IconoChat } from "@/components/ui/iconos";
import { consultarHilo, enviarMensaje } from "@/features/mensajes/acciones";
import type { Mensaje } from "@/features/mensajes";
import { iniciales } from "@/lib/texto";

export interface Contacto {
  tutorId: string;
  estudianteId: string;
  nombre: string;
  titulo: string;
  /** Por qué aparece: la última sesión que tuvieron o tienen. */
  motivo: string;
}

/**
 * Mensajería del estudiante (F9.6).
 *
 * La lista de contactos no se elige: son los tutores con los que ya hay una
 * reserva. Escribirle a alguien con quien nunca se ha tenido clase abriría
 * la puerta al spam, que es el problema que hunde a estas plataformas.
 */
export function BandejaMensajes({
  usuarioId,
  contactos,
  compacto = false,
}: {
  usuarioId: string;
  contactos: Contacto[];
  compacto?: boolean;
}) {
  const [activo, setActivo] = useState<Contacto | null>(contactos[0] ?? null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, iniciar] = useTransition();
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activo) return;
    let vigente = true;
    let consultando = false;
    async function cargar() {
      if (consultando) return;
      consultando = true;
      try {
        const hilo = await consultarHilo(
          activo!.estudianteId,
          activo!.tutorId,
          usuarioId,
        );
        if (vigente) {
          setMensajes(hilo.mensajes);
          setError(null);
        }
      } catch (fallo) {
        if (vigente)
          setError(
            fallo instanceof Error
              ? fallo.message
              : "No pudimos cargar la conversación.",
          );
      } finally {
        consultando = false;
      }
    }
    iniciar(cargar);
    const intervalo = setInterval(cargar, 5000);
    return () => {
      vigente = false;
      clearInterval(intervalo);
    };
  }, [activo, usuarioId]);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [mensajes.length, activo]);

  function enviar() {
    if (!activo || !texto.trim() || cargando) return;
    setError(null);

    const borrador = texto;
    setTexto("");

    iniciar(async () => {
      try {
        const resultado = await enviarMensaje({
          estudianteId: activo.estudianteId,
          tutorId: activo.tutorId,
          autorId: usuarioId,
          texto: borrador,
        });

        if (resultado.ok) {
          const hilo = await consultarHilo(
            activo.estudianteId,
            activo.tutorId,
            usuarioId,
          );
          setMensajes(hilo.mensajes);
        } else {
          setError(resultado.mensaje ?? "No pudimos enviar el mensaje.");
          setTexto(borrador);
        }
      } catch (fallo) {
        setError(
          fallo instanceof Error
            ? fallo.message
            : "No pudimos enviar el mensaje.",
        );
        setTexto(borrador);
      }
    });
  }

  if (contactos.length === 0) {
    return (
      <EmptyState className="py-16 text-center">
        <IconoChat className="mx-auto size-8 text-[var(--muted)]" />
        <h2 className="titulo pt-3 text-lg">
          Todavía no tienes conversaciones
        </h2>
        <p className="mx-auto max-w-[48ch] pt-1.5 text-sm text-[var(--muted)]">
          Los contactos aparecen cuando tienes una reserva. Desde aquí puedes acordar los detalles de la clase con la otra persona.
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {!compacto ? (
        <nav className="lg:w-64 lg:shrink-0" aria-label="Conversaciones">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {contactos.map((contacto) => {
              const seleccionado =
                contacto.tutorId === activo?.tutorId &&
                contacto.estudianteId === activo?.estudianteId;

              return (
                <li
                  key={`${contacto.estudianteId}:${contacto.tutorId}`}
                  className="shrink-0 lg:shrink"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActivo(contacto);
                      setMensajes([]);
                      setTexto("");
                      setError(null);
                    }}
                    disabled={cargando}
                    aria-current={seleccionado ? "true" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-lg p-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] ${
                      seleccionado
                        ? "bg-[var(--surface-2)]"
                        : "hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <Avatar size="sm" className="shrink-0">
                      <Avatar.Fallback>
                        {iniciales(contacto.nombre)}
                      </Avatar.Fallback>
                    </Avatar>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {contacto.nombre}
                      </span>
                      <span className="block truncate text-xs text-[var(--muted)]">
                        {contacto.motivo}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      <Card className="min-w-0 flex-1">
        {activo ? (
          <>
            <Card.Header>
              <Card.Title className="text-base">{activo.nombre}</Card.Title>
              <Card.Description>{activo.titulo}</Card.Description>
            </Card.Header>

            <Card.Content>
              <div className="flex max-h-96 min-h-48 flex-col gap-3 overflow-y-auto">
                {mensajes.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[var(--muted)]">
                    {cargando
                      ? "Cargando…"
                      : "Todavía no se han escrito. Empieza tú."}
                  </p>
                ) : (
                  mensajes.map((mensaje) => {
                    const mio = mensaje.autorId === usuarioId;

                    return (
                      <div
                        key={mensaje.id}
                        className={mio ? "flex justify-end" : "flex"}
                      >
                        <p
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                            mio
                              ? "rounded-br-sm bg-[var(--accent-soft)] text-[var(--accent-on-soft)]"
                              : "rounded-bl-sm bg-[var(--surface-2)]"
                          }`}
                        >
                          {mensaje.texto}
                        </p>
                      </div>
                    );
                  })
                )}
                <div ref={finRef} />
              </div>

              {error ? (
                <Alert status="danger" className="mt-3">
                  <Alert.Content>
                    <Alert.Description>{error}</Alert.Description>
                  </Alert.Content>
                </Alert>
              ) : null}
            </Card.Content>

            <Card.Footer className="flex flex-col gap-2 border-t border-[var(--border)] pt-4">
              <TextField
                value={texto}
                onChange={setTexto}
                isDisabled={cargando}
                className="w-full"
              >
                <Label className="sr-only">
                  Tu mensaje para {activo.nombre}
                </Label>
                <TextArea
                  rows={2}
                  maxLength={1000}
                  placeholder={`Escríbele a ${activo.nombre.split(" ")[0]}…`}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" && !evento.shiftKey) {
                      evento.preventDefault();
                      enviar();
                    }
                  }}
                />
              </TextField>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--muted)]">
                  Enter para enviar.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  isDisabled={cargando || !texto.trim()}
                  onPress={enviar}
                >
                  Enviar
                </Button>
              </div>
            </Card.Footer>
          </>
        ) : null}
      </Card>
    </div>
  );
}
