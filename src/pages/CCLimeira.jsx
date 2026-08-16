import React from 'react';
import { Plus, Pencil, Trash2, Download, Users } from 'lucide-react';
import { db, ENTITIES, formatCurrency } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const PARCELAS = [1,2,3,4,5,6,7,8,9,10];
const emptySocio = () => { const obj = { nome: '', telefone: '', email: '', observacao: '' }; PARCELAS.forEach(i => { obj[`parcela_${i}`] = ''; obj[`data_parcela_${i}`] = ''; obj[`pago_parcela_${i}`] = false; }); return obj; };
const getTotalParcelas = (s) => PARCELAS.reduce((sum, i) => sum + (s[`parcela_${i}`] || 0), 0);
const getTotalPago = (s) => PARCELAS.reduce((sum, i) => s[`pago_parcela_${i}`] ? sum + (s[`parcela_${i}`] || 0) : sum, 0);

function SocioForm({ socio, onSave, onClose }) {
  const [form, setForm] = React.useState(emptySocio);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!socio;
  React.useEffect(() => { if (socio) setForm({ ...emptySocio(), ...socio }); }, [socio]);
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const data = { ...form }; PARCELAS.forEach(i => { data[`parcela_${i}`] = parseFloat(form[`parcela_${i}`]) || 0; data[`pago_parcela_${i}`] = form[`pago_parcela_${i}`] || false; });
    if (isEdit) { await db.update(ENTITIES.SOCIO_LIMEIRA, socio.id, data); } else { await db.create(ENTITIES.SOCIO_LIMEIRA, data); }
    setSaving(false); onSave();
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? 'Editar Sócio' : 'Novo Sócio'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={form.nome} onChange={e => handleChange('nome', e.target.value)} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} /></div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">Parcelas</h4>
            <div className="space-y-2">
              {PARCELAS.map(i => (
                <div key={i} className="grid grid-cols-[40px_1fr_1fr_60px] gap-2 items-center">
                  <span className="text-xs text-muted-foreground">{i}ª</span>
                  <Input type="number" step="0.01" placeholder="Valor" value={form[`parcela_${i}`] || ''} onChange={e => handleChange(`parcela_${i}`, e.target.value)} className="h-8" />
                  <Input type="date" value={form[`data_parcela_${i}`]?.slice(0, 10) || ''} onChange={e => handleChange(`data_parcela_${i}`, e.target.value)} className="h-8" />
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={form[`pago_parcela_${i}`] || false} onChange={e => handleChange(`pago_parcela_${i}`, e.target.checked)} className="accent-primary" /><span className="text-xs">Pago</span></label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2"><Label>Observação</Label><Input value={form.observacao} onChange={e => handleChange('observacao', e.target.value)} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CCLimeira() {
  const [editModal, setEditModal] = React.useState({ open: false, socio: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, socio: null });
  const { data: socios, refresh, remove: deleteSocio } = useCollection(ENTITIES.SOCIO_LIMEIRA);
  const sorted = [...socios].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  const totalGeral = socios.reduce((s, soc) => s + getTotalParcelas(soc), 0);
  const totalPago = socios.reduce((s, soc) => s + getTotalPago(soc), 0);
  const handleDelete = async () => { await deleteSocio(deleteModal.socio.id); setDeleteModal({ open: false, socio: null }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Recebíveis Sócios — Limeira</h2>
          <p className="text-muted-foreground">Gestão de sócios e parcelas</p>
        </div>
        <Button onClick={() => setEditModal({ open: true, socio: null })}><Plus className="mr-2 h-4 w-4" /> Novo Sócio</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Geral</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">R$ {formatCurrency(totalGeral)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pago</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {formatCurrency(totalPago)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pendente</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-accent">R$ {formatCurrency(totalGeral - totalPago)}</div></CardContent></Card>
      </div>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Telefone</TableHead><TableHead>Total</TableHead><TableHead>Pago</TableHead><TableHead>Pendente</TableHead><TableHead>Parcelas</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
          <TableBody>
            {sorted.map(socio => {
              const total = getTotalParcelas(socio); const pago = getTotalPago(socio);
              const pp = PARCELAS.filter(i => socio[`pago_parcela_${i}`] && socio[`parcela_${i}`]).length;
              const pt = PARCELAS.filter(i => socio[`parcela_${i}`]).length;
              return (
                <TableRow key={socio.id}>
                  <TableCell className="font-medium">{socio.nome || '—'}</TableCell>
                  <TableCell>{socio.telefone || '—'}</TableCell>
                  <TableCell>R$ {formatCurrency(total)}</TableCell>
                  <TableCell>R$ {formatCurrency(pago)}</TableCell>
                  <TableCell className="font-semibold">R$ {formatCurrency(total - pago)}</TableCell>
                  <TableCell><Badge variant={pp === pt && pt > 0 ? 'default' : 'secondary'}>{pp}/{pt}</Badge></TableCell>
                  <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditModal({ open: true, socio })}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteModal({ open: true, socio })}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Nenhum sócio.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent></Card>

      {editModal.open && <SocioForm socio={editModal.socio} onSave={() => { setEditModal({ open: false, socio: null }); refresh(); }} onClose={() => setEditModal({ open: false, socio: null })} />}
      <Dialog open={deleteModal.open} onOpenChange={() => setDeleteModal({ open: false, socio: null })}>
        <DialogContent><DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader>
        <DialogFooter><Button variant="outline" onClick={() => setDeleteModal({ open: false, socio: null })}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}
