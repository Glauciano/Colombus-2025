import CCPage from './CCBase';
import { ENTITIES } from '../lib/db';

export default function CCRibeirao() {
  return <CCPage entity={ENTITIES.RECEIVEIS_RIBEIRAO} queryKey="recebiveis-ribeirao" title="Conta Corrente Ribeirão Preto" subtitle="Receíveis - Ribeirão Preto" pdfName="cc-ribeirao-preto.pdf" />;
}
