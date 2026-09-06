import React from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { db, ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const CATEGORIAS = ['Copa Filhotes', 'Campeonato Adultos'];
const STATUS_OPTIONS = ['Programada', 'Em Andamento', 'Concluída', 'Cancelada'];

const statusVariant = {
  'Programada': 'default',
  'Em Andamento': 'secondary',
  'Concluída': 'outline',
  'Cancelada': 'destructive',
};

const emptyProva = {
  cidade: '', km: '', categoria: 'Copa Filhotes',
  data_embarque: '', dia_embarque: '',
  data_solta: '', dia_solta: '',
  valor: '', status: 'Programada'
};

function ProvaForm({ prova, onSave, onClose }) {
  const [form, setForm] = React.useState(emptyProva);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!prova;

  React.useEffect(() => {
    if (prova) {
      setForm({
        cidade: prova.cidade || '', km: prova.km || '',
        categoria: prova.categoria || 'Copa Filhotes',
        data_embarque: prova.data_embarque?.slice(0, 10) || '',
        dia_embarque: prova.dia_embarque || '',
        data_solta: prova.data_solta?.slice(0, 10) || '',
        dia_solta: prova.dia_solta || '',
        valor: prova.valor || '', status: prova.status || 'Programada',
      });
    }
  }, [prova]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, km: form.km !== '' ? Number(form.km) : undefined, valor: form.valor !== '' ? Number(form.valor) : undefined };
    if (isEdit) { await db.update(ENTITIES.PROVA, prova.id, data); } else { await db.create(ENTITIES.PROVA, data); }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Prova' : 'Nova Prova'}</DialogTitle>
          <DialogDescription>Preencha os dados da prova abaixo.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2"><Label>Cidade</Label><Input value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} placeholder="Ex: Igaraçu → Brasília" /></div>
            <div className="space-y-2"><Label>KM</Label><Input type="number" value={form.km} onChange={e => handleChange('km', e.target.value)} /></div>
            <div className="space-y-2"><Label>Categoria</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.categoria} onChange={e => handleChange('categoria', e.target.value)}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Data Embarque</Label><Input type="date" value={form.data_embarque} onChange={e => handleChange('data_embarque', e.target.value)} /></div>
            <div className="space-y-2"><Label>Dia Embarque</Label><Input value={form.dia_embarque} onChange={e => handleChange('dia_embarque', e.target.value)} placeholder="Sexta" /></div>
            <div className="space-y-2"><Label>Data Solta</Label><Input type="date" value={form.data_solta} onChange={e => handleChange('data_solta', e.target.value)} /></div>
            <div className="space-y-2"><Label>Dia Solta</Label><Input value={form.dia_solta} onChange={e => handleChange('dia_solta', e.target.value)} placeholder="Sábado" /></div>
            <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={e => handleChange('valor', e.target.value)} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.status} onChange={e => handleChange('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Provas() {
  const [filter, setFilter] = React.useState('todas');
  const [editModal, setEditModal] = React.useState({ open: false, prova: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, prova: null });
  const { data: provas, refresh, remove: removeProva } = useCollection(ENTITIES.PROVA);
  const filtered = [...(filter === 'todas' ? provas : provas.filter(p => p.categoria === filter))]
    .sort((a, b) => (a.data_solta && b.data_solta) ? new Date(b.data_solta) - new Date(a.data_solta) : 0);

  const handleDelete = async () => { await removeProva(deleteModal.prova.id); setDeleteModal({ open: false, prova: null }); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Provas</h2>
          <p className="text-muted-foreground">Calendário de competições de pombos-correio</p>
        </div>
        <Button onClick={() => setEditModal({ open: true, prova: null })}>
          <Plus className="mr-2 h-4 w-4" /> Nova Prova
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['todas', ...CATEGORIAS].map(cat => (
          <Button key={cat} variant={filter === cat ? 'default' : 'outline'} size="sm" onClick={() => setFilter(cat)}>
            {cat === 'todas' ? 'Todas' : cat}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data Embarque</TableHead>
                <TableHead>Data Solta</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(prova => (
                <TableRow key={prova.id}>
                  <TableCell className="font-medium">{prova.cidade || '—'}</TableCell>
                  <TableCell>{prova.km || '—'}</TableCell>
                  <TableCell><Badge variant="secondary">{prova.categoria}</Badge></TableCell>
                  <TableCell>{formatDate(prova.data_embarque)}</TableCell>
                  <TableCell>{formatDate(prova.data_solta)}</TableCell>
                  <TableCell>{prova.valor ? `R$ ${formatCurrency(prova.valor)}` : '—'}</TableCell>
                  <TableCell><Badge variant={statusVariant[prova.status] || 'default'}>{prova.status || 'Programada'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditModal({ open: true, prova })}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteModal({ open: true, prova })}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Nenhuma prova cadastrada.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editModal.open && <ProvaForm prova={editModal.prova} onSave={() => { setEditModal({ open: false, prova: null }); refresh(); }} onClose={() => setEditModal({ open: false, prova: null })} />}

      {/* Delete confirm */}
      <Dialog open={deleteModal.open} onOpenChange={() => setDeleteModal({ open: false, prova: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>Tem certeza que deseja excluir{deleteModal.prova ? ` "${deleteModal.prova.cidade}"` : ''}? Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, prova: null })}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
