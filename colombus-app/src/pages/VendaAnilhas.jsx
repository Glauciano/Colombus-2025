import React from 'react';
import { Plus, Pencil, Trash2, CircleDot, Download, Search } from 'lucide-react';
import { db, ENTITIES, formatCurrency, formatDate } from '../lib/db';
import {
  Button, Input, Select, Label, Card, CardHeader, CardTitle, CardContent,
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  StatCard, ConfirmDelete, Badge
} from '../components/ui';

// Helper to format anilha number (e.g., "0000001/26")
function formatAnilha(num, ano) {
  return String(num).padStart(7, '0') + '/' + String(ano).slice(-2);
}

// Parse anilha string "0000001/26" -> { num: 1, ano: 2026 }
function parseAnilha(str) {
  if (!str) return null;
  const parts = str.split('/');
  return { num: parseInt(parts[0], 10), ano: parseInt(parts[1], 10) };
}

const emptyVenda = {
  socio: '', numero_inicio: '', numero_fim: '', ano: new Date().getFullYear(),
  valor_unitario: '', valor_total: '', data_venda: '', status: 'Disponível',
  observacao: ''
};

const STATUS_OPTIONS = ['Disponível', 'Reservado', 'Vendido', 'Devolvido'];
const statusColors = {
  'Disponível': 'bg-blue-100 text-blue-800 border border-blue-200',
  'Reservado': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'Vendido': 'bg-green-100 text-green-800 border border-green-200',
  'Devolvido': 'bg-red-100 text-red-800 border border-red-200',
};

