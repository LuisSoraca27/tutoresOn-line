import { almacen, siguienteId } from "@/mocks/almacen";
import { demora } from "@/mocks/demora";
import type { ResenasRepo } from "./resenas.repo";
import type { NuevaResena, Resena } from "./resena.types";

export class ResenasMockRepo implements ResenasRepo {
  async crear(nueva: NuevaResena): Promise<Resena> {
    await demora(350);

    // Una sesión, una reseña: si no, quien insiste pesa más que quien no.
    const existente = almacen.resenas.find((resena) => resena.reservaId === nueva.reservaId);
    if (existente) throw new Error("Esta sesión ya tiene una reseña.");

    const resena: Resena = {
      ...nueva,
      id: siguienteId("RES"),
      creadaEn: new Date().toISOString(),
    };

    almacen.resenas.push(resena);
    return resena;
  }

  async deTutor(tutorId: string): Promise<Resena[]> {
    await demora(200);
    return almacen.resenas
      .filter((resena) => resena.tutorId === tutorId)
      .sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
  }

  async deReserva(reservaId: string): Promise<Resena | null> {
    await demora(120);
    return almacen.resenas.find((resena) => resena.reservaId === reservaId) ?? null;
  }

  async responder(id: string, texto: string): Promise<Resena> {
    await demora(250);

    const resena = almacen.resenas.find((candidata) => candidata.id === id);
    if (!resena) throw new Error("No encontramos esa reseña.");

    resena.respuestaTutor = texto;
    return resena;
  }

  async reportar(id: string, motivo: string): Promise<Resena> {
    await demora(250);

    const resena = almacen.resenas.find((candidata) => candidata.id === id);
    if (!resena) throw new Error("No encontramos esa reseña.");

    // Una sola denuncia por reseña: acumularlas no aporta nada a quien la
    // revise y permitiría hundir a un tutor a fuerza de repetir.
    if (!resena.reporte) {
      resena.reporte = { motivo, reportadaEn: new Date().toISOString() };
    }

    return resena;
  }
}
