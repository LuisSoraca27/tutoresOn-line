import { almacen, siguienteId } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { IngresosRepo } from "./ingresos.repo";

function saldo(tutorId: string) {
  const generado = almacen.reservas
    .filter(
      (reserva) =>
        reserva.tutorId === tutorId &&
        reserva.estado === "finalizada" &&
        reserva.cierre?.asistio !== false,
    )
    .reduce((total, reserva) => total + reserva.precio, 0);
  const comprometido = almacen.retiros
    .filter(
      (retiro) => retiro.tutorId === tutorId && retiro.estado !== "cancelado",
    )
    .reduce((total, retiro) => total + retiro.monto, 0);
  return {
    generado,
    comprometido,
    disponible: Math.max(0, generado - comprometido),
  };
}

export class IngresosMockRepo implements IngresosRepo {
  async balance(tutorId: string) {
    return saldo(tutorId);
  }
  async retiros(tutorId: string) {
    return almacen.retiros
      .filter((retiro) => retiro.tutorId === tutorId)
      .sort((a, b) => b.solicitadoEn.localeCompare(a.solicitadoEn));
  }
  async solicitar(tutorId: string, monto: number, destino: string) {
    await demora(250);
    // Comprobación y escritura sin un await intermedio para evitar sobregiros.
    if (
      !Number.isSafeInteger(monto) ||
      monto <= 0 ||
      monto > saldo(tutorId).disponible
    )
      throw new Error("El monto supera tu saldo disponible o no es válido.");
    const retiro = {
      id: siguienteId("RET"),
      tutorId,
      monto,
      destino,
      estado: "solicitado" as const,
      solicitadoEn: new Date().toISOString(),
    };
    almacen.retiros.push(retiro);
    return retiro;
  }
  async cancelar(tutorId: string, retiroId: string) {
    await demora(150);
    const retiro = almacen.retiros.find(
      (item) => item.id === retiroId && item.tutorId === tutorId,
    );
    if (!retiro || retiro.estado !== "solicitado")
      throw new Error("Solo puedes cancelar un retiro que siga solicitado.");
    retiro.estado = "cancelado";
  }
}
