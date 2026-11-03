import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { TarjetaAcceso } from "@/components/layout/tarjeta-acceso";
import { ChipEstado } from "@/components/reservas/chip-estado";
import { TarjetaTutor } from "@/components/tutores/tarjeta-tutor";
import { catalogosPublicosRepo as catalogosRepo } from "@/features/catalogos/publicos";
import { misReservas } from "@/features/reservas/reales";
import { exigirUsuario } from "@/features/auth/sesion";
import { tutoresPublicosRepo as tutoresRepo } from "@/features/tutores/publicos";
import { proximaReserva } from "@/features/reservas/proxima";

export const metadata: Metadata = { title: "Mi panel" };
/** Datos de una persona concreta: no se prerenderizan. */
export const dynamic = "force-dynamic";


export default async function PanelEstudiante() {
  const yo = await exigirUsuario("estudiante");

  const [reservas, recomendados, materias, ciudades] = await Promise.all([
    misReservas(),
    tutoresRepo.destacados(3),
    catalogosRepo.materias(),
    catalogosRepo.ciudades(),
  ]);

  const nombreMateria = new Map(materias.map((m) => [m.id, m.nombre]));
  const nombreCiudad = new Map(ciudades.map((c) => [c.id, c.nombre]));

  const proxima = proximaReserva(reservas);

  return (
    <>
      <EncabezadoPagina
        titulo={`Hola, ${yo.nombre.split(" ")[0]}`}
        descripcion="Tu próxima sesión y los tutores que te pueden servir."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {proxima ? (
          <Card>
            <Card.Header className="flex flex-row items-start justify-between gap-3">
              <div><Card.Title className="text-base">{proxima.tutorNombre}</Card.Title><Card.Description>{proxima.materiaNombre} · {proxima.nivelNombre}</Card.Description></div>
              <ChipEstado estado={proxima.estado} />
            </Card.Header>
            <Card.Content><p>{proxima.inicio.slice(0, 10)} · {proxima.inicio.slice(11, 16)} a {proxima.fin.slice(11, 16)}</p><p className="text-sm text-[var(--muted)]">Hora de Bogotá · {proxima.modalidad === "virtual" ? "Virtual" : "Presencial"}</p></Card.Content>
            <Card.Footer><Link className="text-sm text-[var(--accent)] underline underline-offset-4" href="/estudiante/reservas">Ver mis reservas</Link></Card.Footer>
          </Card>
        ) : (
          <TarjetaAcceso
            titulo="Sin sesiones agendadas"
            descripcion="Cuando reserves con un tutor, la próxima sesión aparecerá aquí."
            href="/buscar"
            accion="Buscar tutor y reservar"
          />
        )}

        <TarjetaAcceso
          titulo="Mis reservas"
          descripcion="Consulta tus reservas y su estado."
          href="/estudiante/reservas"
          accion={`Ver mis ${reservas.length} reservas`}
        />
      </div>

      <section className="pt-10">
        <h2 className="titulo text-xl">Tutores destacados</h2>
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
        {recomendados.length === 0 ? <p className="mt-5 text-sm text-[var(--muted)]">Todavía no hay tutores publicados.</p> : null}
      </section>
    </>
  );
}
