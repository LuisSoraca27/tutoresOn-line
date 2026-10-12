const PRECIO = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const FECHA_LARGA = new Intl.DateTimeFormat("es-CO", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const HORA = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" });

/** "$ 45.000" */
export const precio = (valor: number) => PRECIO.format(valor);

/** "$ 45.000 / hora" */
export const precioHora = (valor: number) => `${PRECIO.format(valor)} / hora`;

/** "martes, 3 de septiembre" */
export const fechaLarga = (valor: Date | string) =>
  FECHA_LARGA.format(typeof valor === "string" ? new Date(valor) : valor);

/** "3:30 p. m." */
export const hora = (valor: Date | string) =>
  HORA.format(typeof valor === "string" ? new Date(valor) : valor);

/** "4,8" — una sola decimal, con coma como separador. */
export const calificacion = (valor: number) =>
  valor.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
