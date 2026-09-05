import { Label } from './label';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const ANOS = [];
for (let a = 2020; a <= 2050; a++) ANOS.push(a);

function pad(n) { return String(n).padStart(2, '0'); }

// Converte "YYYY-MM-DD" -> {dia, mes, ano, ok}
function parseData(str) {
  if (!str) return { dia: '', mes: '', ano: '', ok: false };
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return { dia: '', mes: '', ano: '', ok: false };
  return { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]), ok: true };
}

// Converte "HH:MM" -> {hora, minuto}
function parseHora(str) {
  if (!str) return { hora: '', minuto: '' };
  const m = String(str).match(/^(\d{1,2}):(\d{2})/);
  return m ? { hora: m[1], minuto: m[2] } : { hora: '', minuto: '' };
}

const selectCls = "h-10 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

// Campo de DATA (dia/mês/ano) que funciona para qualquer ano
export function DateField({ value, onChange, label }) {
  const d = parseData(value);
  const set = (dia, mes, ano) => {
    if (!ano || !mes || !dia) return onChange('');
    onChange(`${ano}-${pad(mes)}-${pad(dia)}`);
  };
  const dias = anoNum(d.ano, d.mes);
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <select className={selectCls + " flex-1"} value={d.dia} onChange={e => set(e.target.value, d.mes, d.ano)}>
          <option value="">Dia</option>
          {dias.map(dd => <option key={dd} value={dd}>{dd}</option>)}
        </select>
        <select className={selectCls + " flex-[1.4]"} value={d.mes} onChange={e => set(d.dia, e.target.value, d.ano)}>
          <option value="">Mês</option>
          {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className={selectCls + " flex-[1.1]"} value={d.ano} onChange={e => set(d.dia, d.mes, e.target.value)}>
          <option value="">Ano</option>
          {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
}

// Campo de HORA (hora/minuto)
export function TimeField({ value, onChange, label }) {
  const h = parseHora(value);
  const set = (hora, minuto) => {
    if (hora === '' || minuto === '') return onChange('');
    onChange(`${pad(hora)}:${minuto}`);
  };
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <select className={selectCls + " flex-1"} value={h.hora} onChange={e => set(e.target.value, h.minuto)}>
          <option value="">Hora</option>
          {Array.from({ length: 24 }, (_, i) => <option key={i} value={pad(i)}>{pad(i)}</option>)}
        </select>
        <select className={selectCls + " flex-1"} value={h.minuto} onChange={e => set(h.hora, e.target.value)}>
          <option value="">Min</option>
          {Array.from({ length: 60 }, (_, i) => <option key={i} value={pad(i)}>{pad(i)}</option>)}
        </select>
      </div>
    </div>
  );
}

function anoNum(ano, mes) {
  const m = Number(mes) || 1;
  const y = Number(ano) || 2026;
  const ultimo = new Date(y, m, 0).getDate();
  const out = [];
  for (let i = 1; i <= ultimo; i++) out.push(i);
  return out;
}
