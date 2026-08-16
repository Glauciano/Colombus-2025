import React from 'react';
import { Plus, Pencil, Trash2, Wallet, Download } from 'lucide-react';
import { db, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import {
  Button, Input, Select, Label, Card,
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  StatCard, ConfirmDelete, PageHeader
} from '../components/ui';

const STATUS_OPTIONS = ['Pendente', 'Pago', 'Atrasado'];
const statusColors = {
  'Pendente': 'bg-amber-50 text-amber-700',
  'Pago': 'bg-emerald-50 text-emerald-700',
  'Atrasado': 'bg-red-50 text-red-700',
};

const emptyItem = { descricao: '', valor: '', data_vencimento: '', status: 'Pendente' };

function ReceivelForm({ item, entity, onSave, onClose }) {
  const [form, setForm] = React.useState(emptyItem);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!item;

  React.useEffect(() => {
    if (item) {
      setForm({
        descricao: item.descricao || '',
        valor: item.valor || '',
        data_vencimento: item.data_vencimento?.slice(0, 10) || '',
        status: item.status || 'Pendente',
      });
    }
  }, [item]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, valor: form.valor !== '' ? Number(form.valor) : 0 };
    if (isEdit) { await db.update(entity, item.id, data); } else { await db.create(entity, data); }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5"><Label>Descrição</Label><Input value={form.descricao} onChange={e => handleChange('descricao', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={e => handleChange('valor', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Data Vencimento</Label><Input type="date" value={form.data_vencimento} onChange={e => handleChange('data_vencimento', e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Status</Label>
            <Select value={form.status} onChange={e => handleChange('status', e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="flex gap-3 justify-end pt-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CCPage({ entity, queryKey, title, subtitle, pdfName }) {
  const [editModal, setEditModal] = React.useState({ open: false, item: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, item: null });
  const { data: items, refresh, isLoading, remove: deleteItem } = useCollection(entity);
  const sorted = [...items].sort((a, b) => (a.data_vencimento || '').localeCompare(b.data_vencimento || ''));

  const totalValor = items.reduce((s, i) => s + (i.valor || 0), 0);
  const totalPago = items.filter(i => i.status === 'Pago').reduce((s, i) => s + (i.valor || 0), 0);
  const totalPendente = items.filter(i => i.status !== 'Pago').reduce((s, i) => s + (i.valor || 0), 0);

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(22, 80, 50);
      doc.rect(0, 0, pageWidth, 18, 'F');
      doc.setFontSize(14); doc.setTextColor(255, 255, 255);
      doc.text(title, 14, 12);
      let y = 30;
      const headers = ['Descrição', 'Valor', 'Vencimento', 'Status'];
      doc.setFontSize(9); doc.setTextColor(100);
      headers.forEach((h, i) => doc.text(h, 14 + i * 45, y));
      y += 8; doc.setTextColor(30);
      sorted.forEach(item => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(item.descricao || '', 14, y);
        doc.text(`R$ ${formatCurrency(item.valor)}`, 59, y);
        doc.text(formatDate(item.data_vencimento), 104, y);
        doc.text(item.status || '', 149, y);
        y += 7;
      });
      doc.save(pdfName);
    });
  };

  const handleDelete = async () => {
    await deleteItem(deleteModal.item.id);
    setDeleteModal({ open: false, item: null });
  };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        <Button variant="outline" onClick={exportPDF}><Download className="w-4 h-4 mr-2" /> PDF</Button>
        <Button onClick={() => setEditModal({ open: true, item: null })}><Plus className="w-4 h-4 mr-2" /> Novo Lançamento</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard icon={Wallet} label="Total" value={`R$ ${formatCurrency(totalValor)}`} />
        <StatCard icon={Wallet} label="Recebido" value={`R$ ${formatCurrency(totalPago)}`} />
        <StatCard icon={Wallet} label="Pendente" value={`R$ ${formatCurrency(totalPendente)}`} accent />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.descricao || '—'}</TableCell>
                <TableCell>R$ {formatCurrency(item.valor)}</TableCell>
                <TableCell>{formatDate(item.data_vencimento)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[item.status] || statusColors['Pendente']}`}>
                    {item.status || 'Pendente'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditModal({ open: true, item })}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9 hover:text-[#dc2626]" onClick={() => setDeleteModal({ open: true, item })}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-14 text-[#9ca3af]">Nenhum lançamento cadastrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {editModal.open && <ReceivelForm item={editModal.item} entity={entity} onSave={() => { setEditModal({ open: false, item: null }); refresh(); }} onClose={() => setEditModal({ open: false, item: null })} />}
      <ConfirmDelete open={deleteModal.open} onClose={() => setDeleteModal({ open: false, item: null })} onConfirm={handleDelete} label={deleteModal.item?.descricao} />
    </div>
  );
}
