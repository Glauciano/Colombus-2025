import React from 'react';
import { Plus, Pencil, Trash2, Download, Truck } from 'lucide-react';
import { db, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';

const emptyCusto = { cidade: '', km: '', combustivel: '', pedagio: '', motorista: '', gta_ajudante: '', seguro_caminhao: '', custo_manutencoes: '', observacao: '' };

function CustoForm({ custo, entity, onSave, onClose }) {
  const [form, setForm] = React.useState(emptyCusto);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!custo;
  React.useEffect(() => {
    if (custo) setForm({ cidade: custo.cidade || custo.descricao || '', km: custo.km || '', combustivel: custo.combustivel || '', pedagio: custo.pedagio || '', motorista: custo.motorista || '', gta_ajudante: custo.gta_ajudante || '', seguro_caminhao: custo.seguro_caminhao || '', custo_manutencoes: custo.custo_manutencoes || '', observacao: custo.observacao || '' });
  }, [custo]);
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    const num = v => v !== '' ? Number(v) : 0;
    const totalGastos = num(form.combustivel) + num(form.pedagio) + num(form.motorista) + num(form.gta_ajudante) + num(form.seguro_caminhao);
    const data = { cidade: form.cidade, km: num(form.km), combustivel: num(form.combustivel), pedagio: num(form.pedagio), motorista: num(form.motorista), gta_ajudante: num(form.gta_ajudante), seguro_caminhao: num(form.seguro_caminhao), custo_manutencoes: num(form.custo_manutencoes), total_gastos: totalGastos, custo_total: totalGastos + num(form.custo_manutencoes), observacao: form.observacao };
    if (isEdit) { await db.update(entity, custo.id, data); } else { await db.create(entity, data); }
    setSaving(false); onSave();
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{isEdit ? 'Editar Custo' : 'Novo Custo'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2"><Label>Cidade</Label><Input value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} /></div>
            <div className="space-y-2"><Label>KM</Label><Input type="number" value={form.km} onChange={e => handleChange('km', e.target.value)} /></div>
            <div className="space-y-2"><Label>Combustível (R$)</Label><Input type="number" step="0.01" value={form.combustivel} onChange={e => handleChange('combustivel', e.target.value)} /></div>
            <div className="space-y-2"><Label>Pedágio (R$)</Label><Input type="number" step="0.01" value={form.pedagio} onChange={e => handleChange('pedagio', e.target.value)} /></div>
            <div className="space-y-2"><Label>Motorista (R$)</Label><Input type="number" step="0.01" value={form.motorista} onChange={e => handleChange('motorista', e.target.value)} /></div>
            <div className="space-y-2"><Label>GTA/Ajudante (R$)</Label><Input type="number" step="0.01" value={form.gta_ajudante} onChange={e => handleChange('gta_ajudante', e.target.value)} /></div>
            <div className="space-y-2"><Label>Seguro Caminhão (R$)</Label><Input type="number" step="0.01" value={form.seguro_caminhao} onChange={e => handleChange('seguro_caminhao', e.target.value)} /></div>
            <div className="space-y-2"><Label>Manutenções (R$)</Label><Input type="number" step="0.01" value={form.custo_manutencoes} onChange={e => handleChange('custo_manutencoes', e.target.value)} /></div>
            <div className="col-span-2 space-y-2"><Label>Observação</Label><Input value={form.observacao} onChange={e => handleChange('observacao', e.target.value)} /></div>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CustosPage({ entity, title, subtitle, pdfName }) {
  const [editModal, setEditModal] = React.useState({ open: false, custo: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, custo: null });
  const { data: custos, refresh, remove: deleteCusto } = useCollection(entity);
  const sorted = [...custos].sort((a, b) => (a.km || 0) - (b.km || 0));
  const totalGeral = custos.reduce((s, c) => s + (c.combustivel||0) + (c.pedagio||0) + (c.motorista||0) + (c.gta_ajudante||0) + (c.seguro_caminhao||0) + (c.custo_manutencoes||0), 0);

  const exportPDF = () => { import('jspdf').then(({ default: jsPDF }) => { const doc = new jsPDF({ orientation: 'landscape' }); doc.text(title, 14, 20); let y = 30; sorted.forEach(c => { if (y > 270) { doc.addPage(); y = 20; } doc.text(`${c.cidade || c.descricao || ''} - KM: ${c.km} - Total: R$ ${formatCurrency((c.combustivel||0)+(c.pedagio||0)+(c.motorista||0)+(c.gta_ajudante||0)+(c.seguro_caminhao||0)+(c.custo_manutencoes||0))}`, 14, y); y += 7; }); doc.save(pdfName); }); };
  const handleDelete = async () => { await deleteCusto(deleteModal.custo.id); setDeleteModal({ open: false, custo: null }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>{title}</h2>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button onClick={() => setEditModal({ open: true, custo: null })}><Plus className="mr-2 h-4 w-4" /> Novo Custo</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Total Geral</CardTitle>
          <div className="text-2xl font-bold text-accent">R$ {formatCurrency(totalGeral)}</div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead><TableHead>KM</TableHead><TableHead>Combustível</TableHead><TableHead>Pedágio</TableHead><TableHead>Motorista</TableHead><TableHead>GTA/Ajudante</TableHead><TableHead>Seguro</TableHead><TableHead>Manutenção</TableHead><TableHead>Total</TableHead><TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(custo => {
                const total = (custo.combustivel||0)+(custo.pedagio||0)+(custo.motorista||0)+(custo.gta_ajudante||0)+(custo.seguro_caminhao||0)+(custo.custo_manutencoes||0);
                return (
                  <TableRow key={custo.id}>
                    <TableCell className="font-medium">{custo.cidade || custo.descricao || '—'}</TableCell>
                    <TableCell>{custo.km || '—'}</TableCell>
                    <TableCell>R$ {formatCurrency(custo.combustivel)}</TableCell>
                    <TableCell>R$ {formatCurrency(custo.pedagio)}</TableCell>
                    <TableCell>R$ {formatCurrency(custo.motorista)}</TableCell>
                    <TableCell>R$ {formatCurrency(custo.gta_ajudante)}</TableCell>
                    <TableCell>R$ {formatCurrency(custo.seguro_caminhao)}</TableCell>
                    <TableCell>R$ {formatCurrency(custo.custo_manutencoes)}</TableCell>
                    <TableCell className="font-semibold">R$ {formatCurrency(total)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditModal({ open: true, custo })}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteModal({ open: true, custo })}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">Nenhum custo cadastrado.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editModal.open && <CustoForm custo={editModal.custo} entity={entity} onSave={() => { setEditModal({ open: false, custo: null }); refresh(); }} onClose={() => setEditModal({ open: false, custo: null })} />}
      <Dialog open={deleteModal.open} onOpenChange={() => setDeleteModal({ open: false, custo: null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle><DialogDescription>Tem certeza? Esta ação não pode ser desfeita.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteModal({ open: false, custo: null })}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
