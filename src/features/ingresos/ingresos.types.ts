export interface Retiro {
  id: string;
  tutorId: string;
  monto: number;
  destino: string;
  estado: "solicitado" | "pagado" | "cancelado";
  solicitadoEn: string;
}

export interface Balance {
  generado: number;
  comprometido: number;
  disponible: number;
}
