"use client";
import { Button } from "@heroui/react";
import type { SesionLiquidable } from "@/features/ingresos/reales";
import { celdaCsv, descargar } from "@/lib/descargas";

export function DescargarIngresos({
  reservas,
  periodo,
}: {
  reservas: SesionLiquidable[];
  periodo: string;
}) {
  return (
    <Button
      variant="outline"
      isDisabled={!reservas.length}
      onPress={() => {
        const filas = [
          ["Código", "Fecha", "Estudiante", "Materia", "Minutos", "Valor COP"],
          ...reservas.map((reserva) => [
            reserva.id,
            reserva.fecha,
            reserva.estudianteNombre,
            reserva.materiaNombre,
            reserva.duracionMinutos,
            reserva.precio,
          ]),
        ];
        descargar(
          `ingresos-${periodo}.csv`,
          "\uFEFF" +
            filas.map((fila) => fila.map(celdaCsv).join(";")).join("\r\n"),
          "text/csv;charset=utf-8",
        );
      }}
    >
      Descargar detalle CSV
    </Button>
  );
}

export function DescargarComprobante({ reserva }: { reserva: SesionLiquidable }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={() =>
        descargar(
          `registro-${reserva.id}.txt`,
          `TutoresOn-Line · Registro de sesión\nCódigo: ${reserva.id}\nFecha: ${reserva.fecha}\nHora: ${reserva.horaInicio} a ${reserva.horaFin}\nTutor: ${reserva.tutorNombre}\nEstudiante: ${reserva.estudianteNombre}\nMateria: ${reserva.materiaNombre}\nDuración: ${reserva.duracionMinutos} minutos\nValor: ${reserva.precio} COP\n\nRegistro de tutoría finalizada. No acredita un pago ni constituye una factura.\n`,
          "text/plain;charset=utf-8",
        )
      }
    >
      Descargar registro
    </Button>
  );
}
