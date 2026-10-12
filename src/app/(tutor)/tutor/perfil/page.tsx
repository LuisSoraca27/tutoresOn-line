import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { EditorDatosCuenta } from "@/components/perfil/editor-datos-cuenta";
import { EditorPresentacion } from "@/components/tutor/editor-presentacion";
import { EditorFoto } from "@/components/tutor/editor-foto";
import { PreferenciasNotificacion } from "@/components/perfil/preferencias-notificacion";
import { preferenciasRepo } from "@/features/preferencias";
import { exigirUsuario } from "@/features/auth/sesion";
import { tutoresRepo } from "@/features/tutores";

export const metadata: Metadata = { title: "Mi perfil público" };

/** Perfil de una persona concreta: no se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function PaginaPerfilTutor() {
  const yo = await exigirUsuario("tutor");

  const tutor = await tutoresRepo.obtener(yo.id);
  const preferencias = await preferenciasRepo.de(yo.id);
  if (!tutor) notFound();

  return (
    <>
      <EncabezadoPagina
        titulo="Mi perfil público"
        descripcion="Tu foto, tu presentación pública y los datos de tu cuenta."
      />

      <div className="flex flex-col gap-5">
        <EditorFoto nombre={yo.nombre} avatarUrl={tutor.avatarUrl} />
        <EditorPresentacion
          tutorId={tutor.id}
          tituloInicial={tutor.titulo}
          bioInicial={tutor.bio}
          idiomasIniciales={tutor.idiomas}
        />

        <EditorDatosCuenta
          nombreInicial={yo.nombre}
          correoInicial={yo.correo}
          telefonoInicial={yo.telefono}
        />
        <PreferenciasNotificacion usuarioId={yo.id} iniciales={preferencias.canales} />
      </div>
    </>
  );
}
