const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
               "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function formatFecha(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr + "T12:00:00");
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function formatFechaCorta(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr + "T12:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function formatDiaSemana(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr + "T12:00:00");
  return DIAS[d.getDay()];
}

export function hoy() {
  return new Date().toISOString().split("T")[0];
}

export function diasRestantes(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr + "T12:00:00");
  const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export function nombreMes(num) {
  return MESES[num] || "";
}
