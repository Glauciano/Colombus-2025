import React from 'react';
import { Upload, CheckCircle, AlertCircle, ArrowRight, Copy } from 'lucide-react';
import { db, ENTITIES } from '../lib/db';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '../components/ui';

const BASE44_URL = 'https://colombus-race-pro.base44.app';
const APP_ID = '69e5f2248495fbc2168e1748';

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

export default function ImportarDados() {
  const [token, setToken] = React.useState('');
  const [step, setStep] = React.useState('token'); // token, importing, done, error
  const [results, setResults] = React.useState({});
  const [error, setError] = React.useState('');
  const [rawData, setRawData] = React.useState('');
  const [importMode, setImportMode] = React.useState('token'); // token or paste

  const importWithToken = async () => {
    if (!token.trim()) {
      setError('Cole o token acima');
      return;
    }
    
    setStep('importing');
    setError('');
    const newResults = {};
    
    for (const [entityName, localKey] of Object.entries(ENTITY_MAP)) {
      try {
        const res = await fetch(`${BASE44_URL}/api/entities/${entityName}`, {
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            // Clear existing and import all
            for (const item of data) {
              db.create(localKey, item);
            }
            newResults[entityName] = { count: data.length, status: 'ok' };
          } else {
            newResults[entityName] = { count: 0, status: 'error', msg: 'Resposta inesperada' };
          }
        } else {
          newResults[entityName] = { count: 0, status: 'error', msg: `HTTP ${res.status}` };
        }
      } catch (err) {
        newResults[entityName] = { count: 0, status: 'error', msg: err.message };
      }
    }
    
    setResults(newResults);
    setStep('done');
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
            db.create(localKey, item);
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(160 45% 22%)' }}>
          Importar Dados do Base44
        </h1>
        <p className="text-sm text-muted-foreground">Traga todos os dados do app original para cá</p>
      </div>

      {step === 'done' ? (
        /* Success screen */
        <Card className="border-green-200">
          <CardContent className="p-6">
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
            
            <div className="mt-6">
              <Button onClick={() => window.location.href = '/'}>
                Ir para o Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Instructions Card */}
          <Card>
            <CardHeader>
              <CardTitle>📖 Como fazer (é simples!)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                  <div>
                    <p className="font-medium">Abra o app original</p>
                    <p className="text-sm text-muted-foreground">
                      Acesse <a href={BASE44_URL} target="_blank" className="text-primary underline">{BASE44_URL}</a> e faça login normalmente
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                  <div>
                    <p className="font-medium">Abra o Console do navegador</p>
                    <p className="text-sm text-muted-foreground">
                      Aperte <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs">F12</kbd> no teclado, depois clique na aba <strong>"Console"</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                  <div>
                    <p className="font-medium">Cole o código abaixo e aperte Enter</p>
                    <div className="mt-2 relative">
                      <code className="block p-3 rounded-lg bg-muted text-xs overflow-x-auto font-mono">
                        (async&#10140;{'{'}const e=["Prova","CustoLogistico","CustoRibeiraoPreto","CustoFranca","RecebiveisRibeiraoPreto","RecebiveisFranca","SocioLimeira","Configuracao"],d={};for(const t of e)&#123;const r=await fetch(`/api/entities/${'{'}t{'}'}`);d[t]=await r.json()&#125;window.__EXPORTED=JSON.stringify(d),console.log("✅ Pronto! Agora cole o comando abaixo:"),console.log("copy(window.__EXPORTED)"){'}'})()
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</span>
                  <div>
                    <p className="font-medium">Agora cole este segundo comando e aperte Enter</p>
                    <div className="mt-2">
                      <code className="block p-3 rounded-lg bg-muted text-xs font-mono">copy(window.__EXPORTED)</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Os dados foram copiados! Agora volte aqui e cole no campo abaixo.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">5</span>
                  <div>
                    <p className="font-medium">Cole os dados aqui embaixo e clique "Importar"</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import area */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Label className="text-base font-semibold">Dados exportados (JSON)</Label>
              <textarea
                value={rawData}
                onChange={e => setRawData(e.target.value)}
                placeholder='Cole os dados aqui... (vai começar com {"Prova": [...])'
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
                  <>Importando... <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" /></>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Importar Todos os Dados</>
                )}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
