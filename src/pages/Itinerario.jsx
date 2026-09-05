import React from 'react';
import { Truck, Clock, Route, Plus, Trash, Save, Download, RefreshCw, MapPin } from 'lucide-react';
import { db, ENTITIES } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DIAS_ABREV = { 'Domingo':'Dom','Segunda':'Seg','Terça':'Ter','Quarta':'Qua','Quinta':'Qui','Sexta':'Sex','Sábado':'Sáb' };

// Regras por cidade: embarcamos em um dia e soltamos em outro.
// Se a hora de embarque estiver vazia, mostramos só o dia.
const DEFAULT_CONFIG = {
  velocidade: 90,
  hora_solta: '07:00',
  partida: 'Limeira',
  paradas: [
    { cidade: 'Ribeirão Preto', tempo: 60 },
    { cidade: 'Franca', tempo: 60 },
  ],
  // Preenchido em tempo de execução a partir das provas, com estes padrões.
  // Tudo editável por cidade: dia e hora de embarque, dia e hora da solta.
  padrões: {
    soltaProxima: { dia_embarque: 'Sábado', hora_embarque: '', dia_solta: 'Domingo', hora_solta: '' },      // Cravinhos → Catalão
    soltaLonga: { dia_embarque: 'Quinta', hora_embarque: '18:00', dia_solta: 'Sábado', hora_solta: '' }, // Campo Alegre +
  },
};

function pad(n) { return String(n).padStart(2, '0'); }
function formatTime(d) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function formatDateBR(d) { return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; }
function dayName(d) { return DIAS[d.getDay()]; }
function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }

function formatDuration(minutes) {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h && min) return `${h}h ${pad(min)}min`;
  if (h) return `${h}h`;
  return `${min}min`;
}
function fmtInline(minutes) {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h && min) return `${h}h${pad(min)}`;
  if (h) return `${h}h`;
  return `${min}min`;
}

