import CustosPage from './CustosBase';
import { ENTITIES } from '../lib/db';

export default function CustosFranca() {
  return <CustosPage entity={ENTITIES.CUSTO_FRANCA} title="Custos Franca" subtitle="Gastos logísticos - Franca" pdfName="custos-franca.pdf" />;
}
