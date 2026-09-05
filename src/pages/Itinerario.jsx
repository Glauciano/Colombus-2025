import React from 'react';
import { Truck, Clock, Route, Plus, Trash, Save, Download, RefreshCw, MapPin, CalendarDays } from 'lucide-react';
import { db, ENTITIES } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

// ---- Dias da semana em PT-BR ----
const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_ABREV = { 'Domingo':'Dom', 'Segunda':'Seg', 'Terça':'Ter', 'Quarta':'Qua', 'Quinta':'Qui', 'Sexta':'Sex', 'Sábado':'Sáb' };

// ---- Configuração padrão do itinerário ----
const DEFAULT_CONFIG = {
  velocidade: 90,               // km/h
  hora_solta: '07:00',          // horário da solta
  paradas: [
    // Embarcam na própria cidade · 1ª solta em outra
    { cidade: 'Limeira', primeiraSolta: 'Cravinhos', km: 0, tempo: 0 },
    { cidade: 'Ribeirão Preto', primeiraSolta: 'Igarapava', km: 289, tempo: 60 },
    { cidade: 'Franca', primeiraSolta: 'Araguari', km: 456, tempo: 60 },
  ],
  regras: [
    // Sobrescrevem o cálculo automático (dia/hora reais de embarque e solta)
    { cidade: 'Catalão', dia_embarque: 'Sábado', hora_embarque: '', dia_solta: 'Domingo' },
    { cidade: 'Campo Alegre', dia_embarque: 'Quinta', hora_embarque: '18:00', dia_solta: 'Sábado' },
    { cidade: 'Cristalina', dia_embarque: 'Quinta', hora_embarque: '18:00', dia_solta: 'Sábado' },
    { cidade: 'Brasília', dia_embarque: 'Quinta', hora_embarque: '18:00', dia_solta: 'Sábado' },
  ],
};

// ---- Helpers de data/hora ----
function pad(n) { return String(n).padStart(2, '0'); }
function formatTime(d) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function formatDateBR(d) { return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; }
function dayName(d) { return DIAS[d.getDay()]; }
function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }

// ---- Formata duração em "Xh Ymin" ----
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

// ---- Encontra a regra de embarque de uma cidade (busca por nome, ignorando UF) ----
function getRegra(cidade, regras) {
  if (!cidade) return null;
  const nc = norm(cidade);
  return (regras || []).find(r => {
    const nr = norm(r.cidade);
    return nr && (nc.includes(nr) || nr.includes(nc));
  }) || null;
}

// ---- Cálculo automático (referência "para soltar às 07:00") ----
function computeCalc(prova, cfg) {
  const km = Number(prova.km) || 0;
  const velocidade = Number(cfg.velocidade) || 90;
  const hora = cfg.hora_solta || '07:00';
  const [hh, mm] = hora.split(':').map(n => Number(n) || 0);
  const paradas = (cfg.paradas || []).filter(p => p && Number(p.km) <= km);
  const minEmb = paradas.reduce((s, p) => s + (Number(p.tempo) || 0), 0);
  const minVia = velocidade > 0 ? (km / velocidade) * 60 : 0;
  const minTot = minVia + minEmb;

  let releaseAt;
  if (prova.data_solta) {
    releaseAt = new Date(`${prova.data_solta}T${hora}:00`);
  } else {
    releaseAt = new Date();
    releaseAt.setHours(hh, mm, 0, 0);
  }
  const depart = new Date(releaseAt.getTime() - minTot * 60000);
  const diffDays = Math.round((dayStart(releaseAt) - dayStart(depart)) / 86400000);
  return { km, paradas, minEmb, minVia, minTot, releaseAt, depart, diffDays };
}

function diffLabel(diffDays) {
  if (diffDays <= 0) return { label: 'mesmo dia', variant: 'default' };
  if (diffDays === 1) return { label: 'véspera', variant: 'secondary' };
  return { label: `${diffDays} dias antes`, variant: 'outline' };
}

