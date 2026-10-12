import type { Usuario } from "@/features/auth/auth.types";

/**
 * Cuentas de demostración.
 *
 * Las dos usan la misma contraseña y están documentadas en `CUENTAS-DEMO.md`:
 * fuera de la interfaz a propósito, porque una pantalla de login que lista
 * credenciales enseña un hábito que no queremos y no se parece a lo que verá
 * quien use la plataforma. Cuando exista el backend, esto se siembra con un
 * script y las claves van con hash.
 */
export const CLAVE_DEMO = "demo1234";

export interface CuentaDemo {
  usuario: Usuario;
  clave: string;
}

const AHORA = new Date().toISOString();

export const CUENTAS: CuentaDemo[] = [
  {
    clave: CLAVE_DEMO,
    usuario: {
      id: "e-001",
      nombre: "Sara Betancur",
      correo: "sara@ejemplo.co",
      rol: "estudiante",
      telefono: "+57 300 111 2233",
      ciudadId: "bogota",
      nivelId: "universitario",
      creadoEn: AHORA,
    },
  },
  {
    clave: CLAVE_DEMO,
    usuario: {
      id: "t-001",
      nombre: "Mariana Restrepo",
      correo: "mariana@ejemplo.co",
      rol: "tutor",
      telefono: "+57 301 444 5566",
      ciudadId: "medellin",
      creadoEn: AHORA,
    },
  },
];
