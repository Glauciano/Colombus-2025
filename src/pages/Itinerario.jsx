import React from 'react';
import { Pencil, Download, RefreshCw } from 'lucide-react';
import { db, ENTITIES, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { DateField, TimeField } from '../components/ui/datetime';

const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

const DEFAULT_CFG = {
  velocidade: 90,
  embargoLimeira: 60,
  paradas: [
    { cidade: 'Ribeirão Preto', tempo: 60 },
    { cidade: 'Franca', tempo: 60 },
  ],
};

function pad(n) { return String(n).padStart(2, '0'); }
function fmtTime(d) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function fmtDate(d) { return `${pad(d.getDate())}/${pad(d.getMonth()+1)}`; }
function dayName(d) { return DIAS[d.getDay()]; }
function fmtDur(min) { const m=Math.round(min),h=Math.floor(m/60),x=m%60; if(h&&x)return `${h}h${pad(x)}`; if(h)return `${h}h`; return `${x}min`; }

// Calcula os horários usando a DATA e a HORA de solta definidas para a prova
function calcLinhas(prova, cfg) {
  const km = Number(prova.km) || 0;
  const v = Number(cfg.velocidade) || 90;

  const viagem = v > 0 ? (km / v) * 60 : 0;
  const paradas = (cfg.paradas || []).reduce((s,p) => s + (Number(p.tempo) || 0), 0);
  const embLimeira = Number(cfg.embargoLimeira) || 0;

  // Hora de solta definida pelo usuário (dia_solta guarda a hora, ex.: "06:30")
  const horaSolta = prova.dia_solta || '07:00';
  const [ hh, mm ] = horaSolta.split(':').map(n => Number(n) || 0);

  let solta = new Date();
  if (prova.data_solta) solta = new Date(`${prova.data_solta}T${horaSolta}:00`);
  else solta.setHours(hh, mm, 0, 0);

  const saida = new Date(solta.getTime() - (viagem + paradas) * 60000);
  const inicioEmb = new Date(saida.getTime() - embLimeira * 60000);

  return { km, viagem, paradas, embLimeira, solta, saida, inicioEmb, total: viagem + paradas + embLimeira, horaSolta };
}

// ---- Formulário: data e hora de embarque e de solta (editável, salva de verdade) ----
function ProvaForm({ prova, onSave, onClose }) {
  const [dataEmb, setDataEmb] = React.useState(prova.data_embarque?.slice(0,10) || '');
  const [horaEmb, setHoraEmb] = React.useState(prova.dia_embarque || '');
  const [dataSol, setDataSol] = React.useState(prova.data_solta?.slice(0,10) || '');
  const [horaSol, setHoraSol] = React.useState(prova.dia_solta || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      data_embarque: dataEmb || null,
      dia_embarque: horaEmb || null,
      data_solta: dataSol || null,
      dia_solta: horaSol || null,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Itinerário — {prova.cidade}</DialogTitle>
          <DialogDescription>Defina a data e a hora de embarque e de solta. Funciona em qualquer ano.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <DateField label="Data Embarque" value={dataEmb} onChange={setDataEmb} />
            <TimeField label="Hora Embarque" value={horaEmb} onChange={setHoraEmb} />
            <DateField label="Data Solta" value={dataSol} onChange={setDataSol} />
            <TimeField label="Hora Solta" value={horaSol} onChange={setHoraSol} />
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

export default function Itinerario() {
  const { data: provas, refresh } = useCollection(ENTITIES.PROVA);
  const [cfg, setCfg] = React.useState(DEFAULT_CFG);
  const [loaded, setLoaded] = React.useState(false);
  const [editModal, setEditModal] = React.useState({ open: false, prova: null });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const rows = await db.list(ENTITIES.CONFIGURACAO);
        const row = rows.find(r => r.chave === 'itinerario_config');
        if (row && row.valor_texto) {
          const p = JSON.parse(row.valor_texto);
          setCfg({ ...DEFAULT_CFG, ...p, paradas: Array.isArray(p.paradas) && p.paradas.length ? p.paradas : DEFAULT_CFG.paradas });
        }
      } catch (e) { console.error(e); }
      finally { setLoaded(true); }
    };
    load();
  }, []);

  const sorted = [...(provas || [])].sort((a,b) => (Number(a.km)||0) - (Number(b.km)||0));

  const updateCfg = (patch) => setCfg(prev => ({ ...prev, ...patch }));
  const updateParada = (i, f, v) => setCfg(prev => ({ ...prev, paradas: prev.paradas.map((p,idx) => idx===i ? { ...p, [f]: v } : p) }));

  // Salva as mudanças no Supabase e recarrega
  const handleFormSave = async (dados) => {
    setSaving(true);
    try {
      await db.update(ENTITIES.PROVA, editModal.prova.id, dados);
      await refresh();
    } catch (e) {
      console.error(e);
      alert('Não foi possível salvar. Verifique sua conexão.');
    } finally {
      setSaving(false);
      setEditModal({ open: false, prova: null });
    }
  };

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('Itinerário de Solta — Colombus 2025', 14, 20);
      doc.setFontSize(11);
      doc.text(`Velocidade ${cfg.velocidade} km/h | Emb. Limeira ${cfg.embargoLimeira}min | Paradas: ${cfg.paradas.map(p=>p.cidade+' +'+p.tempo+'min').join(', ')}`, 14, 28);
      let y = 38;
      sorted.forEach(p => {
        if (y > 200) { doc.addPage(); y = 20; }
        const c = calcLinhas(p, cfg);
        doc.text(`${p.cidade || '—'} | KM ${c.km} | Emb.Limeira ${fmtDate(c.inicioEmb)} ${fmtTime(c.inicioEmb)} | Sair ${fmtDate(c.saida)} ${fmtTime(c.saida)} | Solta ${formatDate(p.data_solta)} ${c.horaSolta}`, 14, y);
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
          <p className="text-muted-foreground">Embarque em Limeira → Ribeirão Preto → Franca → solta definida por você</p>
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
            <div className="space-y-2"><Label>Emb. Limeira (min)</Label><Input type="number" min="0" value={cfg.embargoLimeira} onChange={e=>updateCfg({ embargoLimeira: e.target.value })} /></div>
            {cfg.paradas.map((p,i) => (
              <div key={i} className="space-y-2"><Label>{p.cidade} (min)</Label><Input type="number" min="0" value={p.tempo} onChange={e=>updateParada(i,'tempo',e.target.value)} /></div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">O horário da solta é definido para cada prova (clique no lápis). A coluna "Sair de Limeira" usa esse horário.</p>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Emb. Limeira (início)</TableHead>
                <TableHead>✅ Sair de Limeira</TableHead>
                <TableHead>Solta</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(prova => {
                const c = calcLinhas(prova, cfg);
                return (
                  <TableRow key={prova.id}>
                    <TableCell className="font-medium">{prova.cidade || '—'}</TableCell>
                    <TableCell>{c.km}</TableCell>
                    <TableCell>
                      <span className="text-accent font-semibold">{fmtTime(c.inicioEmb)}</span>
                      <span className="text-muted-foreground text-xs"> · {fmtDate(c.inicioEmb)} {dayName(c.inicioEmb)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-primary font-semibold">{fmtTime(c.saida)}</span>
                      <span className="text-muted-foreground text-xs"> · {fmtDate(c.saida)} {dayName(c.saida)}</span>
                    </TableCell>
                    <TableCell>
                      {formatDate(prova.data_solta)} <span className="text-xs text-muted-foreground">({c.horaSolta})</span>
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
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Nenhuma prova cadastrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editModal.open && (
        <ProvaForm prova={editModal.prova} onSave={handleFormSave} onClose={() => setEditModal({ open: false, prova: null })} />
      )}
      {saving && <p className="text-xs text-muted-foreground">Salvando...</p>}
    </div>
  );
}
