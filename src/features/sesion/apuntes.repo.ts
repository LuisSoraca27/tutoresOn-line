export interface ApuntesRepo {
  obtener(reservaId: string, usuarioId: string): Promise<string>;
  guardar(reservaId: string, usuarioId: string, texto: string): Promise<void>;
}
