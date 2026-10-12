/** Descarga local sin enviar los datos a otro servicio. */
export function descargar(nombre: string, contenido: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Evita fórmulas al abrir texto aportado por usuarios en una hoja de cálculo. */
export function celdaCsv(valor: string | number) {
  const texto = String(valor);
  const seguro = /^[\s]*[=+@-]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replaceAll('"', '""')}"`;
}
