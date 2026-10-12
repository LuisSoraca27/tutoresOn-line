import { Chip } from "@heroui/react";
import { ETIQUETA_ESTADO, type EstadoReserva } from "@/features/reservas";

/**
 * El estado de una reserva se lee de un vistazo: el color hace la mitad del
 * trabajo y el texto confirma. Se usará igual en el panel del estudiante,
 * en la bandeja del tutor y en el historial.
 */
const COLOR: Record<EstadoReserva, "accent" | "success" | "danger" | "warning" | "default"> = {
  pendiente: "warning",
  aceptada: "success",
  rechazada: "danger",
  "en-curso": "accent",
  finalizada: "default",
  cancelada: "default",
};

export function ChipEstado({ estado }: { estado: EstadoReserva }) {
  return (
    <Chip size="sm" color={COLOR[estado]} variant="soft">
      {ETIQUETA_ESTADO[estado]}
    </Chip>
  );
}
