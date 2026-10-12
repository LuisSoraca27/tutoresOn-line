import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const cargarModulo = createRequire(import.meta.url);
const directorio = path.dirname(fileURLToPath(import.meta.url));

// Ejecuta los repositorios TypeScript con el alias del proyecto, sin React
// ni un servidor HTTP. El adaptador existe solo en este proceso de pruebas.
const resolver = Module._resolveFilename;
Module._resolveFilename = function (id, ...args) {
  return resolver.call(
    this,
    id.startsWith("@/") ? path.resolve(directorio, "../src", id.slice(2)) : id,
    ...args,
  );
};
cargarModulo.extensions[".ts"] = function (modulo, archivo) {
  const fuente = fs.readFileSync(archivo, "utf8");
  modulo._compile(
    ts.transpileModule(fuente, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    archivo,
  );
};

const { almacen } = cargarModulo("../src/mocks/almacen.ts");
const { ReservasMockRepo } = cargarModulo(
  "../src/features/reservas/reservas.mock.ts",
);
const { IngresosMockRepo } = cargarModulo(
  "../src/features/ingresos/ingresos.mock.ts",
);
const { AuthMockRepo } = cargarModulo("../src/features/auth/auth.mock.ts");
const { ApuntesMockRepo } = cargarModulo(
  "../src/features/sesion/apuntes.mock.ts",
);
const { NotificacionesMockRepo } = cargarModulo(
  "../src/features/notificaciones/notificaciones.mock.ts",
);
const { celdaCsv } = cargarModulo("../src/lib/descargas.ts");
const cuentasIniciales = structuredClone(almacen.cuentas);
const reserva = (cambios = {}) => ({
  id: "PRUEBA",
  tutorId: "t-001",
  estudianteId: "e-001",
  materiaId: "calculo",
  nivelId: "universitario",
  modalidad: "virtual",
  inicio: "2030-01-10T10:00",
  fin: "2030-01-10T11:00",
  duracionMinutos: 60,
  precio: 50000,
  estado: "aceptada",
  creadaEn: "2026-01-01T00:00:00Z",
  ...cambios,
});

beforeEach(() => {
  almacen.reservas = [reserva()];
  almacen.retiros = [];
  almacen.notasSesion = [];
  almacen.recuperaciones = [];
  almacen.notificaciones = [];
  almacen.preferencias = [];
  almacen.cuentas = structuredClone(cuentasIniciales);
});

test("reprogramar conserva código y tarifa, libera el turno y vuelve a pedir aceptación", async () => {
  const repo = new ReservasMockRepo();
  const actualizada = await repo.reprogramar(
    "PRUEBA",
    "2030-01-11T12:00",
    "2030-01-11T13:00",
    "2030-01-10T10:00",
  );
  assert.equal(actualizada.id, "PRUEBA");
  assert.equal(actualizada.precio, 50000);
  assert.equal(actualizada.estado, "pendiente");
  assert.equal(
    (await repo.ocupadas("t-001", "2030-01-10T00:00", "2030-01-10T23:59"))
      .length,
    0,
  );
});

test("dos reprogramaciones concurrentes no pueden ocupar el mismo turno", async () => {
  almacen.reservas.push(
    reserva({
      id: "OTRA",
      inicio: "2030-01-10T12:00",
      fin: "2030-01-10T13:00",
    }),
  );
  const repo = new ReservasMockRepo();
  const resultados = await Promise.allSettled([
    repo.reprogramar(
      "PRUEBA",
      "2030-01-11T12:00",
      "2030-01-11T13:00",
      "2030-01-10T10:00",
    ),
    repo.reprogramar(
      "OTRA",
      "2030-01-11T12:00",
      "2030-01-11T13:00",
      "2030-01-10T12:00",
    ),
  ]);
  assert.equal(
    resultados.filter((item) => item.status === "fulfilled").length,
    1,
  );
});

test("reprogramar rechaza una reserva finalizada o un horario anterior desactualizado", async () => {
  const repo = new ReservasMockRepo();
  await assert.rejects(
    repo.reprogramar(
      "PRUEBA",
      "2030-01-11T12:00",
      "2030-01-11T13:00",
      "2030-01-09T10:00",
    ),
  );
  almacen.reservas[0].estado = "finalizada";
  await assert.rejects(
    repo.reprogramar(
      "PRUEBA",
      "2030-01-11T12:00",
      "2030-01-11T13:00",
      "2030-01-10T10:00",
    ),
  );
});

test("el balance excluye sesiones sin asistencia y retiros ajenos", async () => {
  almacen.reservas = [
    reserva({ estado: "finalizada" }),
    reserva({
      id: "FALTA",
      estado: "finalizada",
      cierre: { asistio: false, duracionReal: 0 },
    }),
  ];
  almacen.retiros.push({ tutorId: "otro", monto: 40000, estado: "solicitado" });
  assert.deepEqual(await new IngresosMockRepo().balance("t-001"), {
    generado: 50000,
    comprometido: 0,
    disponible: 50000,
  });
});

test("retiros concurrentes no sobregiran y cancelar recupera el saldo", async () => {
  almacen.reservas[0].estado = "finalizada";
  const repo = new IngresosMockRepo();
  const resultados = await Promise.allSettled([
    repo.solicitar("t-001", 40000, "Banco demo"),
    repo.solicitar("t-001", 40000, "Banco demo"),
  ]);
  assert.equal(
    resultados.filter((item) => item.status === "fulfilled").length,
    1,
  );
  assert.equal((await repo.balance("t-001")).disponible, 10000);
  await assert.rejects(repo.cancelar("otro", almacen.retiros[0].id));
  await repo.cancelar("t-001", almacen.retiros[0].id);
  assert.equal((await repo.balance("t-001")).disponible, 50000);
  await assert.rejects(repo.cancelar("t-001", almacen.retiros[0].id));
});

test("retiros rechazan montos negativos, fracciones y valores no finitos", async () => {
  const repo = new IngresosMockRepo();
  for (const monto of [-1, 0, 1.5, NaN, Infinity])
    await assert.rejects(repo.solicitar("t-001", monto, "Banco demo"));
});

test("recuperación cambia la clave y consume el enlace una sola vez", async () => {
  const repo = new AuthMockRepo();
  const { tokenDemo } = await repo.solicitarRecuperacion(" Sara@Ejemplo.CO ");
  assert.ok(tokenDemo);
  await repo.restablecerClave(tokenDemo, "prueba9876");
  await assert.rejects(repo.restablecerClave(tokenDemo, "otra9876"));
  assert.ok(
    await repo.iniciarSesion({
      correo: "sara@ejemplo.co",
      clave: "prueba9876",
    }),
  );
  assert.equal(
    await repo.iniciarSesion({ correo: "sara@ejemplo.co", clave: "demo1234" }),
    null,
  );
});

test("recuperación rechaza enlaces vencidos e invalida el anterior al pedir otro", async () => {
  const repo = new AuthMockRepo();
  const primero = await repo.solicitarRecuperacion("sara@ejemplo.co");
  const segundo = await repo.solicitarRecuperacion("sara@ejemplo.co");
  await assert.rejects(repo.restablecerClave(primero.tokenDemo, "prueba9876"));
  almacen.recuperaciones[0].venceEn = 0;
  await assert.rejects(repo.restablecerClave(segundo.tokenDemo, "prueba9876"));
  assert.deepEqual(
    await repo.solicitarRecuperacion("inexistente@ejemplo.co"),
    {},
  );
});

test("apuntes permanecen separados por participante y por sesión", async () => {
  const repo = new ApuntesMockRepo();
  await repo.guardar("PRUEBA", "e-001", "Mis ejercicios");
  assert.equal(await repo.obtener("PRUEBA", "t-001"), "");
  assert.equal(await repo.obtener("OTRA", "e-001"), "");
  await repo.guardar("PRUEBA", "e-001", "Corrección");
  assert.equal(await repo.obtener("PRUEBA", "e-001"), "Corrección");
});

test("entregas respetan preferencias y no se presentan como envíos reales", async () => {
  almacen.preferencias.push({
    usuarioId: "e-001",
    canales: {
      "reserva-confirmada": ["sms", "whatsapp"],
      "cambio-de-estado": [],
      "resumen-sesion": [],
      "recordatorio-sesion": [],
    },
  });
  const repo = new NotificacionesMockRepo();
  const aviso = await repo.crear({
    destinatarioId: "e-001",
    tipo: "reserva-aceptada",
    titulo: "Confirmada",
    detalle: "Prueba",
    enlace: "/estudiante/reservas",
  });
  assert.deepEqual(
    aviso.entregas.map(({ canal, estado }) => ({ canal, estado })),
    [
      { canal: "sms", estado: "simulado" },
      { canal: "whatsapp", estado: "simulado" },
    ],
  );
  const cancelada = await repo.crear({
    destinatarioId: "e-001",
    tipo: "reserva-cancelada",
    titulo: "Cancelada",
    detalle: "Prueba",
    enlace: "/estudiante/reservas",
  });
  assert.deepEqual(cancelada.entregas, []);
  assert.equal((await repo.de("t-001")).length, 0);
});

test("CSV conserva comillas y neutraliza fórmulas aportadas por usuarios", () => {
  assert.equal(celdaCsv('Sara "S"'), '"Sara ""S"""');
  assert.equal(celdaCsv(" =1+1"), '"\' =1+1"');
  assert.equal(celdaCsv(50000), '"50000"');
});
