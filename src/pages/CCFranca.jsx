import CCPage from './CCBase';
import { ENTITIES } from '../lib/db';

export default function CCFranca() {
  return <CCPage entity={ENTITIES.RECEIVEIS_FRANCA} queryKey="recebiveis-franca" title="Conta Corrente Franca" subtitle="Receíveis - Franca" pdfName="cc-franca.pdf" />;
}
