import test from "node:test";
import assert from "node:assert/strict";
import { proximaReserva } from "../src/features/reservas/proxima.ts";

test("elige la reserva activa más cercana en hora de Bogotá sin depender del orden", () => {
  const ahora = new Date("2026-11-03T15:00:00Z");
  const reserva = (id, inicio, fin, estado) => ({ id, inicio, fin, estado });
  const reservas = [
    reserva("lejana", "2026-11-05T10:00", "2026-11-05T11:00", "aceptada"),
    reserva("rechazada", "2026-11-03T10:10", "2026-11-03T11:10", "rechazada"),
    reserva("pasada", "2026-11-03T08:00", "2026-11-03T09:00", "aceptada"),
    reserva("cercana", "2026-11-03T10:30", "2026-11-03T11:30", "pendiente"),
  ];
  assert.equal(proximaReserva(reservas, ahora)?.id, "cercana");
  assert.equal(proximaReserva([reserva("curso", "2026-11-03T09:30", "2026-11-03T10:30", "en-curso")], ahora)?.id, "curso");
  assert.equal(proximaReserva([reservas[1], reservas[2]], ahora), undefined);
});
