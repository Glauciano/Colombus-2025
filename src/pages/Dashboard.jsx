import React from 'react';
import { Trophy, Truck, Wallet, Calendar, MapPin } from 'lucide-react';
import { ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge } from '../components/ui';

export default function Dashboard() {
  const { data: provas } = useCollection(ENTITIES.PROVA);
  const { data: custos } = useCollection(ENTITIES.CUSTO_LOGISTICO);
  const { data: config } = useCollection(ENTITIES.CONFIGURACAO);
  
  const valorCampeonato = config.find(c => c.chave === 'valor_campeonato');
  const totalProvas = provas.length;
  const copaFilhotes = provas.filter(p => p.categoria === 'Copa Filhotes').length;
  const campeonatoAdultos = provas.filter(p => p.categoria === 'Campeonato Adultos').length;
  
  const totalCustos = custos.reduce((sum, c) =>
    sum + (c.combustivel || 0) + (c.pedagio || 0) + (c.motorista || 0) +
    (c.gta_ajudante || 0) + (c.seguro_caminhao || 0) + (c.custo_manutencoes || 0), 0
  );

  const provasRecentes = [...provas]
    .sort((a, b) => (a.data_solta && b.data_solta) ? new Date(b.data_solta) - new Date(a.data_solta) : 0)
    .slice(0, 5);

  const statusColors = {
    'Programada': 'bg-blue-100 text-blue-800 border border-blue-200',
    'Em Andamento': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    'Concluída': 'bg-green-100 text-green-800 border border-green-200',
    'Cancelada': 'bg-red-100 text-red-800 border border-red-200',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(160 45% 22%)' }}>
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu calendário de competições de pombos-correio e monitore gastos logísticos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Total de Provas" value={totalProvas} subtitle={`${copaFilhotes} Copa Filhotes · ${campeonatoAdultos} Campeonato`} />
        <StatCard icon={Truck} label="Gastos Logísticos" value={`R$ ${formatCurrency(totalCustos)}`} accent={totalCustos > 0} />
        <StatCard icon={Calendar} label="Provas Programadas" value={provas.filter(p => p.status === 'Programada').length} />
        <StatCard icon={MapPin} label="Cidades" value={[...new Set(provas.map(p => p.cidade).filter(Boolean))].length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {provasRecentes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma prova cadastrada</p>
          ) : (
            <div className="space-y-3">
              {provasRecentes.map(prova => (
                <div key={prova.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{prova.cidade || 'Sem cidade'}</p>
                      <p className="text-xs text-muted-foreground">{prova.categoria} · {prova.km ? `${prova.km} km` : '—'} · {formatDate(prova.data_solta)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[prova.status] || statusColors['Programada']}`}>{prova.status || 'Programada'}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {custos.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Resumo de Custos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Combustível', value: custos.reduce((s, c) => s + (c.combustivel || 0), 0) },
                { label: 'Pedágio', value: custos.reduce((s, c) => s + (c.pedagio || 0), 0) },
                { label: 'Motorista', value: custos.reduce((s, c) => s + (c.motorista || 0), 0) },
                { label: 'GTA/Ajudante', value: custos.reduce((s, c) => s + (c.gta_ajudante || 0), 0) },
                { label: 'Seguro', value: custos.reduce((s, c) => s + (c.seguro_caminhao || 0), 0) },
                { label: 'Manutenção', value: custos.reduce((s, c) => s + (c.custo_manutencoes || 0), 0) },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-semibold text-sm">R$ {formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
