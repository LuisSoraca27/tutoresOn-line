import type { Balance, Retiro } from "./ingresos.types";

export interface IngresosRepo {
  balance(tutorId: string): Promise<Balance>;
  retiros(tutorId: string): Promise<Retiro[]>;
  solicitar(tutorId: string, monto: number, destino: string): Promise<Retiro>;
  cancelar(tutorId: string, retiroId: string): Promise<void>;
}
