import CustosPage from './CustosBase';
import { ENTITIES } from '../lib/db';

export default function CustosRibeirao() {
  return <CustosPage entity={ENTITIES.CUSTO_RIBEIRAO} title="Custos Ribeirão Preto" subtitle="Gastos logísticos - Ribeirão Preto" pdfName="custos-ribeirao-preto.pdf" />;
}
