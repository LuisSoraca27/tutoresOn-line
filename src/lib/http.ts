import { env } from "@/lib/env";

/** Error de red o de API, con el código HTTP para que la UI decida qué mostrar. */
export class ErrorHttp extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
    readonly detalle?: unknown,
  ) {
    super(mensaje);
    this.name = "ErrorHttp";
  }
}

type OpcionesPeticion = Omit<RequestInit, "body"> & {
  /** Parámetros de consulta; los valores `undefined` se descartan. */
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

function construirUrl(ruta: string, query?: OpcionesPeticion["query"]): string {
  const url = new URL(
    ruta.startsWith("/") ? ruta.slice(1) : ruta,
    env.apiUrl.endsWith("/") ? env.apiUrl : `${env.apiUrl}/`,
  );

  for (const [clave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== "") url.searchParams.set(clave, String(valor));
  }

  return url.toString();
}

/**
 * Cliente HTTP único de la aplicación. Los componentes nunca lo usan:
 * solo lo consumen las implementaciones `*.http.ts` de cada dominio.
 */
export async function pedir<T>(ruta: string, opciones: OpcionesPeticion = {}): Promise<T> {
  const { query, body, headers, ...resto } = opciones;

  let respuesta: Response;
  try {
    respuesta = await fetch(construirUrl(ruta, query), {
      ...resto,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ErrorHttp(0, "No pudimos conectarnos con el servidor. Revisa tu conexión e inténtalo de nuevo.");
  }

  if (respuesta.status === 204) return undefined as T;

  const contenido = respuesta.headers.get("content-type") ?? "";
  const datos = contenido.includes("application/json")
    ? await respuesta.json().catch(() => undefined)
    : await respuesta.text();

  if (!respuesta.ok) {
    const mensaje =
      (typeof datos === "object" && datos !== null && "detail" in datos
        ? String((datos as { detail: unknown }).detail)
        : undefined) ?? `La solicitud falló (${respuesta.status}).`;
    throw new ErrorHttp(respuesta.status, mensaje, datos);
  }

  return datos as T;
}
