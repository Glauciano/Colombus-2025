import React from 'react';
import { Upload, CheckCircle, AlertCircle, Database, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { db, ENTITIES, localDb } from '../lib/db';
import { supabase, hasSupabaseCredentials, isSupabaseEnabled, enableSupabase, disableSupabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export default function ImportarDados() {
  const [supabaseStatus, setSupabaseStatus] = React.useState('idle');
  const [pushStatus, setPushStatus] = React.useState('idle');
  const [pushResults, setPushResults] = React.useState({});

  const testSupabase = async () => {
    if (!hasSupabaseCredentials() || !supabase) { setSupabaseStatus('error'); return; }
    setSupabaseStatus('testing');
    try { const { error } = await supabase.from('provas').select('id').limit(1); if (error) throw error; setSupabaseStatus('connected'); } catch { setSupabaseStatus('error'); }
  };

  const pushToSupabase = async () => {
    if (!supabase) return;
    setPushStatus('pushing'); setPushResults({});
    const newResults = {};
    const TABLE_MAP = { 'provas':'provas', 'custo_logistico':'custo_logistico', 'custo_ribeirao':'custo_ribeirao_preto', 'custo_franca':'custo_franca', 'receiveis_ribeirao':'recebiveis_ribeirao_preto', 'receiveis_franca':'recebiveis_franca', 'socio_limeira':'socio_limeira', 'venda_anilha':'venda_anilha', 'configuracao':'configuracao' };
    const entities = [
      { key: ENTITIES.PROVA, label: 'Provas' }, { key: ENTITIES.CUSTO_LOGISTICO, label: 'Custos Logísticos' }, { key: ENTITIES.CUSTO_RIBEIRAO, label: 'Custos Ribeirão' }, { key: ENTITIES.CUSTO_FRANCA, label: 'Custos Franca' }, { key: ENTITIES.RECEIVEIS_RIBEIRAO, label: 'Receíveis Ribeirão' }, { key: ENTITIES.RECEIVEIS_FRANCA, label: 'Receíveis Franca' }, { key: ENTITIES.SOCIO_LIMEIRA, label: 'Sócios Limeira' }, { key: ENTITIES.VENDA_ANILHA, label: 'Venda Anilhas' }, { key: ENTITIES.CONFIGURACAO, label: 'Configuração' },
    ];
    for (const { key, label } of entities) {
      try {
        const items = localDb.list(key); if (items.length === 0) { newResults[label] = { count: 0, status: 'skipped' }; continue; }
        const table = TABLE_MAP[key]; const cleanItems = items.map(item => { const c = {...item}; delete c.id; delete c.createdAt; delete c.updatedAt; delete c.created_at; return c; });
        const { error } = await supabase.from(table).insert(cleanItems).select(); if (error) throw error;
        newResults[label] = { count: items.length, status: 'ok' };
      } catch (err) { newResults[label] = { count: 0, status: 'error', msg: err.message }; }
    }
    setPushResults(newResults); setPushStatus('done');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>Configuração</h2>
        <p className="text-muted-foreground">Conexão com Supabase</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Conexão Supabase</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
            {isSupabaseEnabled() ? <Wifi className="h-5 w-5 text-primary" /> : <WifiOff className="h-5 w-5 text-muted-foreground" />}
            <div className="flex-1">
              <p className="font-medium">{isSupabaseEnabled() ? 'Supabase Ativo' : 'Usando armazenamento local'}</p>
              <p className="text-sm text-muted-foreground">{isSupabaseEnabled() ? 'Dados salvos na nuvem' : 'Dados salvos no navegador'}</p>
            </div>
            {isSupabaseEnabled() ? <Button variant="outline" size="sm" onClick={disableSupabase}>Desativar</Button> : <Button size="sm" onClick={enableSupabase}>Ativar</Button>}
          </div>

          {supabaseStatus === 'idle' && <Button variant="outline" onClick={testSupabase} className="w-full">Testar Conexão</Button>}
          {supabaseStatus === 'testing' && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Testando...</p>}
          {supabaseStatus === 'connected' && <p className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="h-4 w-4" /> Conexão OK!</p>}
          {supabaseStatus === 'error' && <p className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> Erro na conexão.</p>}

          {isSupabaseEnabled() && pushStatus !== 'pushing' && (
            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Enviar dados locais para Supabase</p>
              <p className="text-sm text-muted-foreground mb-3">Copia os dados do navegador para a nuvem. Use apenas na primeira vez.</p>
              <Button variant="outline" onClick={pushToSupabase} className="w-full"><Upload className="mr-2 h-4 w-4" />{pushStatus === 'done' ? 'Reenviar' : 'Enviar Dados'}</Button>
            </div>
          )}
          {pushStatus === 'pushing' && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</p>}
          {pushStatus === 'done' && (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="h-4 w-4" /> Dados enviados!</p>
              {Object.entries(pushResults).map(([label, r]) => (
                <div key={label} className="flex justify-between p-2 rounded bg-muted text-sm">
                  <span>{label}</span>
                  <span className={r.status==='ok'?'text-primary font-medium':'text-muted-foreground'}>{r.status==='ok'?`✅ ${r.count}`:r.status==='skipped'?'⏭️':'❌'}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
