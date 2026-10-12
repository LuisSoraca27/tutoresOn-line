"use client";

import { useState } from "react";
import { Button, Description, Input, Label, TextField } from "@heroui/react";
import { IconoOjo, IconoOjoTachado } from "@/components/ui/iconos";

/** Las tres condiciones que valida `acciones.ts` en el servidor (F1.12). */
export const REQUISITOS_CLAVE = [
  { etiqueta: "8 caracteres", cumple: (clave: string) => clave.length >= 8 },
  { etiqueta: "una letra", cumple: (clave: string) => /[a-zA-Z]/.test(clave) },
  { etiqueta: "un número", cumple: (clave: string) => /[0-9]/.test(clave) },
];

export function claveValida(clave: string): boolean {
  return REQUISITOS_CLAVE.every((requisito) => requisito.cumple(clave));
}

/**
 * Campo de contraseña (F1.4, F1.12).
 *
 * Muestra los requisitos como lista que se va tachando en vez de un mensaje
 * de error después de enviar: el usuario ve qué le falta mientras escribe y
 * no descubre la regla al fallar. Las mismas tres condiciones las revalida
 * el servidor, que es la comprobación que de verdad cuenta.
 */
export function CampoClave({
  valor,
  onCambio,
  etiqueta = "Contraseña",
  autoComplete = "new-password",
  mostrarRequisitos = true,
  descripcion,
}: {
  valor: string;
  onCambio: (valor: string) => void;
  etiqueta?: string;
  autoComplete?: "new-password" | "current-password";
  mostrarRequisitos?: boolean;
  descripcion?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      value={valor}
      onChange={onCambio}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      isRequired
    >
      <Label>{etiqueta}</Label>

      {/* El `div` que sostiene el botón del ojo saca al campo del flujo del
          `TextField`, que es quien estira sus hijos: sin `w-full` el input se
          queda en su ancho por defecto y aparece más corto que el del correo.
          El `pr-11` reserva el sitio del botón para que el texto no pase por
          debajo. */}
      <div className="relative">
        <Input placeholder="••••••••" className="w-full pr-11" />
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          aria-label={visible ? "Ocultar la contraseña" : "Mostrar la contraseña"}
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onPress={() => setVisible(!visible)}
        >
          {visible ? <IconoOjoTachado /> : <IconoOjo />}
        </Button>
      </div>

      {descripcion ? <Description>{descripcion}</Description> : null}

      {mostrarRequisitos ? (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs">
          {REQUISITOS_CLAVE.map((requisito) => {
            const listo = requisito.cumple(valor);
            return (
              <li
                key={requisito.etiqueta}
                className={
                  listo ? "text-[var(--success)]" : "text-[var(--muted)]"
                }
              >
                <span aria-hidden className="pr-1">
                  {listo ? "✓" : "•"}
                </span>
                {requisito.etiqueta}
                <span className="sr-only">{listo ? " — cumplido" : " — falta"}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </TextField>
  );
}
