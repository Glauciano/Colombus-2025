import React from 'react';
import { Plus, Trash2, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { db, ENTITIES } from '../lib/db';

// City name to slug mapping
function cityToSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Known cities with their Supabase table mappings
const CITY_TABLES = {
  'ribeirao-preto': { custo: 'custo_ribeirao', cc: 'receiveis_ribeirao', label: 'Ribeirão Preto' },
  'franca-s-p': { custo: 'custo_franca', cc: 'receiveis_franca', label: 'Franca S.P' },
  'limeira': { custo: null, cc: 'socio_limeira', label: 'Limeira' },
};

export default function CidadesConfig() {
  const [cidades, setCidades] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [addModal, setAddModal] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState({ open: false, cidade: '' });
  const [novaCidade, setNovaCidade] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  // Load cidades from Supabase
  const loadCidades = async () => {
    setLoading(true);
    try {
      const rows = await db.list(ENTITIES.CONFIGURACAO);
      const row = rows.find(r => r.chave === 'cidades_ativas');
      if (row && row.valor_texto) {
        setCidades(row.valor_texto.split(',').filter(Boolean));
      } else {
        setCidades(['Ribeirão Preto', 'Franca S.P', 'Limeira']);
      }
    } catch {
      setCidades(['Ribeirão Preto', 'Franca S.P', 'Limeira']);
    }
    setLoading(false);
  };

  React.useEffect(() => { loadCidades(); }, []);

  // Save cidades to Supabase
  const saveCidades = async (newCidades) => {
    const text = newCidades.join(',');
    const rows = await db.list(ENTITIES.CONFIGURACAO);
    const existing = rows.find(r => r.chave === 'cidades_ativas');

    if (existing) {
      await db.update(ENTITIES.CONFIGURACAO, existing.id, { valor_texto: text });
    } else {
      await db.create(ENTITIES.CONFIGURACAO, { chave: 'cidades_ativas', valor_texto: text });
    }
  };

  const handleAdd = async () => {
    const nome = novaCidade.trim();
    if (!nome) { setErrorMsg('Digite o nome da cidade'); return; }
    if (cidades.includes(nome)) { setErrorMsg('Esta cidade já existe'); return; }

    const newCidades = [...cidades, nome];
    setCidades(newCidades);
    await saveCidades(newCidades);
    setNovaCidade('');
    setErrorMsg('');
    setAddModal(false);
  };

  const handleDelete = async () => {
    const newCidades = cidades.filter(c => c !== deleteModal.cidade);
    setCidades(newCidades);
    await saveCidades(newCidades);
    setDeleteModal({ open: false, cidade: '' });
  };

  const getCityType = (nome) => {
    const slug = cityToSlug(nome);
    if (slug === 'limeira') return 'Sócios';
    if (CITY_TABLES[slug]) return 'Custos + C/C';
    return 'Nova (custos + C/C)';
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Cidades</h2>
        <p className="text-muted-foreground">Gerenciar cidades que competem</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Cidades Ativas</span>
            <Button size="sm" onClick={() => setAddModal(true)}><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
          {!loading && cidades.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma cidade cadastrada.</p>
          )}
          {!loading && cidades.map((cidade, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">{cidade}</p>
                  <p className="text-xs text-muted-foreground">{getCityType(cidade)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getCityType(cidade) === 'Sócios' ? 'secondary' : 'default'}>
                  {getCityType(cidade)}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteModal({ open: true, cidade })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add dialog */}
      <Dialog open={addModal} onOpenChange={() => { setAddModal(false); setNovaCidade(''); setErrorMsg(''); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Adicionar Cidade</DialogTitle></DialogHeader>
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" /> {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <Label>Nome da Cidade</Label>
            <Input
              value={novaCidade}
              onChange={e => { setNovaCidade(e.target.value); setErrorMsg(''); }}
              placeholder="Ex: Uberlândia M.G"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <p className="text-xs text-muted-foreground">
              Será criada automaticamente as páginas de Custos e C/C para esta cidade.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddModal(false); setNovaCidade(''); setErrorMsg(''); }}>Cancelar</Button>
            <Button onClick={handleAdd}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteModal.open} onOpenChange={() => setDeleteModal({ open: false, cidade: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover cidade?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <strong>{deleteModal.cidade}</strong> será removida do menu lateral. Os dados já salvos não serão apagados — só ficam fora do menu.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, cidade: '' })}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
