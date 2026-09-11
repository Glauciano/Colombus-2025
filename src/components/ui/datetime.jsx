import { Label } from './label';
import { Input } from './input';

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const ANOS = [];
for (let a = 2020; a <= 2050; a++) ANOS.push(a);

function pad(n) { return String(n).padStart(2, '0'); }

function parseData(str) {
  if (!str) return { dia: '', mes: '', ano: '', ok: false };
  const m = String(str).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return { dia: '', mes: '', ano: '', ok: false };
  return { ano: Number(m[1]), mes: Number(m[2]), dia: Number(m[3]), ok: true };
}

const selectCls = "h-10 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

// Campo de DATA (dia/mês/ano) — funciona para qualquer ano, inclusive 2027
export function DateField({ value, onChange, label }) {
  const d = parseData(value);
  const set = (dia, mes, ano) => {
    if (!ano || !mes || !dia) return onChange('');
    onChange(`${ano}-${pad(Number(mes))}-${pad(Number(dia))}`);
  };
  const dias = diasNoMes(d.ano, d.mes);
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <select className={selectCls + " flex-1"} value={String(d.dia)} onChange={e => set(e.target.value, d.mes, d.ano)}>
          <option value="">Dia</option>
          {dias.map(dd => <option key={dd} value={dd}>{dd}</option>)}
        </select>
        <select className={selectCls + " flex-[1.4]"} value={String(d.mes)} onChange={e => set(d.dia, e.target.value, d.ano)}>
          <option value="">Mês</option>
          {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className={selectCls + " flex-[1.1]"} value={String(d.ano)} onChange={e => set(d.dia, d.mes, e.target.value)}>
          <option value="">Ano</option>
          {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  );
}

// Campo de HORA — texto livre no formato HH:MM:SS (ex.: "07:00:00")
export function TimeField({ value, onChange, label }) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="07:00:00"
        inputMode="numeric"
        maxLength={8}
      />
      <p className="text-[11px] text-muted-foreground">formato HH:MM:SS (ex.: 07:00:00)</p>
    </div>
  );
}

function diasNoMes(ano, mes) {
  const m = Number(mes) || 1;
  const y = Number(ano) || 2026;
  const ultimo = new Date(y, m, 0).getDate();
  const out = [];
  for (let i = 1; i <= ultimo; i++) out.push(i);
  return out;
}
