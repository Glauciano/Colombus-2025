import React from 'react';
import { Plus, Pencil, Trash2, Users, ChevronDown, ChevronRight, Check, X } from 'lucide-react';
import { db, ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

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

const getTotalParcelas = (s) => PARCELAS.reduce((sum, i) => sum + (s[`parcela_${i}`] || 0), 0);
const getTotalPago = (s) => PARCELAS.reduce((sum, i) => s[`pago_parcela_${i}`] ? sum + (s[`parcela_${i}`] || 0) : sum, 0);

function SocioForm({ socio, onSave, onClose }) {
  const [form, setForm] = React.useState(emptySocio);
  const [saving, setSaving] = React.useState(false);
  const isEdit = !!socio;

  React.useEffect(() => {
    if (socio) setForm({ ...emptySocio(), ...socio });
  }, [socio]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form };
      PARCELAS.forEach(i => {
        data[`parcela_${i}`] = parseFloat(form[`parcela_${i}`]) || 0;
        data[`pago_parcela_${i}`] = form[`pago_parcela_${i}`] || false;
      });
      if (isEdit) {
        await db.update(ENTITIES.SOCIO_LIMEIRA, socio.id, data);
      } else {
        await db.create(ENTITIES.SOCIO_LIMEIRA, data);
      }
      onSave();
    } catch (err) {
      console.error('Erro ao salvar sócio:', err);
    }
    setSaving(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? 'Editar Sócio' : 'Novo Sócio'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={form.nome} onChange={e => handleChange('nome', e.target.value)} required /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone} onChange={e => handleChange('telefone', e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} /></div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Parcelas</h4>
            <div className="space-y-2">
              {PARCELAS.map(i => (
                <div key={i} className="grid grid-cols-[40px_1fr_1fr_60px] gap-2 items-center">
                  <span className="text-xs text-muted-foreground font-medium">{i}ª</span>
                  <Input type="number" step="0.01" placeholder="0,00" value={form[`parcela_${i}`] || ''} onChange={e => handleChange(`parcela_${i}`, e.target.value)} className="h-8 text-sm" />
                  <Input type="date" value={form[`data_parcela_${i}`]?.slice(0, 10) || ''} onChange={e => handleChange(`data_parcela_${i}`, e.target.value)} className="h-8 text-sm" />
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input type="checkbox" checked={form[`pago_parcela_${i}`] || false} onChange={e => handleChange(`pago_parcela_${i}`, e.target.checked)} className="w-3.5 h-3.5 accent-primary" />
                    Pago
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2"><Label>Observação</Label><Input value={form.observacao} onChange={e => handleChange('observacao', e.target.value)} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CCLimeira() {
  const [editModal, setEditModal] = React.useState({ open: false, socio: null });
  const [deleteModal, setDeleteModal] = React.useState({ open: false, socio: null });
  const [expandedId, setExpandedId] = React.useState(null);
  const { data: socios, refresh, remove: deleteSocio } = useCollection(ENTITIES.SOCIO_LIMEIRA);

  const sorted = [...socios].sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
  const totalGeral = socios.reduce((s, soc) => s + getTotalParcelas(soc), 0);
  const totalPago = socios.reduce((s, soc) => s + getTotalPago(soc), 0);

  const handleDelete = async () => {
    await deleteSocio(deleteModal.socio.id);
    setDeleteModal({ open: false, socio: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
            Recebíveis Sócios — Limeira
          </h2>
          <p className="text-muted-foreground">Gestão de sócios e parcelas</p>
        </div>
        <Button onClick={() => setEditModal({ open: true, socio: null })}>
          <Plus className="mr-2 h-4 w-4" /> Novo Sócio
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ {formatCurrency(totalGeral)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ {formatCurrency(totalPago)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-accent">R$ {formatCurrency(totalGeral - totalPago)}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Pendente</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(socio => {
                const total = getTotalParcelas(socio);
                const pago = getTotalPago(socio);
                const isExpanded = expandedId === socio.id;
                const parcelasComValor = PARCELAS.filter(i => socio[`parcela_${i}`]);
                const parcelasPagas = parcelasComValor.filter(i => socio[`pago_parcela_${i}`]).length;

                return (
                  <React.Fragment key={socio.id}>
                    {/* Main row - clickable to expand */}
                    <TableRow
                      className="hover:bg-muted/30 cursor-pointer group"
                      onClick={() => setExpandedId(isExpanded ? null : socio.id)}
                    >
                      <TableCell>
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        }
                      </TableCell>
                      <TableCell className="font-medium">{socio.nome || '—'}</TableCell>
                      <TableCell>{socio.telefone || '—'}</TableCell>
                      <TableCell>R$ {formatCurrency(total)}</TableCell>
                      <TableCell>R$ {formatCurrency(pago)}</TableCell>
                      <TableCell className="font-semibold">R$ {formatCurrency(total - pago)}</TableCell>
                      <TableCell>
                        <Badge variant={parcelasPagas === parcelasComValor.length && parcelasComValor.length > 0 ? 'default' : 'secondary'}>
                          {parcelasPagas}/{parcelasComValor.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditModal({ open: true, socio })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteModal({ open: true, socio })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded parcelas row */}
                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/20 p-4">
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {PARCELAS.map(i => {
                              const valor = socio[`parcela_${i}`];
                              const data = socio[`data_parcela_${i}`];
                              const pago = socio[`pago_parcela_${i}`];

                              // Skip empty parcelas
                              if (!valor && !data) return null;

                              return (
                                <div
                                  key={i}
                                  className={`rounded-lg border p-2 text-xs ${
                                    pago ? 'bg-green-50 border-green-200' : 'bg-white border-border'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold">Parcela {i}</span>
                                    {pago
                                      ? <Check className="h-3.5 w-3.5 text-green-600" />
                                      : <X className="h-3.5 w-3.5 text-red-400" />
                                    }
                                  </div>
                                  <div className="font-medium text-sm">R$ {formatCurrency(valor)}</div>
                                  {data && (
                                    <div className="text-muted-foreground mt-0.5">{formatDate(data)}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Nenhum sócio.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editModal.open && (
        <SocioForm
          socio={editModal.socio}
          onSave={() => { setEditModal({ open: false, socio: null }); refresh(); }}
          onClose={() => setEditModal({ open: false, socio: null })}
        />
      )}

      <Dialog open={deleteModal.open} onOpenChange={() => setDeleteModal({ open: false, socio: null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, socio: null })}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