function VendaForm({ venda, onSave, onClose }) {
  const [form, setForm] = React.useState(emptyVenda);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!venda;

  React.useEffect(() => {
    if (venda) {
      setForm({
        socio: venda.socio || '',
        numero_inicio: venda.numero_inicio || '',
        numero_fim: venda.numero_fim || '',
        ano: venda.ano || new Date().getFullYear(),
        valor_unitario: venda.valor_unitario || '',
        valor_total: venda.valor_total || '',
        data_venda: venda.data_venda?.slice(0, 10) || '',
        status: venda.status || 'Disponível',
        observacao: venda.observacao || '',
      });
    }
  }, [venda]);

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate total when unit value or range changes
      if (['valor_unitario', 'numero_inicio', 'numero_fim'].includes(field)) {
        const inicio = field === 'numero_inicio' ? Number(value) : Number(updated.numero_inicio);
        const fim = field === 'numero_fim' ? Number(value) : Number(updated.numero_fim);
        const vUnit = field === 'valor_unitario' ? Number(value) : Number(updated.valor_unitario);
        if (inicio && fim && fim >= inicio && vUnit) {
          const qtd = fim - inicio + 1;
          updated.valor_total = (qtd * vUnit).toFixed(2);
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    const num = v => v !== '' ? Number(v) : 0;
    const data = {
      socio: form.socio,
      numero_inicio: form.numero_inicio,
      numero_fim: form.numero_fim,
      ano: Number(form.ano),
      valor_unitario: num(form.valor_unitario),
      valor_total: num(form.valor_total),
      data_venda: form.data_venda,
      status: form.status,
      observacao: form.observacao,
    };
    // Auto-calc total if not set
    if (!data.valor_total && data.valor_unitario && data.numero_inicio && data.numero_fim) {
      const qtd = Number(data.numero_fim) - Number(data.numero_inicio) + 1;
      data.valor_total = qtd * data.valor_unitario;
    }
    if (isEdit) {
      db.update(ENTITIES.VENDA_ANILHA, venda.id, data);
    } else {
      db.create(ENTITIES.VENDA_ANILHA, data);
    }
    setSaving(false);
    onSave();
  };

  const qtd = form.numero_inicio && form.numero_fim && Number(form.numero_fim) >= Number(form.numero_inicio)
    ? Number(form.numero_fim) - Number(form.numero_inicio) + 1
    : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar Venda' : 'Nova Venda de Anilhas'}</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Sócio / Comprador</Label>
            <Input value={form.socio} onChange={e => handleChange('socio', e.target.value)} placeholder="Nome do sócio" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Nº Início</Label>
              <Input
                type="number"
                value={form.numero_inicio}
                onChange={e => handleChange('numero_inicio', e.target.value)}
                placeholder="Ex: 1"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nº Fim</Label>
              <Input
                type="number"
                value={form.numero_fim}
                onChange={e => handleChange('numero_fim', e.target.value)}
                placeholder="Ex: 50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input
                type="number"
                value={form.ano}
                onChange={e => handleChange('ano', e.target.value)}
              />
            </div>
          </div>

          {/* Preview of range */}
          {qtd > 0 && (
            <div className="p-3 rounded-lg bg-muted text-sm">
              <span className="text-muted-foreground">Faixa: </span>
              <span className="font-mono font-semibold">
                {formatAnilha(Number(form.numero_inicio), form.ano)}
              </span>
              <span className="text-muted-foreground"> até </span>
              <span className="font-mono font-semibold">
                {formatAnilha(Number(form.numero_fim), form.ano)}
              </span>
              <span className="text-muted-foreground ml-2">({qtd} anilhas)</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Valor Unitário (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.valor_unitario}
                onChange={e => handleChange('valor_unitario', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valor Total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.valor_total}
                onChange={e => handleChange('valor_total', e.target.value)}
                placeholder="Auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data da Venda</Label>
              <Input
                type="date"
                value={form.data_venda}
                onChange={e => handleChange('data_venda', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observação</Label>
            <Input value={form.observacao} onChange={e => handleChange('observacao', e.target.value)} />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function VendaAnilhas() {
  const [editModal, setEditModal] = React.useState({ open: false, venda: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, venda: null });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('todos');
  const [, forceUpdate] = React.useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const vendas = db.list(ENTITIES.VENDA_ANILHA);
  const filtered = vendas
    .filter(v => {
      if (statusFilter !== 'todos' && v.status !== statusFilter) return false;
      if (searchTerm && !(v.socio || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (a.ano || 0) - (b.ano || 0) || (Number(a.numero_inicio) || 0) - (Number(b.numero_inicio) || 0));

  const totalAnilhas = vendas.reduce((s, v) => {
    const inicio = Number(v.numero_inicio) || 0;
    const fim = Number(v.numero_fim) || 0;
    return s + (fim >= inicio ? fim - inicio + 1 : 0);
  }, 0);

  const totalValor = vendas.reduce((s, v) => s + (v.valor_total || 0), 0);
  const totalVendido = vendas.filter(v => v.status === 'Vendido').reduce((s, v) => s + (v.valor_total || 0), 0);
  const totalDisponivel = vendas.filter(v => v.status === 'Disponível').reduce((s, v) => s + (v.valor_total || 0), 0);

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFillColor(22, 80, 50);
      doc.rect(0, 0, pageWidth, 18, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('Vendas de Anilhas - Colombus 2025', 14, 12);

      let y = 30;
      const headers = ['Sócio', 'Faixa', 'Ano', 'Qtd', 'Valor Unit.', 'Valor Total', 'Status'];
      doc.setFontSize(9);
      doc.setTextColor(100);
      const colX = [14, 64, 120, 140, 155, 185, 215];
      headers.forEach((h, i) => doc.text(h, colX[i], y));
      y += 8;
      doc.setTextColor(30);

      filtered.forEach(v => {
        if (y > 190) { doc.addPage(); y = 20; }
        const inicio = Number(v.numero_inicio) || 0;
        const fim = Number(v.numero_fim) || 0;
        const qtd = fim >= inicio ? fim - inicio + 1 : 0;
        doc.text(v.socio || '', colX[0], y);
        doc.text(`${formatAnilha(inicio, v.ano)} - ${formatAnilha(fim, v.ano)}`, colX[1], y);
        doc.text(String(v.ano || ''), colX[2], y);
        doc.text(String(qtd), colX[3], y);
        doc.text(`R$ ${formatCurrency(v.valor_unitario)}`, colX[4], y);
        doc.text(`R$ ${formatCurrency(v.valor_total)}`, colX[5], y);
        doc.text(v.status || '', colX[6], y);
        y += 7;
      });
      doc.save('vendas-anilhas.pdf');
    });
  };

  const handleDelete = () => {
    db.delete(ENTITIES.VENDA_ANILHA, deleteModal.venda.id);
    setDeleteModal({ open: false, venda: null });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(160 45% 22%)' }}>
            Vendas de Anilhas
          </h1>
          <p className="text-sm text-muted-foreground">Controle de vendas de anilhas por sócio</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => setEditModal({ open: true, venda: null })}>
            <Plus className="w-4 h-4 mr-2" /> Nova Venda
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CircleDot} label="Total de Anilhas" value={totalAnilhas.toLocaleString('pt-BR')} />
        <StatCard icon={CircleDot} label="Valor Total" value={`R$ ${formatCurrency(totalValor)}`} accent />
        <StatCard icon={CircleDot} label="Vendido" value={`R$ ${formatCurrency(totalVendido)}`} />
        <StatCard icon={CircleDot} label="Disponível" value={`R$ ${formatCurrency(totalDisponivel)}`} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar sócio..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['todos', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              {s === 'todos' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sócio</TableHead>
              <TableHead>Faixa de Anilhas</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Valor Unit.</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(venda => {
              const inicio = Number(venda.numero_inicio) || 0;
              const fim = Number(venda.numero_fim) || 0;
              const qtd = fim >= inicio ? fim - inicio + 1 : 0;
              return (
                <TableRow key={venda.id}>
                  <TableCell className="font-medium">{venda.socio || '—'}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {formatAnilha(inicio, venda.ano)} → {formatAnilha(fim, venda.ano)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{qtd}</Badge>
                  </TableCell>
                  <TableCell>R$ {formatCurrency(venda.valor_unitario)}</TableCell>
                  <TableCell className="font-semibold">R$ {formatCurrency(venda.valor_total)}</TableCell>
                  <TableCell>{formatDate(venda.data_venda)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[venda.status] || ''}`}>
                      {venda.status || 'Disponível'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditModal({ open: true, venda })}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteModal({ open: true, venda })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhuma venda cadastrada</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {editModal.open && (
        <VendaForm
          venda={editModal.venda}
          onSave={() => { setEditModal({ open: false, venda: null }); refresh(); }}
          onClose={() => setEditModal({ open: false, venda: null })}
        />
      )}
      <ConfirmDelete
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, venda: null })}
        onConfirm={handleDelete}
        label={deleteModal.venda?.socio}
      />
    </div>
  );
}
