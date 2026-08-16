import CustosPage from './CustosBase';
import { ENTITIES } from '../lib/db';

export default function Custos() {
  return <CustosPage entity={ENTITIES.CUSTO_LOGISTICO} title="Custos" subtitle="Gastos logísticos gerais" pdfName="custos-logisticos.pdf" />;
}
