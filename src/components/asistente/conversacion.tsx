"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Alert, Avatar, Button, Card, Chip, Label, TextArea, TextField } from "@heroui/react";
import { TarjetaTutor } from "@/components/tutores/tarjeta-tutor";
import { IconoChispa } from "@/components/ui/iconos";
import { preguntarAlAsistente, type TurnoAsistente } from "@/features/asistente/acciones";
import type { Mensaje } from "@/features/asistente";
import type { Tutor } from "@/features/tutores";

const EJEMPLOS = [
  "Tengo parcial de integrales el viernes y me trabo con integración por partes",
  "Necesito que alguien le refuerce matemáticas a mi hijo de quinto de primaria",
  "Quiero mejorar mi inglés hablado para una entrevista de trabajo",
  "Se me complica SQL en la universidad, algo presencial en Medellín",
];

interface Turno extends Mensaje {
  tutores?: Tutor[];
  nombresMateria?: Record<string, string>;
  nombresCiudad?: Record<string, string>;
  entendido?: { campo: string; valor: string }[];
}

let contador = 0;
const nuevoId = () => `m-${(contador += 1)}`;

/**
 * Conversación con el asistente (F10.1, F10.2).
 *
 * La respuesta aparece palabra por palabra (F10.6). No es decoración: da
 * señal de que el sistema está trabajando y deja leer mientras se completa,
 * que es como se comporta un modelo de verdad.
 */
export function Conversacion() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [entrada, setEntrada] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pensando, iniciar] = useTransition();
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turnos]);

  function preguntar(texto: string) {
    const consulta = texto.trim();
    if (!consulta) return;

    setError(null);
    setEntrada("");

    const mio: Turno = { id: nuevoId(), autor: "estudiante", texto: consulta };
    const historial = turnos.map(({ id, autor, texto: t }) => ({ id, autor, texto: t }));

    setTurnos((previos) => [...previos, mio]);

    iniciar(async () => {
      try {
        const turno: TurnoAsistente = await preguntarAlAsistente(consulta, historial);

        setTurnos((previos) => [
          ...previos,
          {
            id: nuevoId(),
            autor: "asistente",
            texto: turno.respuesta.texto,
            tutores: turno.tutores,
            nombresMateria: turno.nombresMateria,
            nombresCiudad: turno.nombresCiudad,
            entendido: turno.respuesta.entendido,
            seguimientos: turno.respuesta.seguimientos,
          },
        ]);
      } catch {
        setError("No pudimos consultar al asistente. Vuelve a intentarlo en un momento.");
      }
    });
  }

  const ultimo = turnos.at(-1);
  const seguimientos = ultimo?.autor === "asistente" ? (ultimo.seguimientos ?? []) : [];

  return (
    <div className="flex flex-col gap-5">
      {turnos.length === 0 ? (
        <Card>
          <Card.Content className="py-8 text-center">
            <IconoChispa className="mx-auto size-8 text-[var(--accent)]" />
            <h2 className="titulo pt-3 text-xl">Cuéntame qué se te está atravesando</h2>
            <p className="mx-auto max-w-[52ch] pt-2 text-sm text-[var(--muted)]">
              Escríbelo con tus palabras. No hace falta que sepas cómo se llama la materia: si me
              dices el tema, yo la deduzco y te busco quién la dicta.
            </p>

            <div className="flex flex-col items-center gap-2 pt-6">
              {EJEMPLOS.map((ejemplo) => (
                <Button
                  key={ejemplo}
                  variant="outline"
                  size="sm"
                  className="max-w-full"
                  onPress={() => preguntar(ejemplo)}
                >
                  <span className="truncate">{ejemplo}</span>
                </Button>
              ))}
            </div>
          </Card.Content>
        </Card>
      ) : (
        <ul className="flex flex-col gap-5">
          {turnos.map((turno) => (
            <li key={turno.id}>
              {turno.autor === "estudiante" ? (
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--accent-soft)] px-4 py-2.5 text-[var(--accent-on-soft)]">
                    {turno.texto}
                  </p>
                </div>
              ) : (
                <RespuestaAsistente turno={turno} />
              )}
            </li>
          ))}
          {pensando ? <Pensando /> : null}
        </ul>
      )}

      <div ref={finRef} />

      {error ? (
        <Alert status="danger">
          <Alert.Content>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      {seguimientos.length > 0 && !pensando ? (
        <div className="flex flex-wrap gap-2">
          {seguimientos.map((sugerencia) => (
            <Button
              key={sugerencia}
              variant="outline"
              size="sm"
              onPress={() => preguntar(sugerencia)}
            >
              {sugerencia}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="sticky bottom-4 flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
        <TextField value={entrada} onChange={setEntrada}>
          <Label className="sr-only">Tu consulta</Label>
          <TextArea
            rows={2}
            placeholder="Escribe aquí lo que necesitas…"
            onKeyDown={(evento) => {
              if (evento.key === "Enter" && !evento.shiftKey) {
                evento.preventDefault();
                preguntar(entrada);
              }
            }}
          />
        </TextField>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">Enter para enviar, Mayús+Enter para salto.</p>
          <Button
            variant="primary"
            size="sm"
            isDisabled={pensando || !entrada.trim()}
            onPress={() => preguntar(entrada)}
          >
            {pensando ? "Pensando…" : "Preguntar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RespuestaAsistente({ turno }: { turno: Turno }) {
  const texto = useTextoProgresivo(turno.texto);

  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="shrink-0">
        <Avatar.Fallback>
          <IconoChispa className="size-4" />
        </Avatar.Fallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="leading-relaxed">{texto}</p>

        {turno.entendido && turno.entendido.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-3">
            {turno.entendido.map((pista) => (
              <Chip key={pista.campo} size="sm" variant="soft">
                {pista.campo}: {pista.valor}
              </Chip>
            ))}
          </div>
        ) : null}

        {turno.tutores && turno.tutores.length > 0 ? (
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            {turno.tutores.map((tutor) => (
              <TarjetaTutor
                key={tutor.id}
                tutor={tutor}
                materias={tutor.materias.map(
                  (m) => turno.nombresMateria?.[m.materiaId] ?? m.materiaId,
                )}
                ciudad={tutor.ciudadId ? turno.nombresCiudad?.[tutor.ciudadId] : undefined}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Pensando() {
  return (
    <li className="flex gap-3">
      <Avatar size="sm" className="shrink-0">
        <Avatar.Fallback>
          <IconoChispa className="size-4" />
        </Avatar.Fallback>
      </Avatar>
      <div className="flex items-center gap-1 pt-2" aria-label="El asistente está pensando">
        {[0, 1, 2].map((punto) => (
          <span
            key={punto}
            className="size-2 animate-pulse rounded-full bg-[var(--muted)]"
            style={{ animationDelay: `${punto * 150}ms` }}
          />
        ))}
      </div>
    </li>
  );
}

/**
 * Revela el texto palabra por palabra (F10.6).
 *
 * Respeta `prefers-reduced-motion`: quien pidió menos movimiento ve el texto
 * completo de una vez.
 */
function useTextoProgresivo(completo: string): string {
  const [visible, setVisible] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? completo
      : "",
  );

  useEffect(() => {
    if (visible === completo) return;

    const palabras = completo.split(" ");
    let indice = 0;

    const reloj = setInterval(() => {
      indice += 1;
      setVisible(palabras.slice(0, indice).join(" "));
      if (indice >= palabras.length) clearInterval(reloj);
    }, 28);

    return () => clearInterval(reloj);
    // Solo depende del texto final: no reinicia en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completo]);

  return visible;
}
