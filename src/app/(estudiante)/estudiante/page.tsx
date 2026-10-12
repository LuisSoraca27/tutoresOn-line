import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { TarjetaAcceso } from "@/components/layout/tarjeta-acceso";
import { TarjetaProximaSesion } from "@/components/reservas/tarjeta-proxima-sesion";
import { TarjetaTutor } from "@/components/tutores/tarjeta-tutor";
import { catalogosRepo } from "@/features/catalogos";
import { reservasRepo } from "@/features/reservas";
import { exigirUsuario } from "@/features/auth/sesion";
import { tutoresRepo } from "@/features/tutores";
import { aIsoFechaHora } from "@/features/disponibilidad/calcular-turnos";

export const metadata: Metadata = { title: "Mi panel" };
/** Datos de una persona concreta: no se prerenderizan. */
export const dynamic = "force-dynamic";


export default async function PanelEstudiante() {
  const yo = await exigirUsuario("estudiante");

  const [reservas, recomendados, materias, ciudades] = await Promise.all([
    reservasRepo.deEstudiante(yo.id),
    tutoresRepo.destacados(3),
    catalogosRepo.materias(),
    catalogosRepo.ciudades(),
  ]);

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreCiudad = new Map(ciudades.map((c) => [c.id, c.nombre]));

  // La próxima es la primera que todavía no ha empezado y sigue viva.
  const ahora = aIsoFechaHora(new Date());
  const proxima = reservas.find(
    (reserva) =>
      reserva.inicio >= ahora &&
      (reserva.estado === "pendiente" || reserva.estado === "aceptada"),
  );

  const tutorDeLaProxima = proxima
    ? await tutoresRepo.obtener(proxima.tutorId)
    : null;

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${yo.nombre.split(" ")[0]}`}
        descripcion="Tu próxima sesión y los tutores que te pueden servir."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {proxima && tutorDeLaProxima ? (
          <TarjetaProximaSesion
            reserva={proxima}
            tutor={tutorDeLaProxima}
            materia={`${nombreMateria.get(proxima.materiaId) ?? proxima.materiaId} · ${proxima.duracionMinutos} min`}
          />
        ) : (
          <TarjetaAcceso
            titulo="Sin sesiones agendadas"
            descripcion="Cuando reserves con un tutor, la próxima sesión aparecerá aquí con el acceso a la videollamada."
            href="/buscar"
            accion="Buscar tutor y reservar"
          />
        )}

        <TarjetaAcceso
          titulo="Mis reservas"
          descripcion="Próximas, pasadas y canceladas, con su estado y las acciones de cada una."
          href="/estudiante/reservas"
          accion={`Ver mis ${reservas.length} reservas`}
        />
      </div>

      <section className="pt-10">
        <h2 className="titulo text-xl">Tutores recomendados</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Explora sus materias, tarifas y horarios para encontrar a quien necesitas.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recomendados.map((tutor) => (
            <TarjetaTutor
              key={tutor.id}
              tutor={tutor}
              materias={tutor.materias.map((m) => nombreMateria.get(m.materiaId) ?? m.materiaId)}
              ciudad={tutor.ciudadId ? nombreCiudad.get(tutor.ciudadId) : undefined}
            />
          ))}
        </div>
      </section>
    </>
  );
}
