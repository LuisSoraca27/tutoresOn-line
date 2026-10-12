import { pedir } from "@/lib/http";
import type { IngresosRepo } from "./ingresos.repo";
import type { Balance, Retiro } from "./ingresos.types";

export class IngresosHttpRepo implements IngresosRepo {
  balance(tutorId: string) {
    return pedir<Balance>(`/tutores/${tutorId}/balance`);
  }
  retiros(tutorId: string) {
    return pedir<Retiro[]>(`/tutores/${tutorId}/retiros`);
  }
  solicitar(tutorId: string, monto: number, destino: string) {
    return pedir<Retiro>(`/tutores/${tutorId}/retiros`, {
      method: "POST",
      body: { monto, destino },
    });
  }
  async cancelar(tutorId: string, retiroId: string) {
    await pedir<void>(`/tutores/${tutorId}/retiros/${retiroId}`, {
      method: "PATCH",
      body: { estado: "cancelado" },
    });
  }
}
