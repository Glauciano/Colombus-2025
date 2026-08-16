import React from 'react';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { db, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const STATUS_OPTIONS = ['Pendente', 'Pago', 'Atrasado'];
const statusVariant = { 'Pendente': 'secondary', 'Pago': 'default', 'Atrasado': 'destructive' };
const emptyItem = { descricao: '', valor: '', data_vencimento: '', status: 'Pendente' };

function ReceivelForm({ item, entity, onSave, onClose }) {
  const [form, setForm] = React.useState(emptyItem);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!item;
  React.useEffect(() => { if (item) setForm({ descricao: item.descricao || '', valor: item.valor || '', data_vencimento: item.data_vencimento?.slice(0, 10) || '', status: item.status || 'Pendente' }); }, [item]);
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const data = { ...form, valor: form.valor !== '' ? Number(form.valor) : 0 };
    if (isEdit) { await db.update(entity, item.id, data); } else { await db.create(entity, data); }
    setSaving(false); onSave();
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>{isEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Descrição</Label><Input value={form.descricao} onChange={e => handleChange('descricao', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={e => handleChange('valor', e.target.value)} /></div>
            <div className="space-y-2"><Label>Vencimento</Label><Input type="date" value={form.data_vencimento} onChange={e => handleChange('data_vencimento', e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Status</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={e => handleChange('status', e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CCPage({ entity, queryKey, title, subtitle, pdfName }) {
  const [editModal, setEditModal] = React.useState({ open: false, item: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, item: null });
  const { data: items, refresh, remove: deleteItem } = useCollection(entity);
  const sorted = [...items].sort((a, b) => (a.data_vencimento || '').localeCompare(b.data_vencimento || ''));
  const totalValor = items.reduce((s, i) => s + (i.valor || 0), 0);
  const totalPago = items.filter(i => i.status === 'Pago').reduce((s, i) => s + (i.valor || 0), 0);
  const totalPendente = items.filter(i => i.status !== 'Pago').reduce((s, i) => s + (i.valor || 0), 0);

  const handleDelete = async () => { await deleteItem(deleteModal.item.id); setDeleteModal({ open: false, item: null }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { import('jspdf').then(({ default: jsPDF }) => { const doc = new jsPDF(); doc.text(title, 14, 20); let y=30; sorted.forEach(i => { doc.text(`${i.descricao} - R$ ${formatCurrency(i.valor)} - ${i.status}`, 14, y); y+=7; }); doc.save(pdfName); }); }}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button onClick={() => setEditModal({ open: true, item: null })}><Plus className="mr-2 h-4 w-4" /> Novo Lançamento</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {formatCurrency(totalValor)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Recebido</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {formatCurrency(totalPago)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pendente</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-accent">R$ {formatCurrency(totalPendente)}</div></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
          <TableBody>
            {sorted.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.descricao || '—'}</TableCell>
                <TableCell>R$ {formatCurrency(item.valor)}</TableCell>
                <TableCell>{formatDate(item.data_vencimento)}</TableCell>
                <TableCell><Badge variant={statusVariant[item.status] || 'secondary'}>{item.status || 'Pendente'}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditModal({ open: true, item })}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteModal({ open: true, item })}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Nenhum lançamento.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>

      {editModal.open && <ReceivelForm item={editModal.item} entity={entity} onSave={() => { setEditModal({ open: false, item: null }); refresh(); }} onClose={() => setEditModal({ open: false, item: null })} />}
      <Dialog open={deleteModal.open} onOpenChange={() => setDeleteModal({ open: false, item: null })}>
        <DialogContent><DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle><DialogDescription>Tem certeza? Esta ação não pode ser desfeita.</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline" onClick={() => setDeleteModal({ open: false, item: null })}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
