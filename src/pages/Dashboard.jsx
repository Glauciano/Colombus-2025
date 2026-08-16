import React from 'react';
import { Trophy, MapPin, Route, TrendingUp } from 'lucide-react';
import { ENTITIES, formatCurrency, formatDate } from '../lib/db';
import { useCollection } from '../lib/useCollection';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const statusVariant = {
  'Programada': 'default',
  'Em Andamento': 'secondary',
  'Concluída': 'outline',
  'Cancelada': 'destructive',
};

export default function Dashboard() {
  const { data: provas } = useCollection(ENTITIES.PROVA);
  const { data: custos } = useCollection(ENTITIES.CUSTO_LOGISTICO);

  const totalCustos = custos.reduce((sum, c) =>
    sum + (c.combustivel || 0) + (c.pedagio || 0) + (c.motorista || 0) +
    (c.gta_ajudante || 0) + (c.seguro_caminhao || 0) + (c.custo_manutencoes || 0), 0
  );

  const maxKm = Math.max(0, ...provas.map(p => p.km || 0));
  const provasRecentes = [...provas]
    .sort((a, b) => (a.data_solta && b.data_solta) ? new Date(b.data_solta) - new Date(a.data_solta) : 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats - exact Base44 dashboard cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Provas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{provas.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distância Máxima</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maxKm} km</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prova mais longa</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {provas.length > 0 ? [...provas].sort((a,b) => (b.km||0) - (a.km||0))[0]?.cidade || '—' : '—'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total Logístico</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">R$ {formatCurrency(totalCustos)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Próximas Provas table - exact Base44 layout */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Provas</CardTitle>
          <CardDescription>Calendário de competições de pombos-correio</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>KM</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data Embarque</TableHead>
                <TableHead>Data Solta</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provasRecentes.map(prova => (
                <TableRow key={prova.id}>
                  <TableCell className="font-medium">{prova.cidade || '—'}</TableCell>
                  <TableCell>{prova.km || '—'}</TableCell>
                  <TableCell>{prova.categoria}</TableCell>
                  <TableCell>{formatDate(prova.data_embarque)}</TableCell>
                  <TableCell>{formatDate(prova.data_solta)}</TableCell>
                  <TableCell>{prova.valor ? `R$ ${formatCurrency(prova.valor)}` : '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[prova.status] || 'default'}>
                      {prova.status || 'Programada'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {provasRecentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhuma prova cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
