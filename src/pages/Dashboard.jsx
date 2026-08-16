import React from 'react';
import { Trophy, Truck, Calendar, MapPin } from 'lucide-react';
import { ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

const statusStyle = {
  'Programada': 'bg-[#eff6ff] text-[#1d4ed8]',
  'Em Andamento': 'bg-[#fefce8] text-[#b8860b]',
  'Concluída': 'bg-[#f0fdf4] text-[#15803d]',
  'Cancelada': 'bg-[#fef2f2] text-[#dc2626]',
};

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#12211c]">Dashboard</h1>
        <p className="text-sm text-[#677e77] mt-0.5">Calendário de competições de pombos-correio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md border border-[#e5e7eb] shadow-sm p-4">
          <p className="text-xs text-[#677e77] font-medium mb-1">Total de Provas</p>
          <p className="text-lg font-semibold text-[#12211c]">{provas.length}</p>
        </div>
        <div className="bg-white rounded-md border border-[#e5e7eb] shadow-sm p-4">
          <p className="text-xs text-[#677e77] font-medium mb-1">Gastos Logísticos</p>
          <p className="text-lg font-semibold text-[#b8860b]">R$ {formatCurrency(totalCustos)}</p>
        </div>
        <div className="bg-white rounded-md border border-[#e5e7eb] shadow-sm p-4">
          <p className="text-xs text-[#677e77] font-medium mb-1">Programadas</p>
          <p className="text-lg font-semibold text-[#12211c]">{provas.filter(p => p.status === 'Programada').length}</p>
        </div>
        <div className="bg-white rounded-md border border-[#e5e7eb] shadow-sm p-4">
          <p className="text-xs text-[#677e77] font-medium mb-1">Cidades</p>
          <p className="text-lg font-semibold text-[#12211c]">{[...new Set(provas.map(p => p.cidade).filter(Boolean))].length}</p>
        </div>
      </div>

      {/* Provas Recentes */}
      <Card>
        <CardHeader><CardTitle>Provas Recentes</CardTitle></CardHeader>
        <CardContent className="p-0">
          {provasRecentes.length === 0 ? (
            <p className="text-center py-10 text-[#9ca3af] text-sm">Nenhuma prova cadastrada</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#f6f5f3]">
                <tr>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#677e77] uppercase">Cidade</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#677e77] uppercase">Categoria</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#677e77] uppercase">KM</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#677e77] uppercase">Data</th>
                  <th className="px-5 py-2.5 text-left text-xs font-medium text-[#677e77] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {provasRecentes.map(prova => (
                  <tr key={prova.id} className="hover:bg-[#f0fdf4]">
                    <td className="px-5 py-2.5 text-sm font-medium text-[#12211c]">{prova.cidade || '—'}</td>
                    <td className="px-5 py-2.5 text-sm text-[#677e77]">{prova.categoria}</td>
                    <td className="px-5 py-2.5 text-sm text-[#677e77]">{prova.km || '—'}</td>
                    <td className="px-5 py-2.5 text-sm text-[#677e77]">{formatDate(prova.data_solta)}</td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[prova.status] || statusStyle['Programada']}`}>
                        {prova.status || 'Programada'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <p className="text-xs text-[#677e77]">{item.label}</p>
                  <p className="text-sm font-semibold text-[#12211c] mt-0.5">R$ {formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
