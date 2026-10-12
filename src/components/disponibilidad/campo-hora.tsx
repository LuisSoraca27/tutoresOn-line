"use client";

import { Label, TimeField } from "@heroui/react";
import { parseTime, type Time } from "@internationalized/date";

/**
 * Envoltorio sobre el TimeField de HeroUI que habla en "HH:mm".
 *
 * El componente de la librería trabaja con objetos `Time` de
 * `@internationalized/date`; el dominio guarda texto plano, que es lo que
 * viajará a PostgreSQL. Esta es la única frontera donde se traduce, para
 * que ningún otro archivo tenga que saber de ese tipo.
 */
export function CampoHora({
  valor,
  onCambio,
  etiqueta,
  ocultarEtiqueta,
}: {
  valor: string;
  onCambio: (nuevo: string) => void;
  etiqueta: string;
  ocultarEtiqueta?: boolean;
}) {
  function alCambiar(hora: Time | null) {
    if (!hora) return;
    const h = String(hora.hour).padStart(2, "0");
    const m = String(hora.minute).padStart(2, "0");
    onCambio(`${h}:${m}`);
  }

  return (
    <TimeField value={parseTime(valor)} onChange={alCambiar} aria-label={etiqueta}>
      <Label className={ocultarEtiqueta ? "sr-only" : undefined}>{etiqueta}</Label>
      <TimeField.Group>
        <TimeField.Input>
          {(segmento) => <TimeField.Segment segment={segmento} />}
        </TimeField.Input>
      </TimeField.Group>
    </TimeField>
  );
}
