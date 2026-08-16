import React from 'react';
import { Trophy, Truck, Calendar, MapPin } from 'lucide-react';
import { ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Card, CardHeader, CardTitle, CardContent, PageHeader } from '../components/ui';

const statusStyle = {
  'Programada': 'bg-blue-50 text-blue-700',
  'Em Andamento': 'bg-amber-50 text-amber-700',
  'Concluída': 'bg-emerald-50 text-emerald-700',
  'Cancelada': 'bg-red-50 text-red-700',
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

  const programadas = provas.filter(p => p.status === 'Programada').length;
  const cidades = [...new Set(provas.map(p => p.cidade).filter(Boolean))].length;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Calendário de competições de pombos-correio" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-[#677e77] mb-1.5">Total de Provas</p>
          <p className="text-xl font-bold tracking-tight text-[#12211c]">{provas.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-[#677e77] mb-1.5">Gastos Logísticos</p>
          <p className="text-xl font-bold tracking-tight text-[#b8860b]">R$ {formatCurrency(totalCustos)}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-[#677e77] mb-1.5">Programadas</p>
          <p className="text-xl font-bold tracking-tight text-[#12211c]">{programadas}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-[#677e77] mb-1.5">Cidades</p>
          <p className="text-xl font-bold tracking-tight text-[#12211c]">{cidades}</p>
        </div>
      </div>

      {/* Provas Recentes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Provas Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          {provasRecentes.length === 0 ? (
            <p className="text-center py-12 text-[#9ca3af] text-sm">Nenhuma prova cadastrada</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[#f6f5f3]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#677e77] uppercase tracking-wider">Cidade</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#677e77] uppercase tracking-wider">Categoria</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#677e77] uppercase tracking-wider">KM</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#677e77] uppercase tracking-wider">Data</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#677e77] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                {provasRecentes.map(prova => (
                  <tr key={prova.id} className="hover:bg-[#f0fdf4] transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-[#12211c]">{prova.cidade || '—'}</td>
                    <td className="px-5 py-3 text-sm text-[#677e77]">{prova.categoria}</td>
                    <td className="px-5 py-3 text-sm text-[#677e77]">{prova.km || '—'}</td>
                    <td className="px-5 py-3 text-sm text-[#677e77]">{formatDate(prova.data_solta)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[prova.status] || statusStyle['Programada']}`}>
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
          <CardHeader>
            <CardTitle>Resumo de Custos</CardTitle>
          </CardHeader>
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
                  <p className="text-xs font-medium text-[#677e77]">{item.label}</p>
                  <p className="text-sm font-semibold text-[#12211c] mt-1">R$ {formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
