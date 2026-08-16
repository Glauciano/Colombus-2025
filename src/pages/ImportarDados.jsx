import React from 'react';
import { CheckCircle, AlertCircle, Database, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { hasSupabaseCredentials, isSupabaseEnabled, enableSupabase, disableSupabase } from '../lib/supabaseClient';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cmoaiyhwmrsaihibfhux.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AUHiIr1CvseO8Uy-XtqFyw_L3ELN2-4';

export default function ImportarDados() {
  const [supabaseStatus, setSupabaseStatus] = React.useState('idle');
  const [recordCounts, setRecordCounts] = React.useState(null);

  const testSupabase = async () => {
    if (!hasSupabaseCredentials()) { setSupabaseStatus('error'); return; }
    setSupabaseStatus('testing');
    try {
      const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      };

      // Test connection and count records
      const tables = ['provas', 'custo_logistico', 'custo_ribeirao_preto', 'custo_franca', 'recebiveis_ribeirao_preto', 'recebiveis_franca', 'socio_limeira', 'venda_anilha', 'configuracao'];
      const labels = ['Provas', 'Custos Logísticos', 'Custos Ribeirão', 'Custos Franca', 'Receíveis Ribeirão', 'Receíveis Franca', 'Sócios Limeira', 'Venda Anilhas', 'Configuração'];
      const counts = {};

      for (let i = 0; i < tables.length; i++) {
        try {
          const resp = await fetch(`${SUPABASE_URL}/rest/v1/${tables[i]}?select=id`, { headers });
          const data = await resp.json();
          counts[labels[i]] = Array.isArray(data) ? data.length : 0;
        } catch {
          counts[labels[i]] = -1;
        }
      }

      setRecordCounts(counts);
      setSupabaseStatus('connected');
    } catch {
      setSupabaseStatus('error');
    }
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
              <p className="text-sm text-muted-foreground">{isSupabaseEnabled() ? 'Dados salvos na nuvem automaticamente' : 'Dados salvos no navegador'}</p>
            </div>
            {isSupabaseEnabled()
              ? <Button variant="outline" size="sm" onClick={disableSupabase}>Desativar</Button>
              : <Button size="sm" onClick={enableSupabase}>Ativar</Button>
            }
          </div>

          {supabaseStatus === 'idle' && (
            <Button variant="outline" onClick={testSupabase} className="w-full">Testar Conexão</Button>
          )}
          {supabaseStatus === 'testing' && (
            <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Testando...</p>
          )}
          {supabaseStatus === 'connected' && (
            <>
              <p className="flex items-center gap-2 text-sm text-primary"><CheckCircle className="h-4 w-4" /> Conexão OK!</p>
              {recordCounts && (
                <div className="space-y-1 pt-2">
                  <p className="text-sm font-medium mb-2">Registros no banco:</p>
                  {Object.entries(recordCounts).map(([label, count]) => (
                    <div key={label} className="flex justify-between p-2 rounded bg-muted text-sm">
                      <span>{label}</span>
                      <span className={count > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                        {count >= 0 ? count : 'erro'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {supabaseStatus === 'error' && (
            <p className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> Erro na conexão.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
