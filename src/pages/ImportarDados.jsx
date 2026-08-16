import React from 'react';
import { Upload, CheckCircle, AlertCircle, Database, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { db, ENTITIES, localDb } from '../lib/db';
import { supabase, hasSupabaseCredentials, isSupabaseEnabled, enableSupabase, disableSupabase } from '../lib/supabaseClient';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, PageHeader } from '../components/ui';

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
    <div className="max-w-3xl">
      <PageHeader title="Configuração e Importação" subtitle="Conecte ao Supabase e importe dados do Base44" />

      {/* Supabase Connection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#15803d]" />
            Conexão Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasSupabaseCredentials() ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-sm text-amber-800">Credenciais não configuradas</p>
                <p className="text-xs text-amber-600">Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f6f5f3]">
                {isSupabaseEnabled() ? (
                  <Wifi className="w-5 h-5 text-emerald-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-[#677e77]" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm text-[#12211c]">
                    {isSupabaseEnabled() ? 'Supabase Ativo' : 'Usando armazenamento local'}
                  </p>
                  <p className="text-xs text-[#677e77]">
                    {isSupabaseEnabled()
                      ? 'Dados estão sendo salvos no Supabase (nuvem)'
                      : 'Dados estão salvos no navegador (localStorage)'}
                  </p>
                </div>
                {isSupabaseEnabled() ? (
                  <Button variant="outline" size="sm" onClick={disableSupabase}>Desativar</Button>
                ) : (
                  <Button size="sm" onClick={enableSupabase}>Ativar Supabase</Button>
                )}
              </div>

              {supabaseStatus === 'idle' && (
                <Button variant="outline" onClick={testSupabase} className="w-full">Testar Conexão</Button>
              )}
              {supabaseStatus === 'testing' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-sm text-blue-700">Testando conexão...</span>
                </div>
              )}
              {supabaseStatus === 'connected' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">Conexão OK! Tabelas acessíveis.</span>
                </div>
              )}
              {supabaseStatus === 'error' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">Erro na conexão. Verifique se executou o SQL de correção no Supabase.</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#f6f5f3] text-xs font-mono space-y-1">
                    <p className="font-semibold text-[#12211c]">Execute este SQL no Supabase SQL Editor:</p>
                    <p className="text-[#677e77]">ALTER TABLE provas DISABLE ROW LEVEL SECURITY;</p>
                    <p className="text-[#677e77]">ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_numero NUMERIC(10,2) DEFAULT 0;</p>
                    <p className="text-[#677e77]">ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_texto TEXT;</p>
                    <p className="text-[#677e77] mt-1">(SQL completo no arquivo SUPABASE_FIX_SQL.md)</p>
                  </div>
                </div>
              )}

              {isSupabaseEnabled() && pushStatus !== 'pushing' && (
                <div className="pt-3 border-t border-[#e5e7eb]">
                  <p className="text-sm font-medium text-[#12211c] mb-2">Enviar dados locais para o Supabase</p>
                  <p className="text-xs text-[#677e77] mb-3">
                    Copia todos os dados do localStorage para as tabelas do Supabase. Use apenas na primeira vez.
                  </p>
                  <Button
                    onClick={pushToSupabase}
                    disabled={pushStatus === 'pushing'}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-1.5" />
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
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">{totalPushed} registros enviados!</span>
                  </div>
                  {Object.entries(pushResults).map(([label, result]) => (
                    <div key={label} className="flex items-center justify-between p-2.5 rounded-lg bg-[#f6f5f3] text-sm">
                      <span className="text-[#12211c]">{label}</span>
                      <span className={result.status === 'ok' ? 'text-emerald-700 font-semibold' : result.status === 'skipped' ? 'text-[#677e77]' : 'text-red-600'}>
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

      {/* Base44 Import */}
      <Card>
        <CardHeader>
          <CardTitle>Importar Dados do Base44</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'done' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 className="text-base font-semibold text-emerald-800">Importação concluída!</h2>
                  <p className="text-sm text-emerald-600">{totalImported} registros importados no total</p>
                </div>
              </div>
              <div className="space-y-2">
                {Object.entries(results).map(([entity, result]) => (
                  <div key={entity} className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50">
                    <span className="font-medium text-sm text-[#12211c]">{entity}</span>
                    <span className={`text-sm font-semibold ${result.status === 'ok' ? 'text-emerald-700' : result.status === 'skipped' ? 'text-[#677e77]' : 'text-red-600'}`}>
                      {result.status === 'ok' ? `✅ ${result.count} registros` :
                       result.status === 'skipped' ? '⏭️ Pulado' :
                       `❌ ${result.msg}`}
                    </span>
                  </div>
                ))}
              </div>
              <Button onClick={() => { setStep('token'); setResults({}); }}>Importar Mais Dados</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#15803d] text-white flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium text-[#12211c]">Abra o app original</p>
                    <p className="text-sm text-[#677e77]">
                      Acesse <a href={BASE44_URL} target="_blank" rel="noopener noreferrer" className="text-[#15803d] underline">{BASE44_URL}</a> e faça login
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#15803d] text-white flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium text-[#12211c]">Abra o Console do navegador (F12) e clique na aba <strong>"Console"</strong></p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#15803d] text-white flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium text-[#12211c]">Cole o código abaixo e aperte Enter:</p>
                    <pre className="mt-2 p-3 rounded-lg bg-[#f6f5f3] text-xs overflow-x-auto font-mono whitespace-pre-wrap text-[#12211c]">{EXPORT_CODE}</pre>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#b8860b] text-white flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <p className="font-medium text-[#12211c]">Execute <code className="px-1.5 py-0.5 rounded bg-[#f6f5f3] text-xs font-mono">copy(window.__EXPORTED)</code> no console e cole o resultado aqui:</p>
                  </div>
                </div>
              </div>

              <textarea
                value={rawData}
                onChange={e => setRawData(e.target.value)}
                placeholder={'Cole os dados aqui... (vai começar com {"Prova": [...]})'}
                className="w-full h-40 p-3 rounded-lg border border-[#d1d5db] bg-white text-sm font-mono placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#15803d]/20 focus:border-[#15803d] resize-y"
              />

              {error && (
                <div className="flex items-center gap-2 text-[#dc2626] text-sm">
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
                  <><Upload className="w-4 h-4 mr-1.5" /> Importar Todos os Dados</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
