import React from 'react';
import { Plus, Pencil, Trash2, Download, Truck } from 'lucide-react';
import { db, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import {
  Button, Input, Label, Card, CardHeader, CardTitle, CardContent,
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogClose,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  StatCard, ConfirmDelete
} from '../components/ui';

const emptyCusto = {
  cidade: '', km: '', combustivel: '', pedagio: '',
  motorista: '', gta_ajudante: '', seguro_caminhao: '',
  custo_manutencoes: '', observacao: ''
};

function CustoForm({ custo, entity, onSave, onClose }) {
  const [form, setForm] = React.useState(emptyCusto);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!custo;

  React.useEffect(() => {
    if (custo) {
      setForm({
        cidade: custo.cidade || custo.descricao || '',
        km: custo.km || '',
        combustivel: custo.combustivel || '',
        pedagio: custo.pedagio || '',
        motorista: custo.motorista || '',
        gta_ajudante: custo.gta_ajudante || '',
        seguro_caminhao: custo.seguro_caminhao || '',
        custo_manutencoes: custo.custo_manutencoes || '',
        observacao: custo.observacao || '',
      });
    }
  }, [custo]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const num = v => v !== '' ? Number(v) : 0;
    const totalGastos = num(form.combustivel) + num(form.pedagio) + num(form.motorista) + num(form.gta_ajudante) + num(form.seguro_caminhao);
    const custoTotal = totalGastos + num(form.custo_manutencoes);
    const data = {
      cidade: form.cidade,
      km: num(form.km),
      combustivel: num(form.combustivel),
      pedagio: num(form.pedagio),
      motorista: num(form.motorista),
      gta_ajudante: num(form.gta_ajudante),
      seguro_caminhao: num(form.seguro_caminhao),
      custo_manutencoes: num(form.custo_manutencoes),
      total_gastos: totalGastos,
      custo_total: custoTotal,
      observacao: form.observacao,
    };
    if (isEdit) {
      await db.update(entity, custo.id, data);
    } else {
      await db.create(entity, data);
    }
    setSaving(false);
    onSave();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Editar Custo' : 'Novo Custo'}</DialogTitle>
        <DialogClose onClose={onClose} />
      </DialogHeader>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>KM</Label>
              <Input type="number" value={form.km} onChange={e => handleChange('km', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Combustível (R$)</Label>
              <Input type="number" step="0.01" value={form.combustivel} onChange={e => handleChange('combustivel', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Pedágio (R$)</Label>
              <Input type="number" step="0.01" value={form.pedagio} onChange={e => handleChange('pedagio', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Motorista (R$)</Label>
              <Input type="number" step="0.01" value={form.motorista} onChange={e => handleChange('motorista', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>GTA/Ajudante (R$)</Label>
              <Input type="number" step="0.01" value={form.gta_ajudante} onChange={e => handleChange('gta_ajudante', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Seguro Caminhão (R$)</Label>
              <Input type="number" step="0.01" value={form.seguro_caminhao} onChange={e => handleChange('seguro_caminhao', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Custo Manutenções (R$)</Label>
              <Input type="number" step="0.01" value={form.custo_manutencoes} onChange={e => handleChange('custo_manutencoes', e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Observação</Label>
              <Input value={form.observacao} onChange={e => handleChange('observacao', e.target.value)} />
            </div>
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

export default function CustosPage({ entity, title, subtitle, pdfName }) {
  const [editModal, setEditModal] = React.useState({ open: false, custo: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, custo: null });
  const { data: custos, refresh, isLoading, remove: deleteCusto } = useCollection(entity);
  const sorted = [...custos].sort((a, b) => (a.km || 0) - (b.km || 0));

  const totalCombustivel = custos.reduce((s, c) => s + (c.combustivel || 0), 0);
  const totalPedagio = custos.reduce((s, c) => s + (c.pedagio || 0), 0);
  const totalMotorista = custos.reduce((s, c) => s + (c.motorista || 0), 0);
  const totalSeguro = custos.reduce((s, c) => s + (c.seguro_caminhao || 0), 0);
  const totalGta = custos.reduce((s, c) => s + (c.gta_ajudante || 0), 0);
  const totalManut = custos.reduce((s, c) => s + (c.custo_manutencoes || 0), 0);
  const totalGeral = totalCombustivel + totalPedagio + totalMotorista + totalGta + totalSeguro + totalManut;

  const exportPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF({ orientation: 'landscape' });
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFillColor(22, 80, 50);
      doc.rect(0, 0, pageWidth, 18, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(title, 14, 12);
      
      // Table header
      let y = 28;
      const headers = ['Cidade', 'KM', 'Combustível', 'Pedágio', 'Motorista', 'GTA/Ajud.', 'Seguro', 'Manutenção', 'Total'];
      doc.setFontSize(9);
      doc.setTextColor(100);
      headers.forEach((h, i) => doc.text(h, 14 + i * 28, y));
      y += 8;

      // Rows
      doc.setTextColor(30);
      sorted.forEach(c => {
        if (y > 190) { doc.addPage(); y = 20; }
        const row = [
          c.cidade || c.descricao || '', String(c.km || ''),
          formatCurrency(c.combustivel), formatCurrency(c.pedagio),
          formatCurrency(c.motorista), formatCurrency(c.gta_ajudante),
          formatCurrency(c.seguro_caminhao), formatCurrency(c.custo_manutencoes),
          formatCurrency(c.custo_total)
        ];
        row.forEach((v, i) => doc.text(String(v), 14 + i * 28, y));
        y += 7;
      });

      doc.save(pdfName);
    });
  };

  const handleDelete = async () => {
    await deleteCusto(deleteModal.custo.id);
    setDeleteModal({ open: false, custo: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#12211c]">{title}</h1>
          <p className="text-sm text-[#677e77] mt-0.5">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportPDF}><Download className="w-4 h-4 mr-2" /> PDF</Button>
          <Button onClick={() => setEditModal({ open: true, custo: null })}><Plus className="w-4 h-4 mr-2" /> Novo Custo</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={Truck} label="Combustível" value={`R$ ${formatCurrency(totalCombustivel)}`} />
        <StatCard icon={Truck} label="Pedágio" value={`R$ ${formatCurrency(totalPedagio)}`} />
        <StatCard icon={Truck} label="Motorista" value={`R$ ${formatCurrency(totalMotorista)}`} />
        <StatCard icon={Truck} label="GTA/Ajudante" value={`R$ ${formatCurrency(totalGta)}`} />
        <StatCard icon={Truck} label="Seguro" value={`R$ ${formatCurrency(totalSeguro)}`} />
        <StatCard icon={Truck} label="Manutenção" value={`R$ ${formatCurrency(totalManut)}`} accent />
      </div>

      <div className="flex items-center justify-between p-4 rounded-md bg-[#fefce8] border border-[#fef9c3] mb-6">
        <span className="text-sm font-medium text-[#b8860b]">Total Geral</span>
        <span className="text-lg font-semibold text-[#b8860b]">R$ {formatCurrency(totalGeral)}</span>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cidade</TableHead>
              <TableHead>KM</TableHead>
              <TableHead>Combustível</TableHead>
              <TableHead>Pedágio</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>GTA/Ajudante</TableHead>
              <TableHead>Seguro</TableHead>
              <TableHead>Manutenção</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(custo => {
              const total = (custo.combustivel||0) + (custo.pedagio||0) + (custo.motorista||0) + (custo.gta_ajudante||0) + (custo.seguro_caminhao||0) + (custo.custo_manutencoes||0);
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
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditModal({ open: true, custo })}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteModal({ open: true, custo })}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Nenhum custo cadastrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {editModal.open && (
        <CustoForm
          custo={editModal.custo}
          entity={entity}
          onSave={() => { setEditModal({ open: false, custo: null }); refresh(); }}
          onClose={() => setEditModal({ open: false, custo: null })}
        />
      )}
      <ConfirmDelete
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, custo: null })}
        onConfirm={handleDelete}
        label={deleteModal.custo?.cidade || deleteModal.custo?.descricao}
      />
    </div>
  );
}
