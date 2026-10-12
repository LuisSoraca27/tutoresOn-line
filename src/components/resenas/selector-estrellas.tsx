"use client";

import { useState } from "react";
import { Label, Radio, RadioGroup } from "@heroui/react";
import { IconoEstrella } from "@/components/ui/iconos";

const TEXTOS = ["", "Muy mal", "Mal", "Aceptable", "Bien", "Excelente"];

/**
 * Estrellas seleccionables (F8.1).
 *
 * HeroUI v3 no trae un componente de calificación, así que se construye sobre
 * un RadioGroup: los radios de verdad están ahí, ocultos, y encima se pintan
 * las estrellas. Así funciona con teclado y con lector de pantalla sin tener
 * que inventar el manejo del foco.
 */
export function SelectorEstrellas({
  valor,
  onCambio,
  etiqueta,
  compacto,
}: {
  valor: number;
  onCambio: (nuevo: number) => void;
  etiqueta: string;
  compacto?: boolean;
}) {
  const [encima, setEncima] = useState(0);
  const pintadas = encima || valor;
  const tamano = compacto ? "size-5" : "size-8";

  return (
    <RadioGroup
      value={valor ? String(valor) : ""}
      onChange={(nuevo) => onCambio(Number(nuevo))}
      orientation="horizontal"
    >
      <Label className={compacto ? "text-sm" : undefined}>{etiqueta}</Label>

      <div className="flex items-center gap-2" onMouseLeave={() => setEncima(0)}>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((posicion) => (
            <Radio
              key={posicion}
              value={String(posicion)}
              className="cursor-pointer rounded p-0.5"
              onPointerEnter={() => setEncima(posicion)}
            >
              <Radio.Content>
                <span className="sr-only">
                  {posicion} {posicion === 1 ? "estrella" : "estrellas"}
                </span>
                <IconoEstrella
                  className={`${tamano} transition-colors ${
                    posicion <= pintadas ? "text-[var(--warning)]" : "text-[var(--border)]"
                  }`}
                  fill={posicion <= pintadas ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </Radio.Content>
            </Radio>
          ))}
        </div>

        {pintadas > 0 ? (
          <span className={`text-[var(--muted)] ${compacto ? "text-xs" : "text-sm"}`}>
            {TEXTOS[pintadas]}
          </span>
        ) : null}
      </div>
    </RadioGroup>
  );
}
