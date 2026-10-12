"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Card,
  Description,
  Label,
  Separator,
  TextArea,
  TextField,
} from "@heroui/react";
import { SelectorEstrellas } from "@/components/resenas/selector-estrellas";
import { publicarResena } from "@/features/resenas/acciones";
import { CRITERIOS } from "@/features/resenas";

const MINIMO = 10;

/**
 * Calificar al tutor tras la sesión (F8.1, F8.2).
 *
 * El puntaje general es obligatorio; el desglose por criterios es opcional
 * porque pedir cuatro decisiones seguidas hace que la gente abandone, y una
 * reseña de tres estrellas escrita vale más que un formulario perfecto vacío.
 */
export function FormularioResena({
  reservaId,
  estudianteId,
  tutor,
}: {
  reservaId: string;
  estudianteId: string;
  tutor: string;
}) {
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState("");
  const [detallar, setDetallar] = useState(false);
  const [criterios, setCriterios] = useState({ puntualidad: 0, claridad: 0, dominio: 0 });
  const [error, setError] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  const completos = Object.values(criterios).every((valor) => valor > 0);
  const faltan = MINIMO - comentario.trim().length;

  function publicar() {
    setError(null);
    iniciar(async () => {
      const resultado = await publicarResena({
        reservaId,
        estudianteId,
        puntaje,
        comentario,
        criterios: detallar && completos ? criterios : undefined,
      });

      if (!resultado.ok) setError(resultado.mensaje);
    });
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">¿Cómo te fue con {tutor}?</Card.Title>
        <Card.Description>
          Tu reseña es pública y ayuda a decidir a quien busque el mismo tema.
        </Card.Description>
      </Card.Header>

      <Card.Content className="flex flex-col gap-6">
        <SelectorEstrellas
          valor={puntaje}
          onCambio={setPuntaje}
          etiqueta="Calificación general"
        />

        <TextField value={comentario} onChange={setComentario} isRequired>
          <Label>Tu comentario</Label>
          <TextArea
            rows={4}
            placeholder="Qué te sirvió, cómo explica, si volverías a tomar clase."
          />
          <Description>
            {faltan > 0
              ? `Escribe al menos ${faltan} ${faltan === 1 ? "carácter" : "caracteres"} más.`
              : "Listo para publicar."}
          </Description>
        </TextField>

        {detallar ? (
          <>
            <Separator />
            <div className="flex flex-col gap-4">
              {CRITERIOS.map((criterio) => (
                <SelectorEstrellas
                  key={criterio.id}
                  compacto
                  valor={criterios[criterio.id]}
                  onCambio={(valor) => setCriterios({ ...criterios, [criterio.id]: valor })}
                  etiqueta={criterio.etiqueta}
                />
              ))}
              {!completos ? (
                <p className="text-xs text-[var(--muted)]">
                  Califica los tres para que el desglose se guarde; si no, se publica solo la
                  calificación general.
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <Button variant="ghost" size="sm" className="self-start" onPress={() => setDetallar(true)}>
            Calificar por separado puntualidad, claridad y dominio
          </Button>
        )}

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
          isDisabled={enviando || puntaje === 0 || faltan > 0}
          onPress={publicar}
        >
          {enviando ? "Publicando…" : "Publicar reseña"}
        </Button>
      </Card.Footer>
    </Card>
  );
}
