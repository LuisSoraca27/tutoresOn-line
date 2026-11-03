import type { Metadata } from "next";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { EditorDatosCuenta } from "@/components/perfil/editor-datos-cuenta";
import { EditorPresentacion } from "@/components/tutor/editor-presentacion";
import { EditorFoto } from "@/components/tutor/editor-foto";
import { exigirUsuario } from "@/features/auth/sesion";
import { tutoresPublicosRepo as tutoresRepo } from "@/features/tutores/publicos";

export const metadata: Metadata = { title: "Mi perfil público" };

/** Perfil de una persona concreta: no se prerenderiza. */
export const dynamic = "force-dynamic";

export default async function PaginaPerfilTutor() {
  const yo = await exigirUsuario("tutor");

  const tutor = await tutoresRepo.obtener(yo.id);
  if (!tutor) return (
    <>
      <EncabezadoPagina titulo="Mi cuenta" descripcion="Consulta y actualiza tus datos de acceso." />
      <EditorDatosCuenta nombreInicial={yo.nombre} correoInicial={yo.correo} telefonoInicial={yo.telefono} />
    </>
  );

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
      </div>
    </>
  );
}
