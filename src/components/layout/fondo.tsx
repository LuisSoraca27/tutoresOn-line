/**
 * Capa de fondo de toda la aplicación.
 *
 * El vidrio necesita algo que refractar: sobre un fondo plano las superficies
 * translúcidas se ven grises, no de cristal. Son manchas de color muy suaves
 * —la marca y los colores de estado— fijas al viewport, así que el desenfoque
 * de las tarjetas siempre tiene material con el que trabajar.
 *
 * Es decorativa: no lleva contenido ni recibe eventos.
 */
export function Fondo() {
  return <div aria-hidden className="fondo-vidrio" />;
}
