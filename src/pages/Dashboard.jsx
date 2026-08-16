import React from 'react';
import { Trophy, Truck, Calendar, MapPin } from 'lucide-react';
import { ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

export default function Dashboard() {
  const { data: provas } = useCollection(ENTITIES.PROVA);
  const { data: custos } = useCollection(ENTITIES.CUSTO_LOGISTICO);

  const totalCustos = custos.reduce((sum, c) =>
    sum + (c.combustivel || 0) + (c.pedagio || 0) + (c.motorista || 0) +
    (c.gta_ajudante || 0) + (c.seguro_caminhao || 0) + (c.custo_manutencoes || 0), 0
  );

  const provasRecentes = [...provas]
    .sort((a, b) => (a.data_solta && b.data_solta) ? new Date(b.data_solta) - new Date(a.data_solta) : 0)
    .slice(0, 5);

  const statusStyle = {
    'Programada': 'bg-blue-50 text-blue-700',
    'Em Andamento': 'bg-yellow-50 text-yellow-700',
    'Concluída': 'bg-green-50 text-green-700',
    'Cancelada': 'bg-red-50 text-red-700',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Calendário de competições de pombos-correio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Total de Provas</p>
          <p className="text-2xl font-semibold text-gray-900">{provas.length}</p>
          <p className="text-xs text-gray-400 mt-1">{provas.filter(p => p.categoria === 'Copa Filhotes').length} Copa · {provas.filter(p => p.categoria === 'Campeonato Adultos').length} Campeonato</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Gastos Logísticos</p>
          <p className="text-2xl font-semibold text-amber-600">R$ {formatCurrency(totalCustos)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Programadas</p>
          <p className="text-2xl font-semibold text-gray-900">{provas.filter(p => p.status === 'Programada').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Cidades</p>
          <p className="text-2xl font-semibold text-gray-900">{[...new Set(provas.map(p => p.cidade).filter(Boolean))].length}</p>
        </div>
      </div>

      {/* Provas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Provas Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {provasRecentes.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">Nenhuma prova cadastrada</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {provasRecentes.map(prova => (
                <div key={prova.id} className="flex items-center justify-between px-6 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{prova.cidade || '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{prova.categoria} · {prova.km ? `${prova.km} km` : '—'} · {formatDate(prova.data_solta)}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[prova.status] || statusStyle['Programada']}`}>
                    {prova.status || 'Programada'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Custos */}
      {custos.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Resumo de Custos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: 'Combustível', value: custos.reduce((s, c) => s + (c.combustivel || 0), 0) },
                { label: 'Pedágio', value: custos.reduce((s, c) => s + (c.pedagio || 0), 0) },
                { label: 'Motorista', value: custos.reduce((s, c) => s + (c.motorista || 0), 0) },
                { label: 'GTA/Ajudante', value: custos.reduce((s, c) => s + (c.gta_ajudante || 0), 0) },
                { label: 'Seguro', value: custos.reduce((s, c) => s + (c.seguro_caminhao || 0), 0) },
                { label: 'Manutenção', value: custos.reduce((s, c) => s + (c.custo_manutencoes || 0), 0) },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">R$ {formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
