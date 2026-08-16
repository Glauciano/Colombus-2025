import React from 'react';
import { Plus, Pencil, Trash2, Download } from 'lucide-react';
import { db, ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import {
  Button, Input, Select, Label, Card,
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Badge, ConfirmDelete, PageHeader, FilterTabs
} from '../components/ui';

const CATEGORIAS = ['Copa Filhotes', 'Campeonato Adultos'];
const STATUS_OPTIONS = ['Programada', 'Em Andamento', 'Concluída', 'Cancelada'];

const statusColors = {
  'Programada': 'bg-blue-50 text-blue-700',
  'Em Andamento': 'bg-amber-50 text-amber-700',
  'Concluída': 'bg-emerald-50 text-emerald-700',
  'Cancelada': 'bg-red-50 text-red-700',
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
        cidade: prova.cidade || '',
        km: prova.km || '',
        categoria: prova.categoria || 'Copa Filhotes',
        data_embarque: prova.data_embarque?.slice(0, 10) || '',
        dia_embarque: prova.dia_embarque || '',
        data_solta: prova.data_solta?.slice(0, 10) || '',
        dia_solta: prova.dia_solta || '',
        valor: prova.valor || '',
        status: prova.status || 'Programada',
      });
    }
  }, [prova]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      km: form.km !== '' ? Number(form.km) : undefined,
      valor: form.valor !== '' ? Number(form.valor) : undefined,
    };
    if (isEdit) {
      await db.update(ENTITIES.PROVA, prova.id, data);
    } else {
      await db.create(ENTITIES.PROVA, data);
    }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar Prova' : 'Nova Prova'}</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} placeholder="Ex: Igaraçu → Brasília" />
            </div>
            <div className="space-y-1.5">
              <Label>KM</Label>
              <Input type="number" value={form.km} onChange={e => handleChange('km', e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={form.categoria} onChange={e => handleChange('categoria', e.target.value)}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data Embarque</Label>
              <Input type="date" value={form.data_embarque} onChange={e => handleChange('data_embarque', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Dia Embarque</Label>
              <Input value={form.dia_embarque} onChange={e => handleChange('dia_embarque', e.target.value)} placeholder="Ex: Sexta" />
            </div>
            <div className="space-y-1.5">
              <Label>Data Solta</Label>
              <Input type="date" value={form.data_solta} onChange={e => handleChange('data_solta', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Dia Solta</Label>
              <Input value={form.dia_solta} onChange={e => handleChange('dia_solta', e.target.value)} placeholder="Ex: Sábado" />
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={form.valor} onChange={e => handleChange('valor', e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
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

export default function Provas() {
  const [filter, setFilter] = React.useState('todas');
  const [editModal, setEditModal] = React.useState({ open: false, prova: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, prova: null });

  const { data: provas, refresh, remove: removeProva } = useCollection(ENTITIES.PROVA);
  const filtered = [...(filter === 'todas' ? provas : provas.filter(p => p.categoria === filter))]
    .sort((a, b) => (a.data_solta && b.data_solta) ? new Date(b.data_solta) - new Date(a.data_solta) : 0);

  const handleDelete = async () => {
    await removeProva(deleteModal.prova.id);
    setDeleteModal({ open: false, prova: null });
  };

  const filterOptions = [
    { value: 'todas', label: 'Todas' },
    ...CATEGORIAS.map(c => ({ value: c, label: c }))
  ];

  return (
    <div>
      <PageHeader title="Provas" subtitle="Calendário de competições">
        <Button onClick={() => setEditModal({ open: true, prova: null })}>
          <Plus className="w-4 h-4 mr-2" /> Nova Prova
        </Button>
      </PageHeader>

      <FilterTabs options={filterOptions} active={filter} onChange={setFilter} />

      <Card>
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
              <TableHead className="w-24"></TableHead>
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
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[prova.status] || statusColors['Programada']}`}>
                    {prova.status || 'Programada'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setEditModal({ open: true, prova })}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-9 w-9 hover:text-[#dc2626]" onClick={() => setDeleteModal({ open: true, prova })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-14 text-[#9ca3af]">Nenhuma prova cadastrada</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {editModal.open && (
        <ProvaForm
          prova={editModal.prova}
          onSave={() => { setEditModal({ open: false, prova: null }); refresh(); }}
          onClose={() => setEditModal({ open: false, prova: null })}
        />
      )}
      <ConfirmDelete
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, prova: null })}
        onConfirm={handleDelete}
        label={deleteModal.prova?.cidade}
      />
    </div>
  );
}
