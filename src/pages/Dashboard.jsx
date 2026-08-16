import React from 'react';
import { Trophy, Truck, Wallet, Calendar, MapPin, TrendingUp, Users } from 'lucide-react';
import { ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge } from '../components/ui';

const statusColors = {
  'Programada': 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  'Em Andamento': 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  'Concluída': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  'Cancelada': 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

export default function Dashboard() {
  const { data: provas } = useCollection(ENTITIES.PROVA);
  const { data: custos } = useCollection(ENTITIES.CUSTO_LOGISTICO);
  const { data: config } = useCollection(ENTITIES.CONFIGURACAO);
  
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

  const proximaProva = [...provas]
    .filter(p => p.status === 'Programada' && p.data_solta)
    .sort((a, b) => new Date(a.data_solta) - new Date(b.data_solta))[0];

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8" style={{
        background: 'linear-gradient(135deg, hsl(160 45% 22%) 0%, hsl(160 35% 30%) 50%, hsl(160 25% 35%) 100%)'
      }}>
        <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
          <Trophy className="w-full h-full" />
        </div>
        <div className="relative z-10">
          <p className="text-sm font-medium text-emerald-200 mb-1">Bem-vindo ao</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Colombus 2025
          </h1>
          <p className="text-emerald-100/70 mt-2 text-sm max-w-lg">
            Gerencie seu calendário de competições de pombos-correio e monitore gastos logísticos
          </p>
          {proximaProva && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span className="text-sm text-white/90">
                Próxima prova: <strong className="text-amber-300">{proximaProva.cidade}</strong> — {formatDate(proximaProva.data_solta)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Total de Provas" value={totalProvas} subtitle={`${copaFilhotes} Copa · ${campeonatoAdultos} Camp.`} />
        <StatCard icon={TrendingUp} label="Gastos Logísticos" value={`R$ ${formatCurrency(totalCustos)}`} accent={totalCustos > 0} />
        <StatCard icon={Calendar} label="Programadas" value={provas.filter(p => p.status === 'Programada').length} />
        <StatCard icon={MapPin} label="Cidades" value={[...new Set(provas.map(p => p.cidade).filter(Boolean))].length} />
      </div>

      {/* Provas Recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              Provas Recentes
            </CardTitle>
            <span className="text-xs text-muted-foreground font-medium">{provas.length} total</span>
          </div>
        </CardHeader>
        <CardContent>
          {provasRecentes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma prova cadastrada</p>
          ) : (
            <div className="space-y-2">
              {provasRecentes.map(prova => (
                <div key={prova.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{prova.cidade || 'Sem cidade'}</p>
                      <p className="text-xs text-muted-foreground">{prova.categoria} · {prova.km ? `${prova.km} km` : '—'} · {formatDate(prova.data_solta)}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[prova.status] || statusColors['Programada']}`}>
                    {prova.status || 'Programada'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Custos */}
      {custos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              Resumo de Custos
            </CardTitle>
          </CardHeader>
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
                <div key={item.label} className="p-3 rounded-xl bg-muted/40">
                  <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</p>
                  <p className="font-bold text-sm mt-0.5" style={{ color: 'hsl(160 45% 22%)' }}>R$ {formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
