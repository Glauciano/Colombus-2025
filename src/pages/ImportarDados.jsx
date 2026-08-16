import React from 'react';
import { Upload, CheckCircle, AlertCircle, Database, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { db, ENTITIES, localDb } from '../lib/db';
import { supabase, hasSupabaseCredentials, isSupabaseEnabled, enableSupabase, disableSupabase } from '../lib/supabaseClient';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '../components/ui';

const BASE44_URL = 'https://colombus-race-pro.base44.app';

const ENTITY_MAP = {
  'Prova': ENTITIES.PROVA,
  'CustoLogistico': ENTITIES.CUSTO_LOGISTICO,
  'CustoRibeiraoPreto': ENTITIES.CUSTO_RIBEIRAO,
  'CustoFranca': ENTITIES.CUSTO_FRANCA,
  'RecebiveisRibeiraoPreto': ENTITIES.RECEIVEIS_RIBEIRAO,
  'RecebiveisFranca': ENTITIES.RECEIVEIS_FRANCA,
  'SocioLimeira': ENTITIES.SOCIO_LIMEIRA,
  'Configuracao': ENTITIES.CONFIGURACAO,
};

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

// Code to run in Base44 console to export data
const EXPORT_CODE = `(async()=>{
  const e=["Prova","CustoLogistico","CustoRibeiraoPreto","CustoFranca","RecebiveisRibeiraoPreto","RecebiveisFranca","SocioLimeira","Configuracao"],d={};
  for(const t of e){const r=await fetch("/api/entities/"+t);d[t]=await r.json()}
  window.__EXPORTED=JSON.stringify(d);
  console.log("✅ Pronto! Agora execute: copy(window.__EXPORTED)");
})()`;

export default function ImportarDados() {
  const [step, setStep] = React.useState('token');
  const [results, setResults] = React.useState({});
  const [error, setError] = React.useState('');
  const [rawData, setRawData] = React.useState('');
  const [supabaseStatus, setSupabaseStatus] = React.useState('idle');
  const [pushStatus, setPushStatus] = React.useState('idle');
  const [pushResults, setPushResults] = React.useState({});

  const testSupabase = async () => {
    if (!hasSupabaseCredentials() || !supabase) {
      setSupabaseStatus('error');
      return;
    }
    setSupabaseStatus('testing');
    try {
      const { data, error } = await supabase.from('provas').select('id').limit(1);
      if (error) throw error;
      setSupabaseStatus('connected');
    } catch (err) {
      console.error('Supabase test error:', err);
      setSupabaseStatus('error');
    }
  };

  const pushToSupabase = async () => {
    if (!supabase) { setPushStatus('done'); return; }
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
        const cleanItems = items.map(item => {
          const clean = { ...item };
          delete clean.id;
          delete clean.createdAt;
          delete clean.updatedAt;
          delete clean.created_at;
          if ((key === 'custo_ribeirao' || key === 'custo_franca') && clean.descricao && !clean.cidade) {
            clean.cidade = clean.descricao;
            delete clean.descricao;
          }
          return clean;
        });

        const { data, error } = await supabase.from(table).insert(cleanItems).select();
        if (error) throw error;
        newResults[label] = { count: items.length, status: 'ok' };
      } catch (err) {
        console.error(`Push error (${label}):`, err);
        newResults[label] = { count: 0, status: 'error', msg: err.message };
      }
    }
    
    setPushResults(newResults);
    setPushStatus('done');
  };

  const importFromPaste = async () => {
    if (!rawData.trim()) {
      setError('Cole os dados JSON acima');
      return;
    }
    
    setStep('importing');
    setError('');
    
    try {
      const allData = JSON.parse(rawData);
      const newResults = {};
      
      for (const [entityName, localKey] of Object.entries(ENTITY_MAP)) {
        const data = allData[entityName];
        if (Array.isArray(data)) {
          for (const item of data) {
            localDb.create(localKey, item);
          }
          newResults[entityName] = { count: data.length, status: 'ok' };
        } else {
          newResults[entityName] = { count: 0, status: 'skipped' };
        }
      }
      
      setResults(newResults);
      setStep('done');
    } catch (err) {
      setError('JSON inválido. Verifique se colou corretamente.');
      setStep('token');
    }
  };

  const totalImported = Object.values(results).reduce((s, r) => s + (r.count || 0), 0);
  const totalPushed = Object.values(pushResults).reduce((s, r) => s + (r.count || 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(160 45% 22%)' }}>
          Configuração e Importação
        </h1>
        <p className="text-sm text-muted-foreground">Conecte ao Supabase e importe dados do Base44</p>
      </div>

      {/* === SUPABASE CONNECTION === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" style={{ color: 'hsl(160 45% 22%)' }} />
            Conexão Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasSupabaseCredentials() ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-sm text-yellow-800">Credenciais não configuradas</p>
                <p className="text-xs text-yellow-600">Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                {isSupabaseEnabled() ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {isSupabaseEnabled() ? 'Supabase Ativo' : 'Usando armazenamento local'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isSupabaseEnabled() 
                      ? 'Dados estão sendo salvos no Supabase (nuvem)' 
                      : 'Dados estão salvos no navegador (localStorage)'}
                  </p>
                </div>
                {isSupabaseEnabled() ? (
                  <Button variant="outline" size="sm" onClick={disableSupabase}>
                    Desativar
                  </Button>
                ) : (
                  <Button size="sm" onClick={enableSupabase}>
                    Ativar Supabase
                  </Button>
                )}
              </div>

              {supabaseStatus === 'idle' && (
                <Button variant="outline" onClick={testSupabase} className="w-full">
                  Testar Conexão
                </Button>
              )}
              {supabaseStatus === 'testing' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700">Testando conexão...</span>
                </div>
              )}
              {supabaseStatus === 'connected' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">Conexão OK! Tabelas acessíveis.</span>
                </div>
              )}
              {supabaseStatus === 'error' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">Erro na conexão. Verifique se executou o SQL de correção no Supabase.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted text-xs font-mono space-y-1">
                    <p className="font-semibold">Execute este SQL no Supabase SQL Editor:</p>
                    <p>ALTER TABLE provas DISABLE ROW LEVEL SECURITY;</p>
                    <p>ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_numero NUMERIC(10,2) DEFAULT 0;</p>
                    <p>ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_texto TEXT;</p>
                    <p className="mt-1">(SQL completo no arquivo SUPABASE_FIX_SQL.md)</p>
                  </div>
                </div>
              )}

              {isSupabaseEnabled() && pushStatus !== 'pushing' && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-medium mb-2">Enviar dados locais para o Supabase</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Copia todos os dados do localStorage para as tabelas do Supabase. Use apenas na primeira vez.
                  </p>
                  <Button 
                    onClick={pushToSupabase} 
                    disabled={pushStatus === 'pushing'}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {pushStatus === 'done' ? 'Reenviar Dados' : 'Enviar Dados para Supabase'}
                  </Button>
                </div>
              )}
              {pushStatus === 'pushing' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700">Enviando dados...</span>
                </div>
              )}
              {pushStatus === 'done' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">{totalPushed} registros enviados!</span>
                  </div>
                  {Object.entries(pushResults).map(([label, result]) => (
                    <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-muted text-sm">
                      <span>{label}</span>
                      <span className={result.status === 'ok' ? 'text-green-700 font-semibold' : result.status === 'skipped' ? 'text-muted-foreground' : 'text-red-600'}>
                        {result.status === 'ok' ? `✅ ${result.count}` : result.status === 'skipped' ? '⏭️ Vazio' : `❌ ${result.msg}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* === BASE44 IMPORT === */}
      <Card>
        <CardHeader>
          <CardTitle>Importar Dados do Base44</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'done' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h2 className="text-lg font-semibold text-green-800">Importação concluída!</h2>
                  <p className="text-sm text-green-600">{totalImported} registros importados no total</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {Object.entries(results).map(([entity, result]) => (
                  <div key={entity} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                    <span className="font-medium text-sm">{entity}</span>
                    <span className={`text-sm font-semibold ${result.status === 'ok' ? 'text-green-700' : result.status === 'skipped' ? 'text-muted-foreground' : 'text-red-600'}`}>
                      {result.status === 'ok' ? `✅ ${result.count} registros` :
                       result.status === 'skipped' ? '⏭️ Pulado' :
                       `❌ ${result.msg}`}
                    </span>
                  </div>
                ))}
              </div>
              
              <Button onClick={() => { setStep('token'); setResults({}); }}>
                Importar Mais Dados
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium">Abra o app original</p>
                    <p className="text-sm text-muted-foreground">
                      Acesse <a href={BASE44_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">{BASE44_URL}</a> e faça login
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium">Abra o Console do navegador (F12) e clique na aba <strong>"Console"</strong></p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium">Cole o código abaixo e aperte Enter:</p>
                    <pre className="mt-2 p-3 rounded-lg bg-muted text-xs overflow-x-auto font-mono whitespace-pre-wrap">{EXPORT_CODE}</pre>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <p className="font-medium">Execute <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">copy(window.__EXPORTED)</code> no console e cole o resultado aqui:</p>
                  </div>
                </div>
              </div>

              <textarea
                value={rawData}
                onChange={e => setRawData(e.target.value)}
                placeholder={'Cole os dados aqui... (vai começar com {"Prova": [...]})'}
                className="w-full h-40 p-3 rounded-lg border border-input bg-background text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
              
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <Button
                onClick={importFromPaste}
                disabled={step === 'importing' || !rawData.trim()}
                className="w-full"
                size="lg"
              >
                {step === 'importing' ? (
                  <>{'Importando... '}<Loader2 className="w-4 h-4 animate-spin ml-2" /></>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Importar Todos os Dados</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
