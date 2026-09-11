// Helpers de data e hora compartilhados (dias da semana + HH:MM:SS)
export const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const pad = (n) => String(n).padStart(2, '0');

// Retorna o nome do dia da semana a partir de uma data "YYYY-MM-DD"
// Usa T12:00:00 para evitar que o fuso horário mude o dia.
export function dayName(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  if (isNaN(d.getTime())) return '';
  return DIAS_SEMANA[d.getDay()];
}

// Valida se o valor é um horário (HH:MM ou HH:MM:SS)
export function isTime(v) {
  return /^\d{1,2}:\d{2}(:\d{2})?$/.test(String(v || '').trim());
}

// Converte "HH:MM" ou "HH:MM:SS" em { h, m, s }
export function parseTime(v) {
  const parts = String(v || '').trim().split(':');
  return {
    h: Number(parts[0]) || 0,
    m: Number(parts[1]) || 0,
    s: Number(parts[2]) || 0,
  };
}

// Normaliza um horário para HH:MM:SS (ex.: "7:05" -> "07:05:00")
export function formatHMS(v) {
  if (!isTime(v)) return '';
  const { h, m, s } = parseTime(v);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Exibe um horário para tabela (HH:MM:SS ou "—" se não for horário)
export function formatTimeOrDash(v) {
  return isTime(v) ? formatHMS(v) : '—';
}

// Exibe "DD/MM/AAAA · Sábado"
export function formatDateWithDay(dateStr) {
  if (!dateStr) return '—';
  const d = String(dateStr).slice(0, 10);
  const [y, m, dd] = d.split('-');
  if (!y || !m || !dd) return '—';
  const nome = dayName(d);
  return `${dd}/${m}/${y}${nome ? ' · ' + nome : ''}`;
}
