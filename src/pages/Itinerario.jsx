import React from 'react';
import { Pencil, Download, Plus } from 'lucide-react';
import { db, ENTITIES, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { DateField, TimeField } from '../components/ui/datetime';
import { dayName, isTime, formatHMS } from '../lib/dates';

// Formulário do itinerário: data e hora do embarque e da solta (campos próprios)
function ProvaForm({ prova, onSave, onClose }) {
  const isEdit = !!prova;
  const [cidade, setCidade] = React.useState(prova?.cidade || '');
  const [km, setKm] = React.useState(prova?.km ?? '');
  const [dataEmb, setDataEmb] = React.useState(prova?.data_embarque?.slice(0, 10) || '');
  const [horaEmb, setHoraEmb] = React.useState(isTime(prova?.hora_embarque) ? formatHMS(prova.hora_embarque) : '');
  const [dataSol, setDataSol] = React.useState(prova?.data_solta?.slice(0, 10) || '');
  const [horaSol, setHoraSol] = React.useState(isTime(prova?.hora_solta) ? formatHMS(prova.hora_solta) : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      data_embarque: dataEmb || null,
      data_solta: dataSol || null,
    };
    if (isTime(horaEmb)) payload.hora_embarque = formatHMS(horaEmb);
    if (isTime(horaSol)) payload.hora_solta = formatHMS(horaSol);
    if (!isEdit) {
      payload.cidade = cidade || null;
      payload.km = km !== '' ? Number(km) : null;
      payload.categoria = 'Campeonato Adultos';
      payload.valor = 200;
      payload.status = 'Programada';
    }
    onSave(payload);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Itinerário — ${prova.cidade}` : 'Nova Prova'}</DialogTitle>
          <DialogDescription>Data e hora do embarque (Limeira) e da solta. Funciona para qualquer ano.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2"><Label>Cidade</Label><Input value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: Brasília D.F" /></div>
              <div className="space-y-2"><Label>KM</Label><Input type="number" value={km} onChange={e => setKm(e.target.value)} /></div>
            </div>
          )}
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
  const [editModal, setEditModal] = React.useState({ open: false, prova: null });
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState('');

  const sorted = [...(provas || [])].sort((a, b) => (Number(a.km) || 0) - (Number(b.km) || 0));

  const handleFormSave = async (payload) => {
    setSaving(true);
    setMsg('');
    try {
      if (editModal.prova) {
        await db.update(ENTITIES.PROVA, editModal.prova.id, payload);
      } else {
        await db.create(ENTITIES.PROVA, payload);
      }
      await refresh();
      setMsg('Salvo ✓');
    } catch (e) {
      console.error(e);
      setMsg('Não salvou: ' + (e?.message || 'erro'));
    } finally {
      setSaving(false);
      setEditModal({ open: false, prova: null });
      setTimeout(() => setMsg(''), 4000);
    }
  };

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(18);
      doc.text('Itinerário — Colombus 2025', 14, 20);
      doc.setFontSize(10);
      doc.text('Rota: Limeira (embarque ~1h) → Ribeirão Preto (+~1h) → Franca (+~1h) → cidade da solta', 14, 28);
      let y = 40;
      sorted.forEach(p => {
        if (y > 195) { doc.addPage(); y = 20; }
        const emb = `${formatDate(p.data_embarque)} ${dayName(p.data_embarque) || ''} ${isTime(p.hora_embarque) ? formatHMS(p.hora_embarque) : ''}`.trim();
        const sol = `${formatDate(p.data_solta)} ${dayName(p.data_solta) || ''} ${isTime(p.hora_solta) ? formatHMS(p.hora_solta) : ''}`.trim();
        doc.text(`${p.cidade || '—'}  |  KM ${p.km ?? '—'}  |  Embarque: ${emb}  |  Solta: ${sol}`, 14, y);
        y += 7;
      });
      doc.save('itinerario-colombus.pdf');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Itinerário</h2>
          <p className="text-muted-foreground">Rota: Limeira (embarque ~1h) → Ribeirão Preto (+~1h) → Franca (+~1h) → cidade da solta</p>
        </div>
        <div className="flex gap-2 items-center">
          {msg && <span className="text-sm font-medium text-primary">{msg}</span>}
          <Button variant="outline" onClick={exportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button onClick={() => setEditModal({ open: true, prova: null })}><Plus className="mr-2 h-4 w-4" /> Nova Prova</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Embarque (Limeira)</TableHead>
                <TableHead>Solta</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(prova => (
                <TableRow key={prova.id}>
                  <TableCell className="font-medium">{prova.cidade || '—'}</TableCell>
                  <TableCell>{prova.km ?? '—'}</TableCell>
                  <TableCell>
                    <span className="font-medium">{formatDate(prova.data_embarque)}</span>{' '}
                    <span className="text-xs text-muted-foreground">· {dayName(prova.data_embarque) || '—'}</span>
                    <span className="block text-xs text-primary font-semibold">{isTime(prova.hora_embarque) ? formatHMS(prova.hora_embarque) : '—'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatDate(prova.data_solta)}</span>{' '}
                    <span className="text-xs text-muted-foreground">· {dayName(prova.data_solta) || '—'}</span>
                    <span className="block text-xs text-primary font-semibold">{isTime(prova.hora_solta) ? formatHMS(prova.hora_solta) : '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditModal({ open: true, prova })}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Nenhuma prova cadastrada.</TableCell></TableRow>
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
