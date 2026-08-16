import React from 'react';
import { Upload, CheckCircle, AlertCircle, Database, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { db, ENTITIES, localDb } from '../lib/db';
import { hasSupabaseCredentials, isSupabaseEnabled, enableSupabase, disableSupabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cmoaiyhwmrsaihibfhux.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AUHiIr1CvseO8Uy-XtqFyw_L3ELN2-4';

const TABLE_MAP = {
  'provas': 'provas',
  'custo_logistico': 'custo_logistico',
  'custo_ribeirao': 'custo_ribeirao_preto',
  'custo_franca': 'custo_franca',
  'receiveis_ribeirao': 'recebiveis_ribeirao_preto',
  'receiveis_franca': 'recebiveis_franca',
  'socio_limeira': 'socio_limeira',
  'venda_anilha': 'venda_anilha',
  'configuracao': 'configuracao',
};

// Clean values for Supabase: empty strings → null, NaN → null
function cleanForSupabase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '') {
      result[key] = null;
    } else if (typeof value === 'number' && isNaN(value)) {
      result[key] = null;
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Direct REST API call to Supabase (bypasses JS client auth issues)
async function supabaseRest(method, table, body = null, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.text();
    let errorObj;
    try { errorObj = JSON.parse(errorBody); } catch { errorObj = { message: errorBody }; }
    throw new Error(errorObj.message || `Supabase error ${response.status}`);
  }
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

export default function ImportarDados() {
  const [supabaseStatus, setSupabaseStatus] = React.useState('idle');
  const [pushStatus, setPushStatus] = React.useState('idle');
  const [pushResults, setPushResults] = React.useState({});

  const testSupabase = async () => {
    if (!hasSupabaseCredentials()) { setSupabaseStatus('error'); return; }
    setSupabaseStatus('testing');
    try {
      await supabaseRest('GET', 'provas', null, 'select=id&limit=1');
      setSupabaseStatus('connected');
    } catch {
      setSupabaseStatus('error');
    }
  };

  const pushToSupabase = async () => {
    setPushStatus('pushing');
    setPushResults({});
    const newResults = {};

    const entities = [
      { key: ENTITIES.PROVA, label: 'Provas' },
      { key: ENTITIES.CUSTO_LOGISTICO, label: 'Custos Logísticos' },
      { key: ENTITIES.CUSTO_RIBEIRAO, label: 'Custos Ribeirão' },
      { key: ENTITIES.CUSTO_FRANCA, label: 'Custos Franca' },
      { key: ENTITIES.RECEIVEIS_RIBEIRAO, label: 'Receíveis Ribeirão' },
      { key: ENTITIES.RECEIVEIS_FRANCA, label: 'Receíveis Franca' },
      { key: ENTITIES.SOCIO_LIMEIRA, label: 'Sócios Limeira' },
      { key: ENTITIES.VENDA_ANILHA, label: 'Venda Anilhas' },
      { key: ENTITIES.CONFIGURACAO, label: 'Configuração' },
    ];

    for (const { key, label } of entities) {
      try {
        const items = localDb.list(key);
        if (items.length === 0) {
          newResults[label] = { count: 0, status: 'skipped' };
          continue;
        }

        const table = TABLE_MAP[key];

        // Clean each item: remove internal fields, convert empty strings to null
        const cleanItems = items.map(item => {
          const c = { ...item };
          delete c.id;
          delete c.createdAt;
          delete c.updatedAt;
          delete c.created_at;
          delete c.user_id;
          return cleanForSupabase(c);
        });

        console.log(`[Push] ${label} (${table}): ${cleanItems.length} items`, cleanItems);

        // Use REST API directly, insert one at a time to avoid batch errors
        let successCount = 0;
        let lastError = null;
        for (const cleanItem of cleanItems) {
          try {
            await supabaseRest('POST', table, cleanItem, 'select=id');
            successCount++;
          } catch (itemErr) {
            console.error(`[Push] ${label} item error:`, itemErr.message, cleanItem);
            lastError = itemErr.message;
            // If duplicate (id conflict), skip
            if (itemErr.message && itemErr.message.includes('duplicate')) {
              successCount++; // count as success since it already exists
            }
          }
        }

        if (successCount === items.length) {
          newResults[label] = { count: successCount, status: 'ok' };
        } else if (successCount > 0) {
          newResults[label] = { count: successCount, status: 'ok', msg: `${items.length - successCount} falharam` };
        } else {
          newResults[label] = { count: 0, status: 'error', msg: lastError || 'Erro desconhecido' };
        }
      } catch (err) {
        console.error(`[Push] ${label} error:`, err);
        newResults[label] = { count: 0, status: 'error', msg: err.message };
      }
    }

    setPushResults(newResults);
    setPushStatus('done');
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
                <div key={label} className="p-2 rounded bg-muted text-sm">
                  <div className="flex justify-between">
                    <span>{label}</span>
                    <span className={
                      r.status === 'ok' ? 'text-primary font-medium' :
                      r.status === 'skipped' ? 'text-muted-foreground' :
                      'text-destructive font-medium'
                    }>
                      {r.status === 'ok' ? `✅ ${r.count}` : r.status === 'skipped' ? '⏭️' : '❌'}
                    </span>
                  </div>
                  {r.msg && <p className="text-xs text-muted-foreground mt-1">{r.msg}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