// Limpa as siglas de UF e devolve o nome-base da cidade (ex.: "Campo Alegre G.O" -> "Campo Alegre")
function baseName(cidade) {
  return (cidade || '').replace(/\b(SP|MG|GO|DF|RJ|PR|SC|RS|BA|ES)\b/gi, '').trim();
}
// Compara se duas cidades são a mesma (ignora UF e acentos)
function sameCity(a, b) {
  const na = norm(baseName(a)), nb = norm(baseName(b));
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function matches(cidade, regra) {
  return regra && regra.cidade && sameCity(cidade, regra.cidade);
}

// Tempo total = estrada + paradas. Todas as paradas se aplicam.
function computeTime(prova, cfg) {
  const km = Number(prova.km) || 0;
  const v = Number(cfg.velocidade) || 90;
  const [hh, mm] = (cfg.hora_solta || '07:00').split(':').map(n => Number(n) || 0);
  const minVia = v > 0 ? (km / v) * 60 : 0;
  const minPar = (cfg.paradas || []).reduce((s, p) => s + (Number(p.tempo) || 0), 0);
  const minTot = minVia + minPar;

  let releaseAt = new Date();
  if (prova.data_solta) releaseAt = new Date(`${prova.data_solta}T${cfg.hora_solta}:00`);
  else releaseAt.setHours(hh, mm, 0, 0);

  const depart = new Date(releaseAt.getTime() - minTot * 60000);
  const diffDays = Math.round((dayStart(releaseAt) - dayStart(depart)) / 86400000);
  return { km, minVia, minPar, minTot, releaseAt, depart, diffDays };
}

function diffLabel(d) {
  if (d <= 0) return 'mesmo dia';
  if (d === 1) return 'véspera';
  return `${d} dias antes`;
}

// ------- Editor de paradas -------
function StopsEditor({ cfg, setCfg }) {
  const upd = (i, f, v) => setCfg(prev => ({ ...prev, paradas: prev.paradas.map((p, idx) => idx === i ? { ...p, [f]: v } : p) }));
  const add = () => setCfg(prev => ({ ...prev, paradas: [...prev.paradas, { cidade: '', tempo: '' }] }));
  const del = (i) => setCfg(prev => ({ ...prev, paradas: prev.paradas.filter((_, idx) => idx !== i) }));
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Paradas no caminho (perdemos tempo em cada)</Label>
        <Button variant="outline" size="sm" onClick={add}><Plus className="mr-1 h-3 w-3" /> Adicionar</Button>
      </div>
      <div className="space-y-2">
        {cfg.paradas.map((p, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3 bg-muted/30">
            <div className="space-y-1 flex-1 min-w-[180px]">
              <Label className="text-xs text-muted-foreground">Cidade</Label>
              <Input value={p.cidade} onChange={e => upd(i, 'cidade', e.target.value)} />
            </div>
            <div className="space-y-1 w-[130px]">
              <Label className="text-xs text-muted-foreground">Tempo perdido (min)</Label>
              <Input type="number" min="0" value={p.tempo} onChange={e => upd(i, 'tempo', e.target.value)} />
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive" onClick={() => del(i)}><Trash className="h-4 w-4" /></Button>
          </div>
        ))}
        {cfg.paradas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">Nenhuma parada.</p>}
      </div>
    </div>
  );
}

// ------- Editor de regras por cidade (editável) -------
function RulesEditor({ provas, cfg, setCfg }) {
  const setRegra = (id, f, v) => setCfg(prev => ({ ...prev, regras: (prev.regras || []).map(r => r.id === id ? { ...r, [f]: v } : r) }));

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> Dia de embarque e dia de solta (edite à vontade)</Label>
        <span className="text-xs text-muted-foreground">Cada cidade pode ter seu próprio dia.</span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Cidade</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dia do embarque</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Hora do embarque</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Dia da solta</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Hora da solta</th>
            </tr>
          </thead>
          <tbody>
            {(cfg.regras || []).map(r => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-medium whitespace-nowrap">{r.cidade}</td>
                <td className="px-3 py-2">
                  <select className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={r.dia_embarque} onChange={e => setRegra(r.id, 'dia_embarque', e.target.value)}>
                    <option value="">—</option>
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="time" className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={r.hora_embarque || ''} onChange={e => setRegra(r.id, 'hora_embarque', e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <select className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={r.dia_solta} onChange={e => setRegra(r.id, 'dia_solta', e.target.value)}>
                    <option value="">—</option>
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="time" className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={r.hora_solta || ''} onChange={e => setRegra(r.id, 'hora_solta', e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------- Config card -------
function ConfigCard({ cfg, setCfg, saving, saved, onSave }) {
  const update = (p) => setCfg(prev => ({ ...prev, ...p }));
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><Route className="w-4 h-4" /> Configuração</CardTitle>
          <CardDescription>Saímos de {cfg.partida}, passamos pelas paradas e soltamos na cidade.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 flex items-center gap-1"><Save className="w-3 h-3" /> Salvo</span>}
          {saving && <span className="text-xs text-muted-foreground">Salvando...</span>}
          <Button variant="outline" size="sm" onClick={onSave}><Save className="mr-1 h-3 w-3" /> Salvar</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Cidade de partida</Label>
            <Input value={cfg.partida} onChange={e => update({ partida: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Velocidade média (km/h)</Label>
            <Input type="number" min="1" value={cfg.velocidade} onChange={e => update({ velocidade: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Horário da solta</Label>
            <Input type="time" value={cfg.hora_solta} onChange={e => update({ hora_solta: e.target.value })} />
          </div>
        </div>
        <StopsEditor cfg={cfg} setCfg={setCfg} />
      </CardContent>
    </Card>
  );
}

// ------- Página principal -------
export default function Itinerario() {
  const { data: provas, refresh } = useCollection(ENTITIES.PROVA);
  const [cfg, setCfg] = React.useState(DEFAULT_CONFIG);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const lastSavedRef = React.useRef(null);

  // Construir regras a partir das provas (uma por cidade)
  const buildRegras = (provaList, base) => {
    const fromCfg = (base.regras || []).filter(r => r.cidade && provaList.some(p => sameCity(p.cidade, r.cidade)));
    return provaList.map(p => {
      let regra = fromCfg.find(r => sameCity(p.cidade, r.cidade));
      if (regra) return { id: p.id, cidade: baseName(p.cidade) || p.cidade, dia_embarque: regra.dia_embarque, hora_embarque: regra.hora_embarque, dia_solta: regra.dia_solta, hora_solta: regra.hora_solta };
      const padrao = Number(p.km) >= 550 ? (base.padrões.soltaLonga) : (base.padrões.soltaProxima);
      return { id: p.id, cidade: baseName(p.cidade) || p.cidade, dia_embarque: padrao.dia_embarque, hora_embarque: padrao.hora_embarque || '', dia_solta: padrao.dia_solta, hora_solta: padrao.hora_solta || '' };
    });
  };

  // Carregar configuração
  React.useEffect(() => {
    const loadCfg = async () => {
      try {
        const rows = await db.list(ENTITIES.CONFIGURACAO);
        const row = rows.find(r => r.chave === 'itinerario_config');
        let base = { ...DEFAULT_CONFIG };
        if (row && row.valor_texto) {
          const parsed = JSON.parse(row.valor_texto);
          base = { ...DEFAULT_CONFIG, ...parsed, padrões: parsed.padrões || DEFAULT_CONFIG.padrões };
        }
        if (provas && provas.length) base.regras = buildRegras(provas, base);
        setCfg(base);
        lastSavedRef.current = JSON.stringify(base);
      } catch (e) { console.error('Erro ao carregar configuração:', e); }
      finally { setLoaded(true); }
    };
    if (provas && provas.length) loadCfg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provas.length]);

  // Salvar configuração
  const saveCfg = async ({ silent = false } = {}) => {
    setSaving(true); setSaved(false);
    try {
      const rows = await db.list(ENTITIES.CONFIGURACAO);
      const existing = rows.find(r => r.chave === 'itinerario_config');
      const payload = { chave: 'itinerario_config', valor_texto: JSON.stringify(cfg), valor_numero: Number(cfg.velocidade) || 0, valor: null };
      if (existing) await db.update(ENTITIES.CONFIGURACAO, existing.id, payload);
      else await db.create(ENTITIES.CONFIGURACAO, payload);
      lastSavedRef.current = JSON.stringify(cfg);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Erro ao salvar configuração:', e);
      if (!silent) alert('Não foi possível salvar a configuração.');
    } finally { setSaving(false); }
  };

  // Auto-save com debounce
  React.useEffect(() => {
    if (!loaded) return;
    const cur = JSON.stringify(cfg);
    if (cur === lastSavedRef.current) return;
    const t = setTimeout(() => saveCfg({ silent: true }), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, loaded]);

  const updateDataSolta = async (prova, novaData) => {
    if (!prova || !prova.id) return;
    try { await db.update(ENTITIES.PROVA, prova.id, { data_solta: novaData }); await refresh(); }
    catch (e) { console.error(e); alert('Não foi possível atualizar a data.'); }
  };

  const sorted = [...(provas || [])].sort((a, b) => (Number(a.km) || 0) - (Number(b.km) || 0));
  const rows = sorted.map(p => {
    const regra = (cfg.regras || []).find(r => r.id === p.id);
    const calc = computeTime(p, cfg);
    return { prova: p, regra, calc };
  });
  const last = rows.length - 1;
  const selected = rows[Math.min(selectedIndex, last)];

  function embLabel(row) {
    if (row.regra && row.regra.dia_embarque) {
      return { day: row.regra.dia_embarque, time: row.regra.hora_embarque || '', rule: true };
    }
    return { day: '', time: '', rule: false };
  }
  function soltaLabel(row) {
    if (!(row.regra && row.regra.dia_solta)) return '';
    const hora = row.regra.hora_solta || cfg.hora_solta;
    return { day: row.regra.dia_solta, hora };
  }

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('Itinerário de Solta — Colombus 2025', 14, 20);
      doc.setFontSize(11);
      doc.text(`Rota: ${cfg.partida} ${cfg.paradas.map(p => '→ ' + p.cidade).join(' ')} → cidade da solta | Velocidade ${cfg.velocidade} km/h`, 14, 28);
      let y = 38;
      rows.forEach(r => {
        if (y > 200) { doc.addPage(); y = 20; }
        const e = embLabel(r); const s = soltaLabel(r);
        const embStr = e.day ? `${e.day}${e.time ? ' ' + e.time : ''}` : `${formatDateBR(r.calc.depart)} ${dayName(r.calc.depart)} ${formatTime(r.calc.depart)}`;
        const soltaStr = s ? `${s.day}${s.hora ? ' ' + s.hora : ''}` : `${formatDateBR(r.calc.releaseAt)} ${dayName(r.calc.releaseAt)} ${cfg.hora_solta}`;
        doc.text(`${r.prova.cidade || '—'} | KM ${r.calc.km} | ${fmtInline(r.calc.minTot)}h | Embarque: ${embStr} | Solta: ${soltaStr}`, 14, y);
        y += 7;
      });
      doc.save('itinerario-solta-colombus.pdf');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Itinerário de Solta</h2>
          <p className="text-muted-foreground">Saímos de {cfg.partida}, passamos por {cfg.paradas.map(p => p.cidade).join(' e ')} e soltamos em cada cidade.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button variant="outline" onClick={() => refresh()}><RefreshCw className="mr-2 h-4 w-4" /> Atualizar</Button>
        </div>
      </div>

      <ConfigCard cfg={cfg} setCfg={setCfg} saving={saving} saved={saved} onSave={saveCfg} />

      {cfg.regras && cfg.regras.length > 0 && (
        <RulesEditor provas={provas} cfg={cfg} setCfg={setCfg} />
      )}

      {selected && (
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Truck className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm text-muted-foreground">Para soltar em</p>
                    <p className="text-xl font-bold flex items-center gap-2">
                      {selected.prova.cidade || '—'}
                      <Badge variant="secondary">{selected.calc.km} km</Badge>
                      {selected.regra?.dia_solta && <Badge variant="outline">solta {selected.regra.dia_solta}</Badge>}
                    </p>
                  </div>
                </div>
                <label className="text-xs text-muted-foreground text-right">
                  Selecionar cidade
                  <select className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm" value={selectedIndex} onChange={e => setSelectedIndex(Number(e.target.value))}>
                    {rows.map((r, i) => <option key={i} value={i}>{r.prova.cidade || '—'}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Embarque</p>
                  <p className="text-2xl font-bold text-primary">
                    {selected.regra?.dia_embarque || formatDateBR(selected.calc.depart)}
                  </p>
                  <p className="text-xs">{selected.regra?.hora_embarque || `${formatTime(selected.calc.depart)} (sair de ${cfg.partida})`}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Solta dos pombos</p>
                  <p className="text-2xl font-bold">{selected.regra?.dia_solta || dayName(selected.calc.releaseAt)}</p>
                  <p className="text-xs">às {selected.regra?.hora_solta || cfg.hora_solta}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Tempo de estrada</p>
                  <p className="text-2xl font-bold">{formatDuration(selected.calc.minVia)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Tempo total</p>
                  <p className="text-2xl font-bold">{formatDuration(selected.calc.minTot)}</p>
                </div>
              </div>

              {selected.calc.minParadas > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cfg.paradas.map((p, i) => (
                    <Badge key={i} variant="outline" className="gap-1"><Clock className="w-3 h-3" /> {p.cidade} (+{p.tempo} min)</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Estrada</TableHead>
                <TableHead>Embarque</TableHead>
                <TableHead>Solta</TableHead>
                <TableHead>Sair de {cfg.partida}</TableHead>
                <TableHead>Data de solta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => {
                const c = r.calc;
                const e = embLabel(r);
                const s = soltaLabel(r);
                const isSel = i === selectedIndex;
                return (
                  <TableRow key={r.prova.id} className={`cursor-pointer ${isSel ? 'bg-primary/5' : ''}`} onClick={() => setSelectedIndex(i)}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">{r.prova.cidade || '—'} <Badge variant="outline">{c.km} km</Badge></span>
                    </TableCell>
                    <TableCell>{c.km}</TableCell>
                    <TableCell>{formatDuration(c.minVia)}</TableCell>
                    <TableCell className="text-accent font-medium">
                      {e.day ? `${e.day}${e.time ? ' ' + e.time : ''}` : `${formatTime(c.depart)} ${DIAS_ABREV[dayName(c.depart)]}`}
                    </TableCell>
                    <TableCell className="font-medium">
                      {s ? `${s.day}${s.hora ? ' ' + s.hora : ''}` : formatTime(c.releaseAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="text-primary font-semibold">{formatTime(c.depart)}</span>
                        <span className="text-muted-foreground"> · {formatDateBR(c.depart)} {dayName(c.depart)}</span>
                        <span className="ml-2"><Badge variant="secondary" className="text-[10px]">{diffLabel(c.diffDays)}</Badge></span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{r.prova.data_solta ? formatDateBR(c.releaseAt) : 'Definir'}</span>
                        <input type="date" value={r.prova.data_solta || ''} onChange={e => { e.stopPropagation(); updateDataSolta(r.prova, e.target.value); }} onClick={e => e.stopPropagation()} className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhuma prova cadastrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
