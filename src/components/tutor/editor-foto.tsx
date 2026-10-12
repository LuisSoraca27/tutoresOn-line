"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Avatar, Button, Card } from "@heroui/react";
import { guardarFoto } from "@/features/tutores/acciones";
import { iniciales } from "@/lib/texto";

export function EditorFoto({
  nombre,
  avatarUrl,
}: {
  nombre: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    ok: boolean;
    mensaje: string;
  } | null>(null);
  const [guardando, iniciar] = useTransition();
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const imagen = preview ?? avatarUrl;
  return (
    <Card>
      <Card.Header>
        <Card.Title className="text-base">Foto de perfil</Card.Title>
        <Card.Description>PNG, JPG o WebP de hasta 500 KB.</Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Avatar size="lg">
          {imagen ? (
            <Avatar.Image src={imagen} alt={`Foto de ${nombre}`} />
          ) : null}
          <Avatar.Fallback>{iniciales(nombre)}</Avatar.Fallback>
        </Avatar>
        <form
          className="flex flex-col gap-4"
          onSubmit={(evento) => {
            evento.preventDefault();
            if (guardando) return;
            const datos = new FormData(evento.currentTarget);
            const formulario = evento.currentTarget;
            iniciar(async () => {
              const respuesta = await guardarFoto(datos);
              setResultado(
                respuesta.ok
                  ? { ok: true, mensaje: "Foto actualizada." }
                  : respuesta,
              );
              if (respuesta.ok) {
                formulario.reset();
                setPreview(null);
                router.refresh();
              }
            });
          }}
        >
          <label className="flex flex-col gap-2 text-sm font-medium">
            Elegir foto
            <input
              type="file"
              name="foto"
              accept="image/png,image/jpeg,image/webp"
              disabled={guardando}
              className="w-full min-w-0 rounded-lg border border-[var(--border)] p-2 text-base file:mr-3 file:rounded file:border-0 file:bg-[var(--surface-2)] file:px-3 file:py-2 focus-visible:outline-2 focus-visible:outline-[var(--focus)]"
              onChange={(evento) => {
                setResultado(null);
                const archivo = evento.target.files?.[0];
                if (!archivo) {
                  setPreview(null);
                  return;
                }
                if (
                  archivo.size > 512000 ||
                  !["image/png", "image/jpeg", "image/webp"].includes(
                    archivo.type,
                  )
                ) {
                  setResultado({
                    ok: false,
                    mensaje:
                      "Elige una imagen PNG, JPG o WebP de hasta 500 KB.",
                  });
                  evento.target.value = "";
                  setPreview(null);
                  return;
                }
                setPreview(URL.createObjectURL(archivo));
              }}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              variant="primary"
              isDisabled={!preview || guardando}
            >
              {guardando ? "Guardando…" : "Guardar foto"}
            </Button>
            {avatarUrl ? (
              <Button
                variant="outline"
                isDisabled={guardando}
                onPress={() =>
                  iniciar(async () => {
                    const datos = new FormData();
                    datos.set("quitar", "si");
                    const respuesta = await guardarFoto(datos);
                    setResultado(
                      respuesta.ok
                        ? { ok: true, mensaje: "Foto eliminada." }
                        : respuesta,
                    );
                    if (respuesta.ok) {
                      setPreview(null);
                      router.refresh();
                    }
                  })
                }
              >
                Quitar foto
              </Button>
            ) : null}
          </div>
        </form>
        {resultado ? (
          <Alert status={resultado.ok ? "success" : "danger"}>
            <Alert.Content>
              <Alert.Description>{resultado.mensaje}</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
      </Card.Content>
    </Card>
  );
}
