import React from 'react';
import { Plus, Pencil, Trash2, Users, Download } from 'lucide-react';
import { db, ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import {
  Button, Input, Label, Card,
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  StatCard, ConfirmDelete, Badge, PageHeader
} from '../components/ui';

const PARCELAS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const emptySocio = () => {
  const obj = { nome: '', telefone: '', email: '', observacao: '' };
  PARCELAS.forEach(i => {
    obj[`parcela_${i}`] = '';
    obj[`data_parcela_${i}`] = '';
    obj[`pago_parcela_${i}`] = false;
  });
  return obj;
};

const getTotalParcelas = (socio) => PARCELAS.reduce((sum, i) => sum + (socio[`parcela_${i}`] || 0), 0);
const getTotalPago = (socio) => PARCELAS.reduce((sum, i) => socio[`pago_parcela_${i}`] ? sum + (socio[`parcela_${i}`] || 0) : sum, 0);

function SocioForm({ socio, onSave, onClose }) {
  const [form, setForm] = React.useState(emptySocio);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!socio;

  React.useEffect(() => {
    if (socio) {
      const base = emptySocio();
      setForm({ ...base, ...socio });
    }
  }, [socio]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form };
    PARCELAS.forEach(i => {
      data[`parcela_${i}`] = parseFloat(form[`parcela_${i}`]) || 0;
      data[`pago_parcela_${i}`] = form[`pago_parcela_${i}`] || false;
    });
    if (isEdit) { await db.update(ENTITIES.SOCIO_LIMEIRA, socio.id, data); } else { await db.create(ENTITIES.SOCIO_LIMEIRA, data); }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar Sócio' : 'Novo Sócio'}</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>Nome</Label><Input value={form.nome} onChange={e => handleChange('nome', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Telefone</Label><Input value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} /></div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#12211c] mb-3">Parcelas</h4>
            <div className="space-y-2.5">
              {PARCELAS.map(i => (
                <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center">
                  <span className="text-xs font-medium text-[#6b8a7e] w-6">{i}ª</span>
                  <Input type="number" step="0.01" placeholder="Valor" value={form[`parcela_${i}`] || ''} onChange={e => handleChange(`parcela_${i}`, e.target.value)} className="h-9 text-sm" />
                  <Input type="date" value={form[`data_parcela_${i}`]?.slice(0, 10) || ''} onChange={e => handleChange(`data_parcela_${i}`, e.target.value)} className="h-9 text-sm" />
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={form[`pago_parcela_${i}`] || false} onChange={e => handleChange(`pago_parcela_${i}`, e.target.checked)} className="accent-[#1a5c3d] w-4 h-4" />
                    <span className="text-xs text-[#6b8a7e]">Pago</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1.5"><Label>Observação</Label><Input value={form.observacao} onChange={e => handleChange('observacao', e.target.value)} /></div>
          <div className="flex gap-3 justify-end pt-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CCLimeira() {
  const [editModal, setEditModal] = React.useState({ open: false, socio: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, socio: null });
  const { data: socios, refresh, isLoading, remove: deleteSocio } = useCollection(ENTITIES.SOCIO_LIMEIRA);
  const sorted = [...socios].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

  const totalGeral = socios.reduce((s, soc) => s + getTotalParcelas(soc), 0);
  const totalPago = socios.reduce((s, soc) => s + getTotalPago(soc), 0);
  const totalPendente = totalGeral - totalPago;

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(22, 80, 50);
      doc.rect(0, 0, pageWidth, 18, 'F');
      doc.setFontSize(14); doc.setTextColor(255, 255, 255);
      doc.text('Conta Corrente Limeira - Sócios', 14, 12);
      let y = 30;
      doc.setFontSize(9); doc.setTextColor(100);
      ['Nome', 'Telefone', 'Total', 'Pago', 'Pendente'].forEach((h, i) => doc.text(h, 14 + i * 50, y));
      y += 8; doc.setTextColor(30);
      sorted.forEach(soc => {
        if (y > 190) { doc.addPage(); y = 20; }
        const total = getTotalParcelas(soc);
        const pago = getTotalPago(soc);
        doc.text(soc.nome || '', 14, y);
        doc.text(soc.telefone || '', 64, y);
        doc.text(`R$ ${formatCurrency(total)}`, 114, y);
        doc.text(`R$ ${formatCurrency(pago)}`, 164, y);
        doc.text(`R$ ${formatCurrency(total - pago)}`, 214, y);
        y += 7;
      });
      doc.save('cc-limeira-socios.pdf');
    });
  };

  const handleDelete = async () => {
    await deleteSocio(deleteModal.socio.id);
    setDeleteModal({ open: false, socio: null });
  };

  return (
    <div>
      <PageHeader title="Conta Corrente Limeira" subtitle="Gestão de sócios e parcelas">
        <Button variant="outline" onClick={exportPDF}><Download className="w-4 h-4 mr-2" /> PDF</Button>
        <Button onClick={() => setEditModal({ open: true, socio: null })}><Plus className="w-4 h-4 mr-2" /> Novo Sócio</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon={Users} label="Total Geral" value={`R$ ${formatCurrency(totalGeral)}`} />
        <StatCard icon={Users} label="Total Pago" value={`R$ ${formatCurrency(totalPago)}`} />
        <StatCard icon={Users} label="Total Pendente" value={`R$ ${formatCurrency(totalPendente)}`} accent />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pago</TableHead>
              <TableHead>Pendente</TableHead>
              <TableHead>Parcelas Pagas</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(socio => {
              const total = getTotalParcelas(socio);
              const pago = getTotalPago(socio);
              const parcelasPagas = PARCELAS.filter(i => socio[`pago_parcela_${i}`] && socio[`parcela_${i}`]).length;
              const parcelasTotal = PARCELAS.filter(i => socio[`parcela_${i}`]).length;
              return (
                <TableRow key={socio.id}>
                  <TableCell className="font-medium">{socio.nome || '—'}</TableCell>
                  <TableCell>{socio.telefone || '—'}</TableCell>
                  <TableCell>R$ {formatCurrency(total)}</TableCell>
                  <TableCell>R$ {formatCurrency(pago)}</TableCell>
                  <TableCell className={total - pago > 0 ? 'text-[#dc2626] font-semibold' : 'text-[#1a5c3d] font-semibold'}>
                    R$ {formatCurrency(total - pago)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={parcelasPagas === parcelasTotal && parcelasTotal > 0 ? 'success' : 'warning'}>
                      {parcelasPagas}/{parcelasTotal}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditModal({ open: true, socio })}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 hover:text-[#dc2626]" onClick={() => setDeleteModal({ open: true, socio })}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-14 text-[#9ca3af]">Nenhum sócio cadastrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {editModal.open && <SocioForm socio={editModal.socio} onSave={() => { setEditModal({ open: false, socio: null }); refresh(); }} onClose={() => setEditModal({ open: false, socio: null })} />}
      <ConfirmDelete open={deleteModal.open} onClose={() => setDeleteModal({ open: false, socio: null })} onConfirm={handleDelete} label={deleteModal.socio?.nome} />
    </div>
  );
}