// ------- Editor de paradas e regras -------
function StopsEditor({ cfg, setCfg }) {
  const updateParada = (i, field, value) => setCfg(prev => ({
    ...prev,
    paradas: prev.paradas.map((p, idx) => idx === i ? { ...p, [field]: value } : p),
  }));
  const addParada = () => setCfg(prev => ({ ...prev, paradas: [...prev.paradas, { cidade: '', primeiraSolta: '', km: '', tempo: '' }] }));
  const removeParada = (i) => setCfg(prev => ({ ...prev, paradas: prev.paradas.filter((_, idx) => idx !== i) }));

  const updateRegra = (i, field, value) => setCfg(prev => ({
    ...prev,
    regras: prev.regras.map((r, idx) => idx === i ? { ...r, [field]: value } : r),
  }));
  const addRegra = () => setCfg(prev => ({ ...prev, regras: [...prev.regras, { cidade: '', dia_embarque: '', hora_embarque: '', dia_solta: '' }] }));
  const removeRegra = (i) => setCfg(prev => ({ ...prev, regras: prev.regras.filter((_, idx) => idx !== i) }));

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Paradas de embarque (embarcam na cidade · 1ª solta em outra)</Label>
          <Button variant="outline" size="sm" onClick={addParada}><Plus className="mr-1 h-3 w-3" /> Adicionar</Button>
        </div>
        <div className="space-y-2">
          {cfg.paradas.map((p, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3 bg-muted/30">
              <div className="space-y-1 flex-1 min-w-[140px]">
                <Label className="text-xs text-muted-foreground">Cidade do embarque</Label>
                <Input value={p.cidade} onChange={e => updateParada(i, 'cidade', e.target.value)} placeholder="Ex: Ribeirão Preto" />
              </div>
              <div className="space-y-1 flex-1 min-w-[140px]">
                <Label className="text-xs text-muted-foreground">Primeira solta</Label>
                <Input value={p.primeiraSolta} onChange={e => updateParada(i, 'primeiraSolta', e.target.value)} placeholder="Ex: Igarapava" />
              </div>
              <div className="space-y-1 w-[100px]">
                <Label className="text-xs text-muted-foreground">KM</Label>
                <Input type="number" value={p.km} onChange={e => updateParada(i, 'km', e.target.value)} />
              </div>
              <div className="space-y-1 w-[110px]">
                <Label className="text-xs text-muted-foreground">Tempo (min)</Label>
                <Input type="number" value={p.tempo} onChange={e => updateParada(i, 'tempo', e.target.value)} />
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive" onClick={() => removeParada(i)}><Trash className="h-4 w-4" /></Button>
            </div>
          ))}
          {cfg.paradas.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">Nenhuma parada de embarque cadastrada.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <Label className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Regras de embarque por cidade (opcional — sobrescreve o cálculo)</Label>
          <Button variant="outline" size="sm" onClick={addRegra}><Plus className="mr-1 h-3 w-3" /> Adicionar</Button>
        </div>
        {cfg.regras.length > 0 ? (
          <div className="space-y-2">
            {cfg.regras.map((r, i) => (
              <div key={i} className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-3 bg-muted/30">
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <Label className="text-xs text-muted-foreground">Cidade da prova</Label>
                  <Input value={r.cidade} onChange={e => updateRegra(i, 'cidade', e.target.value)} placeholder="Ex: Campo Alegre" />
                </div>
                <div className="space-y-1 w-[120px]">
                  <Label className="text-xs text-muted-foreground">Dia do embarque</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={r.dia_embarque} onChange={e => updateRegra(i, 'dia_embarque', e.target.value)}>
                    <option value="">—</option>
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1 w-[110px]">
                  <Label className="text-xs text-muted-foreground">Hora do embarque</Label>
                  <Input type="time" value={r.hora_embarque} onChange={e => updateRegra(i, 'hora_embarque', e.target.value)} />
                </div>
                <div className="space-y-1 w-[120px]">
                  <Label className="text-xs text-muted-foreground">Dia da solta</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={r.dia_solta} onChange={e => updateRegra(i, 'dia_solta', e.target.value)}>
                    <option value="">—</option>
                    {DIAS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive" onClick={() => removeRegra(i)}><Trash className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">Nenhuma regra. O cálculo automático será usado.</p>
        )}
      </div>
    </>
  );
}

// ------- Card de configuração -------
function ConfigCard({ cfg, setCfg, saving, saved, onSave }) {
  const update = (patch) => setCfg(prev => ({ ...prev, ...patch }));
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2"><Route className="w-4 h-4" /> Configuração da viagem</CardTitle>
          <CardDescription>Ajuste os parâmetros e o roteiro recalcula na hora.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 flex items-center gap-1"><Save className="w-3 h-3" /> Salvo</span>}
          {saving && <span className="text-xs text-muted-foreground">Salvando...</span>}
          <Button variant="outline" size="sm" onClick={onSave}><Save className="mr-1 h-3 w-3" /> Salvar</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

  // Carregar configuração
  React.useEffect(() => {
    const loadCfg = async () => {
      try {
        const rows = await db.list(ENTITIES.CONFIGURACAO);
        const row = rows.find(r => r.chave === 'itinerario_config');
        if (row && row.valor_texto) {
          const parsed = JSON.parse(row.valor_texto);
          const merged = {
            ...DEFAULT_CONFIG,
            ...parsed,
            paradas: Array.isArray(parsed.paradas) && parsed.paradas.length > 0 ? parsed.paradas : DEFAULT_CONFIG.paradas,
            regras: Array.isArray(parsed.regras) ? parsed.regras : DEFAULT_CONFIG.regras,
          };
          setCfg(merged);
          lastSavedRef.current = JSON.stringify(merged);
        }
      } catch (e) { console.error('Erro ao carregar configuração do itinerário:', e); }
      finally { setLoaded(true); }
    };
    loadCfg();
  }, []);

  // Salvar configuração
  const saveCfg = async ({ silent = false } = {}) => {
    setSaving(true); setSaved(false);
    try {
      const rows = await db.list(ENTITIES.CONFIGURACAO);
      const existing = rows.find(r => r.chave === 'itinerario_config');
      const payload = {
        chave: 'itinerario_config',
        valor_texto: JSON.stringify(cfg),
        valor_numero: Number(cfg.velocidade) || 0,
        valor: null,
      };
      if (existing) await db.update(ENTITIES.CONFIGURACAO, existing.id, payload);
      else await db.create(ENTITIES.CONFIGURACAO, payload);
      lastSavedRef.current = JSON.stringify(cfg);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Erro ao salvar configuração:', e);
      if (!silent) alert('Não foi possível salvar a configuração. Verifique sua conexão.');
    } finally { setSaving(false); }
  };

  // Salvamento automático com debounce
  React.useEffect(() => {
    if (!loaded) return;
    const cur = JSON.stringify(cfg);
    if (cur === lastSavedRef.current) return;
    const t = setTimeout(() => saveCfg({ silent: true }), 1300);
    return () => clearTimeout(t);
  }, [cfg, loaded]);

  // Atualizar data de solta da prova
  const updateDataSolta = async (prova, novaData) => {
    if (!prova || !prova.id) return;
    try { await db.update(ENTITIES.PROVA, prova.id, { data_solta: novaData }); await refresh(); }
    catch (e) { console.error('Erro ao atualizar data de solta:', e); alert('Não foi possível atualizar a data.'); }
  };

  // Roteiro ordenado por KM
  const sorted = [...(provas || [])].sort((a, b) => (Number(a.km) || 0) - (Number(b.km) || 0));
  const rows = sorted.map(p => ({ prova: p, calc: computeCalc(p, cfg), regra: getRegra(p.cidade, cfg.regras) }));
  const last = rows.length - 1;
  const selected = rows[Math.min(selectedIndex, last)];

  // Valores exibidos (regra ou cálculo automático)
  function embDisplay(row) {
    if (row.regra && row.regra.dia_embarque) {
      const time = row.regra.hora_embarque || '';
      return { label: `${time ? time + ' ' : ''}${row.regra.dia_embarque}`.trim(), rule: true };
    }
    const c = row.calc;
    return { label: `${formatTime(c.depart)} ${DIAS_ABREV[dayName(c.depart)]}`, rule: false };
  }
  function soltaDisplay(row) {
    if (row.regra && row.regra.dia_solta) return row.regra.dia_solta;
    const c = row.calc;
    return `${DIAS_ABREV[dayName(c.releaseAt)]} ${formatDateBR(c.releaseAt)}`;
  }

  // Exportar PDF
  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('Itinerário de Solta — Colombus 2025', 14, 20);
      doc.setFontSize(11);
      doc.text(`Velocidade média: ${cfg.velocidade} km/h | Solta às ${cfg.hora_solta}`, 14, 28);
      let y = 36;
      rows.forEach(r => {
        if (y > 200) { doc.addPage(); y = 20; }
        const b = embDisplay(r); const st = soltaDisplay(r);
        const stops = r.calc.paradas.length > 0 ? ` | ${r.calc.paradas.map(p => `${p.cidade}→${p.primeiraSolta} +${p.tempo}min`).join(', ')}` : '';
        doc.text(`# ${r.prova.cidade || '—'} | KM ${r.calc.km} | ${fmtInline(r.calc.minVia)}h${stops} | Embarque: ${b.label} | Solta: ${st}`, 14, y);
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
          <p className="text-muted-foreground">Horário de embarque em Limeira para soltar os pombos às {cfg.hora_solta} em cada cidade.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button variant="outline" onClick={() => refresh()}><RefreshCw className="mr-2 h-4 w-4" /> Atualizar</Button>
        </div>
      </div>

      <ConfigCard cfg={cfg} setCfg={setCfg} saving={saving} saved={saved} onSave={saveCfg} />

      {/* Resumo da cidade selecionada */}
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
                      {selected.regra && <Badge variant="outline">embarque em {selected.regra.dia_embarque || '—'}</Badge>}
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
                  <p className="text-xs text-muted-foreground">Embarque em Limeira</p>
                  <p className="text-2xl font-bold text-primary">{formatTime(selected.calc.depart)}</p>
                  <p className="text-xs">{formatDateBR(selected.calc.depart)} · {dayName(selected.calc.depart)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Solta dos pombos</p>
                  <p className="text-2xl font-bold">{cfg.hora_solta}</p>
                  <p className="text-xs">{soltaDisplay(selected)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Tempo de viagem</p>
                  <p className="text-2xl font-bold">{formatDuration(selected.calc.minVia)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Tempo total</p>
                  <p className="text-2xl font-bold">{formatDuration(selected.calc.minTot)}</p>
                </div>
              </div>

              {selected.calc.paradas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.calc.paradas.map((p, i) => (
                    <Badge key={i} variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" /> {p.cidade} embarca na cidade · 1ª solta {p.primeiraSolta} {p.tempo ? `(+${p.tempo} min)` : ''}
                    </Badge>
                  ))}
                </div>
              )}

              {selected.regra && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="gap-1"><CalendarDays className="w-3 h-3" /> Embarque real: {selected.regra.dia_embarque || '—'} {selected.regra.hora_embarque ? `às ${selected.regra.hora_embarque}` : ''} · solta {selected.regra.dia_solta || '—'}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela do roteiro */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Viagem</TableHead>
                <TableHead>Embarques</TableHead>
                <TableHead>Embarque em Limeira</TableHead>
                <TableHead>Solta</TableHead>
                <TableHead>Data de solta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => {
                const c = r.calc;
                const d = diffLabel(c.diffDays);
                const b = embDisplay(r);
                const st = soltaDisplay(r);
                const isSel = i === selectedIndex;
                return (
                  <TableRow key={r.prova.id || i} className={`cursor-pointer ${isSel ? 'bg-primary/5' : ''}`} onClick={() => setSelectedIndex(i)}>
                    <TableCell className="font-medium">
                      <span className="flex items-center gap-2">{r.prova.cidade || '—'} <Badge variant="outline">{c.km} km</Badge></span>
                    </TableCell>
                    <TableCell>{c.km}</TableCell>
                    <TableCell>{formatDuration(c.minVia)}</TableCell>
                    <TableCell>
                      {c.paradas.length > 0
                        ? c.paradas.map((p, pi) => <Badge key={pi} variant="secondary" className="mr-1 mb-1">{p.cidade} → {p.primeiraSolta}{p.tempo ? ` +${p.tempo}′` : ''}</Badge>)
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${b.rule ? 'text-accent' : 'text-primary'}`}>{b.label}</span>
                        {b.rule
                          ? <span className="text-[10px] text-muted-foreground">(calc {formatTime(c.depart)} {DIAS_ABREV[dayName(c.depart)]})</span>
                          : <Badge variant={d.variant}>{d.label}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${r.regra ? 'text-accent' : ''}`}>{st}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{r.prova.data_solta ? formatDateBR(c.releaseAt) : 'Definir'}</span>
                        <input type="date" value={r.prova.data_solta || ''} onChange={e => updateDataSolta(r.prova, e.target.value)} onClick={e => e.stopPropagation()} className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhuma prova cadastrada. Cadastre em Provas.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        * <strong>Limeira</strong> embarca em Limeira e solta pela primeira vez em <strong>Cravinhos</strong>; <strong>Ribeirão Preto</strong> embarca na própria cidade e solta pela primeira vez em <strong>Igarapava</strong>; <strong>Franca</strong> embarca na própria cidade e solta pela primeira vez em <strong>Araguari</strong>. As <strong>regras</strong> (ex.: Catalão sábado→domingo, Campo Alegre em diante quinta após 18h) sobrescrevem o cálculo automático. O cálculo automático serve de referência para "soltar às {cfg.hora_solta}".
      </p>
    </div>
  );
}
