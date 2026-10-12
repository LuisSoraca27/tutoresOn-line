import type { Metadata } from "next";
import { Chip, Tabs } from "@heroui/react";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { TablaReservas } from "@/components/reservas/tabla-reservas";
import { catalogosRepo } from "@/features/catalogos";
import { reservasRepo } from "@/features/reservas";
import { agrupar, aVista } from "@/features/reservas/vista";
import { estudianteActual } from "@/features/sesion/identidades";
import { tutoresRepo } from "@/features/tutores";

export const metadata: Metadata = { title: "Mis reservas" };

/** Datos de una persona concreta: no se prerenderizan en el build. */
export const dynamic = "force-dynamic";

export default async function PaginaReservas() {
  const estudianteId = await estudianteActual();

  const [reservas, tutores, materias, niveles, ciudades] = await Promise.all([
    reservasRepo.deEstudiante(estudianteId),
    tutoresRepo.buscar({ porPagina: 100 }).then((pagina) => pagina.items),
    catalogosRepo.materias(),
    catalogosRepo.niveles(),
    catalogosRepo.ciudades(),
  ]);

  const { proximas, pasadas, canceladas } = agrupar(
    aVista(reservas, { tutores, materias, niveles, ciudades }),
  );

  const pestanas = [
    { id: "proximas", etiqueta: "Próximas", datos: proximas, vacio: "No tienes sesiones agendadas. Busca un tutor y reserva un turno." },
    { id: "pasadas", etiqueta: "Pasadas", datos: pasadas, vacio: "Todavía no has tenido ninguna sesión." },
    { id: "canceladas", etiqueta: "Canceladas", datos: canceladas, vacio: "Ninguna reserva cancelada ni rechazada." },
  ];

  return (
    <>
      <EncabezadoPagina
        titulo="Mis reservas"
        descripcion="Toca una fila para ver el detalle, entrar a la sesión o cancelarla."
      />

      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="Estado de mis reservas">
            {pestanas.map((pestana) => (
              <Tabs.Tab key={pestana.id} id={pestana.id}>
                {pestana.etiqueta}
                {pestana.datos.length > 0 ? (
                  <Chip size="sm" variant="soft" className="ml-2 tabular-nums">
                    {pestana.datos.length}
                  </Chip>
                ) : null}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        {pestanas.map((pestana) => (
          <Tabs.Panel key={pestana.id} id={pestana.id} className="pt-6">
            <TablaReservas reservas={pestana.datos} vacio={pestana.vacio} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  );
}
