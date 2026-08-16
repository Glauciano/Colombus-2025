import React from 'react';
import { Plus, Pencil, Trash2, CircleDot, Download, Search } from 'lucide-react';
import { db, ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

function formatAnilha(num, ano) { return String(num).padStart(7, '0') + '/' + String(ano).slice(-2); }
const STATUS_OPTIONS = ['Disponível', 'Reservado', 'Vendido', 'Devolvido'];
const statusVariant = { 'Disponível': 'default', 'Reservado': 'secondary', 'Vendido': 'outline', 'Devolvido': 'destructive' };
const emptyVenda = { socio: '', numero_inicio: '', numero_fim: '', ano: new Date().getFullYear(), valor_unitario: '', valor_total: '', data_venda: '', status: 'Disponível', observacao: '' };

function VendaForm({ venda, onSave, onClose }) {
  const [form, setForm] = React.useState(emptyVenda); const [saving, setSaving] = React.useState(false); const isEdit = !!venda;
  React.useEffect(() => { if (venda) setForm({ socio: venda.socio||'', numero_inicio: venda.numero_inicio||'', numero_fim: venda.numero_fim||'', ano: venda.ano||new Date().getFullYear(), valor_unitario: venda.valor_unitario||'', valor_total: venda.valor_total||'', data_venda: venda.data_venda?.slice(0,10)||'', status: venda.status||'Disponível', observacao: venda.observacao||'' }); }, [venda]);
  const handleChange = (field, value) => { setForm(prev => { const u = {...prev, [field]: value}; if (['valor_unitario','numero_inicio','numero_fim'].includes(field)) { const i=field==='numero_inicio'?Number(value):Number(u.numero_inicio), f=field==='numero_fim'?Number(value):Number(u.numero_fim), v=field==='valor_unitario'?Number(value):Number(u.valor_unitario); if(i&&f&&f>=i&&v) u.valor_total=(f-i+1)*v; } return u; }); };
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); const n=v=>v!==''?Number(v):0; const data={socio:form.socio,numero_inicio:form.numero_inicio,numero_fim:form.numero_fim,ano:Number(form.ano),valor_unitario:n(form.valor_unitario),valor_total:n(form.valor_total),data_venda:form.data_venda,status:form.status,observacao:form.observacao}; if(!data.valor_total&&data.valor_unitario&&data.numero_inicio&&data.numero_fim) data.valor_total=(Number(data.numero_fim)-Number(data.numero_inicio)+1)*data.valor_unitario; if(isEdit){await db.update(ENTITIES.VENDA_ANILHA,venda.id,data);}else{await db.create(ENTITIES.VENDA_ANILHA,data);} setSaving(false); onSave(); };
  const qtd = form.numero_inicio&&form.numero_fim&&Number(form.numero_fim)>=Number(form.numero_inicio)?Number(form.numero_fim)-Number(form.numero_inicio)+1:0;
  return (
    <Dialog open={true} onOpenChange={onClose}><DialogContent className="sm:max-w-[500px]"><DialogHeader><DialogTitle>{isEdit?'Editar Venda':'Nova Venda de Anilhas'}</DialogTitle></DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2"><Label>Sócio / Comprador</Label><Input value={form.socio} onChange={e=>handleChange('socio',e.target.value)} /></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Nº Início</Label><Input type="number" value={form.numero_inicio} onChange={e=>handleChange('numero_inicio',e.target.value)} /></div>
          <div className="space-y-2"><Label>Nº Fim</Label><Input type="number" value={form.numero_fim} onChange={e=>handleChange('numero_fim',e.target.value)} /></div>
          <div className="space-y-2"><Label>Ano</Label><Input type="number" value={form.ano} onChange={e=>handleChange('ano',e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Valor Unitário (R$)</Label><Input type="number" step="0.01" value={form.valor_unitario} onChange={e=>handleChange('valor_unitario',e.target.value)} /></div>
          <div className="space-y-2"><Label>Valor Total (R$)</Label><Input type="number" step="0.01" value={form.valor_total} onChange={e=>handleChange('valor_total',e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Data da Venda</Label><Input type="date" value={form.data_venda} onChange={e=>handleChange('data_venda',e.target.value)} /></div>
          <div className="space-y-2"><Label>Status</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={e=>handleChange('status',e.target.value)}>{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving}>{saving?'Salvando...':'Salvar'}</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>
  );
}

export default function VendaAnilhas() {
  const [editModal, setEditModal] = React.useState({open:false,venda:null});
  const [deleteModal, setDeleteModal] = React.useState({open:false,venda:null});
  const [searchTerm, setSearchTerm] = React.useState('');
  const {data:vendas,refresh,remove:deleteVenda} = useCollection(ENTITIES.VENDA_ANILHA);
  const filtered = vendas.filter(v=>{if(searchTerm&&!(v.socio||'').toLowerCase().includes(searchTerm.toLowerCase()))return false;return true;}).sort((a,b)=>(a.ano||0)-(b.ano||0));
  const totalAnilhas=vendas.reduce((s,v)=>{const i=Number(v.numero_inicio)||0,f=Number(v.numero_fim)||0;return s+(f>=i?f-i+1:0);},0);
  const totalValor=vendas.reduce((s,v)=>s+(v.valor_total||0),0);
  const handleDelete=async()=>{await deleteVenda(deleteModal.venda.id);setDeleteModal({open:false,venda:null});};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'"Playfair Display", serif'}}>Vendas de Anilhas</h2><p className="text-muted-foreground">Controle de vendas de anilhas por sócio</p></div>
        <Button onClick={()=>setEditModal({open:true,venda:null})}><Plus className="mr-2 h-4 w-4"/> Nova Venda</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Anilhas</CardTitle><CircleDot className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{totalAnilhas.toLocaleString('pt-BR')}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Valor Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-accent">R$ {formatCurrency(totalValor)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Vendido</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {formatCurrency(vendas.filter(v=>v.status==='Vendido').reduce((s,v)=>s+(v.valor_total||0),0))}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Disponível</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">R$ {formatCurrency(vendas.filter(v=>v.status==='Disponível').reduce((s,v)=>s+(v.valor_total||0),0))}</div></CardContent></Card>
      </div>

      <div className="flex gap-2"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Buscar sócio..." className="pl-9"/></div></div>

      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Sócio</TableHead><TableHead>Faixa</TableHead><TableHead>Qtd</TableHead><TableHead>Valor Unit.</TableHead><TableHead>Valor Total</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead className="w-[70px]"></TableHead></TableRow></TableHeader>
        <TableBody>
          {filtered.map(v=>{const i=Number(v.numero_inicio)||0,f=Number(v.numero_fim)||0,q=f>=i?f-i+1:0;return(
            <TableRow key={v.id}><TableCell className="font-medium">{v.socio||'—'}</TableCell><TableCell className="font-mono text-xs">{formatAnilha(i,v.ano)} → {formatAnilha(f,v.ano)}</TableCell><TableCell><Badge variant="secondary">{q}</Badge></TableCell><TableCell>R$ {formatCurrency(v.valor_unitario)}</TableCell><TableCell className="font-semibold">R$ {formatCurrency(v.valor_total)}</TableCell><TableCell>{formatDate(v.data_venda)}</TableCell><TableCell><Badge variant={statusVariant[v.status]||'default'}>{v.status||'Disponível'}</Badge></TableCell>
            <TableCell><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>setEditModal({open:true,venda:v})}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>setDeleteModal({open:true,venda:v})}><Trash2 className="h-4 w-4"/></Button></div></TableCell></TableRow>);})}
          {filtered.length===0&&<TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Nenhuma venda.</TableCell></TableRow>}
        </TableBody></Table></CardContent></Card>

      {editModal.open&&<VendaForm venda={editModal.venda} onSave={()=>{setEditModal({open:false,venda:null});refresh();}} onClose={()=>setEditModal({open:false,venda:null})}/>}
      <Dialog open={deleteModal.open} onOpenChange={()=>setDeleteModal({open:false,venda:null})}><DialogContent><DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader><DialogFooter><Button variant="outline" onClick={()=>setDeleteModal({open:false,venda:null})}>Cancelar</Button><Button variant="destructive" onClick={handleDelete}>Excluir</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
