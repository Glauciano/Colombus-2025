import React from 'react';
import { Pencil, Download, RefreshCw, Truck } from 'lucide-react';
import { db, ENTITIES, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';

// ---- Config padrão (editável, salva no Supabase) ----
const DEFAULT_CFG = {
  velocidade: 90,
  hora_solta: '07:00',
  paradas: [
    { cidade: 'Ribeirão Preto', tempo: 60 },
    { cidade: 'Franca', tempo: 60 },
  ],
};

function pad(n) { return String(n).padStart(2, '0'); }
function formatTime(d) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
function dayName(d) { return DIAS[d.getDay()]; }
function dotBR(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; }
function fmtDur(min) { const m=Math.round(min),h=Math.floor(m/60),x=m%60; if(h&&x)return `${h}h ${pad(x)}min`; if(h)return `${h}h`; return `${x}min`; }

// Calcula a data/hora de sair de Limeira para soltar na data_solta às hora_solta
function calcSaida(prova, cfg) {
  const km = Number(prova.km) || 0;
  const v = Number(cfg.velocidade) || 90;
  const [hh, mm] = (cfg.hora_solta || '07:00').split(':').map(n => Number(n) || 0);
  const drive = v > 0 ? (km / v) * 60 : 0;
  const paradas = (cfg.paradas || []).reduce((s,p) => s + (Number(p.tempo) || 0), 0);
  const tot = drive + paradas;

  let solta = new Date();
  if (prova.data_solta) solta = new Date(`${prova.data_solta}T${cfg.hora_solta}:00`);
  else solta.setHours(hh, mm, 0, 0);
  const saida = new Date(solta.getTime() - tot * 60000);

  return { km, drive, paradas, tot, solta, saida };
}

// ---- Formulário: edita a data de solta (e embarque) com calendário ----
function DataForm({ prova, onSave, onClose }) {
  const [emb, setEmb] = React.useState(prova.data_embarque?.slice(0,10) || '');
  const [sol, setSol] = React.useState(prova.data_solta?.slice(0,10) || '');
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Itinerário — {prova.cidade}</DialogTitle>
          <DialogDescription>Escolha as datas no calendário. O horário de sair de Limeira é recalculado na hora.</DialogDescription>
        </DialogHeader>
        <form onSubmit={e => { e.preventDefault(); onSave({ data_embarque: emb, data_solta: sol }); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Data Embarque</Label><Input type="date" value={emb} onChange={e => setEmb(e.target.value)} /></div>
            <div className="space-y-2"><Label>Data Solta</Label><Input type="date" value={sol} onChange={e => setSol(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ------- Página principal -------
export default function Itinerario() {
  const { data: provas, refresh } = useCollection(ENTITIES.PROVA);
  const [cfg, setCfg] = React.useState(DEFAULT_CFG);
  const [loaded, setLoaded] = React.useState(false);
  const [editModal, setEditModal] = React.useState({ open: false, prova: null });
  const lastCfgRef = React.useRef(null);

  // Carregar configuração
  React.useEffect(() => {
    const load = async () => {
      try {
        const rows = await db.list(ENTITIES.CONFIGURACAO);
        const row = rows.find(r => r.chave === 'itinerario_config');
        if (row && row.valor_texto) {
          const p = JSON.parse(row.valor_texto);
          setCfg({ ...DEFAULT_CFG, ...p, paradas: Array.isArray(p.paradas) && p.paradas.length ? p.paradas : DEFAULT_CFG.paradas });
          lastCfgRef.current = JSON.stringify({ ...DEFAULT_CFG, ...p, paradas: p.paradas });
        }
      } catch (e) { console.error('Erro ao carregar configuração:', e); }
      finally { setLoaded(true); }
    };
    load();
  }, []);

  // Auto-save da configuração
  React.useEffect(() => {
    if (!loaded) return;
    const cur = JSON.stringify(cfg);
    if (cur === lastCfgRef.current) return;
    const t = setTimeout(async () => {
      try {
        const rows = await db.list(ENTITIES.CONFIGURACAO);
        const existing = rows.find(r => r.chave === 'itinerario_config');
        const payload = { chave: 'itinerario_config', valor_texto: JSON.stringify(cfg), valor_numero: Number(cfg.velocidade)||0, valor: null };
        if (existing) await db.update(ENTITIES.CONFIGURACAO, existing.id, payload);
        else await db.create(ENTITIES.CONFIGURACAO, payload);
        lastCfgRef.current = cur;
      } catch (e) { console.error('Erro ao salvar configuração:', e); }
    }, 1200);
    return () => clearTimeout(t);
  }, [cfg, loaded]);

  const sorted = [...(provas || [])].sort((a,b) => (Number(a.km)||0) - (Number(b.km)||0));

  const updateCfg = (patch) => setCfg(prev => ({ ...prev, ...patch }));
  const updateParada = (i, f, v) => setCfg(prev => ({ ...prev, paradas: prev.paradas.map((p,idx) => idx===i ? { ...p, [f]: v } : p) }));

  // Salvar datas editadas
  const handleFormSave = async (datas) => {
    try {
      await db.update(ENTITIES.PROVA, editModal.prova.id, { data_embarque: datas.data_embarque, data_solta: datas.data_solta });
      await refresh();
    } catch (e) {
      console.error(e);
      alert('Não foi possível salvar as datas. Verifique sua conexão.');
    } finally {
      setEditModal({ open: false, prova: null });
    }
  };

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('Itinerário de Solta — Colombus 2025', 14, 20);
      doc.setFontSize(11);
      doc.text(`Velocidade ${cfg.velocidade} km/h | Solta às ${cfg.hora_solta} | Paradas: ${cfg.paradas.map(p=>p.cidade+' +'+p.tempo+'min').join(', ')}`, 14, 28);
      let y = 38;
      sorted.forEach(p => {
        if (y > 200) { doc.addPage(); y = 20; }
        const c = calcSaida(p, cfg);
        doc.text(`${p.cidade || '—'} | KM ${c.km} | Solta ${formatDate(p.data_solta)} ${cfg.hora_solta} | Sair de Limeira: ${dotBR(c.saida)} ${dayName(c.saida)} ${formatTime(c.saida)}`, 14, y);
        y += 7;
      });
      doc.save('itinerario-solta-colombus.pdf');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Itinerário</h2>
          <p className="text-muted-foreground">Horário de sair de Limeira para soltar em cada cidade</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button variant="outline" onClick={() => refresh()}><RefreshCw className="mr-2 h-4 w-4" /> Atualizar</Button>
        </div>
      </div>

      {/* Configuração */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Viagem</CardTitle>
          <span className="text-xs text-muted-foreground">{cfg.paradas.map(p=>p.cidade).join(' → ')}</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2"><Label>Velocidade (km/h)</Label><Input type="number" min="1" value={cfg.velocidade} onChange={e=>updateCfg({ velocidade: e.target.value })} /></div>
            <div className="space-y-2"><Label>Hora da solta</Label><Input type="time" value={cfg.hora_solta} onChange={e=>updateCfg({ hora_solta: e.target.value })} /></div>
            {cfg.paradas.map((p,i) => (
              <div key={i} className="space-y-2"><Label>Parada {cfg.paradas.length>1?i+1:''} — {p.cidade} (min)</Label><Input type="number" min="0" value={p.tempo} onChange={e=>updateParada(i,'tempo',e.target.value)} /></div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela (molde Provas) */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Data Solta</TableHead>
                <TableHead>⏰ Sair de Limeira</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(prova => {
                const c = calcSaida(prova, cfg);
                return (
                  <TableRow key={prova.id}>
                    <TableCell className="font-medium">{prova.cidade || '—'}</TableCell>
                    <TableCell>{c.km}</TableCell>
                    <TableCell>{formatDate(prova.data_solta)} · {cfg.hora_solta}</TableCell>
                    <TableCell>
                      <div>
                        <span className="text-primary font-semibold">{formatTime(c.saida)}</span>
                        <span className="text-muted-foreground"> · {dotBR(c.saida)} ({dayName(c.saida)})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditModal({ open: true, prova })}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Nenhuma prova cadastrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editModal.open && (
        <DataForm prova={editModal.prova} onSave={handleFormSave} onClose={() => setEditModal({ open: false, prova: null })} />
      )}
    </div>
  );
}
