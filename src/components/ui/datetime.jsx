import React from 'react';
import { Label } from './label';
import { Input } from './input';

const onlyDigits = (v) => String(v || '').replace(/\D/g, '');

// "2027-06-05" -> "05/06/2027" (para exibir com separadores)
function toDisplayDate(value) {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (value || '');
}

// "05062027" -> "05/06/2027" (coloca os separadores sozinho)
function maskDate(digits) {
  const d = digits.slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

// "073000" -> "07:30:00" (coloca os ":" sozinho)
function maskTime(digits) {
  const d = digits.slice(0, 6);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}:${d.slice(2)}`;
  return `${d.slice(0, 2)}:${d.slice(2, 4)}:${d.slice(4)}`;
}

// Campo de DATA — texto DD/MM/AAAA com separadores automáticos
export function DateField({ value, onChange, label }) {
  const [text, setText] = React.useState(toDisplayDate(value));
  const editing = React.useRef(false);

  React.useEffect(() => {
    if (!editing.current) setText(toDisplayDate(value));
  }, [value]);

  const handle = (e) => {
    editing.current = true;
    const masked = maskDate(onlyDigits(e.target.value));
    setText(masked);
    const digits = onlyDigits(masked);
    onChange(digits.length === 8 ? `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}` : '');
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input value={text} onChange={handle} placeholder="DD/MM/AAAA" inputMode="numeric" maxLength={10} />
      <p className="text-[11px] text-muted-foreground">formato DD/MM/AAAA (ex.: 05/06/2027)</p>
    </div>
  );
}

// Campo de HORA — texto HH:MM:SS com ":" automáticos
export function TimeField({ value, onChange, label }) {
  const [text, setText] = React.useState(String(value || ''));
  const editing = React.useRef(false);

  React.useEffect(() => {
    if (!editing.current) setText(String(value || ''));
  }, [value]);

  const handle = (e) => {
    editing.current = true;
    const masked = maskTime(onlyDigits(e.target.value));
    setText(masked);
    onChange(masked);
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Input value={text} onChange={handle} placeholder="HH:MM:SS" inputMode="numeric" maxLength={8} />
      <p className="text-[11px] text-muted-foreground">formato HH:MM:SS (ex.: 07:30:00)</p>
    </div>
  );
}
