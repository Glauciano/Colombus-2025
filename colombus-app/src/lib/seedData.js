// Seed data imported from Base44
const PROVAS = [
  { data_solta:'2026-07-12', cidade:'Araguari M.G', km:456, dia_solta:'Domingo', data_embarque:'2026-07-11', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Sábado', status:'Programada' },
  { data_solta:'2026-07-18', cidade:'Catalão G.O', km:489, dia_solta:'Sábado', data_embarque:'2026-07-16', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Quinta Feira', status:'Programada' },
  { data_solta:'2026-06-14', cidade:'Jardinopolis S.P', km:174, dia_solta:'Domingo', data_embarque:'2026-06-13', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Sábado', status:'Programada' },
  { data_solta:'2026-08-29', cidade:'Brasília D.F', km:760, dia_solta:'Sábado', data_embarque:'2026-08-27', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Quinta Feira', status:'Programada' },
  { data_solta:'2026-08-15', cidade:'Cristalina G.O', km:645, dia_solta:'Sábado', data_embarque:'2026-08-13', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Quinta Feira', status:'Programada' },
  { data_solta:'2026-06-21', cidade:'São Joaquim da Barra S.P', km:231, dia_solta:'Domingo', data_embarque:'2026-06-20', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Sábado', status:'Programada' },
  { data_solta:'2026-07-05', cidade:'Uberaba M.G', km:333, dia_solta:'Domingo', data_embarque:'2026-07-04', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Sábado', status:'Programada' },
  { data_solta:'2026-08-01', cidade:'Campo Alegre G.O', km:555, dia_solta:'Sábado', data_embarque:'2026-07-30', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Quinta Feira', status:'Programada' },
  { data_solta:'2026-06-07', cidade:'Cravinhos S.P', km:144, dia_solta:'Domingo', data_embarque:'2026-06-06', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Sábado', status:'Programada' },
  { data_solta:'2026-06-28', cidade:'Igarapava S.P', km:289, dia_solta:'Domingo', data_embarque:'2026-06-27', categoria:'Campeonato Adultos', valor:200, dia_embarque:'Sábado', status:'Programada' }
];

// Add more entities here as data comes in
const CUSTO_LOGISTICO = [
  { cidade:'Catalão G.O', km:1128, combustivel:1242.46, pedagio:217, motorista:750, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:1459.46, custo_total:3573.08, observacao:'' },
  { cidade:'Uberaba M.G', km:696, combustivel:750.77, pedagio:175.6, motorista:650, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:926.37, custo_total:2939.99, observacao:'' },
  { cidade:'Cristalina G.O', km:1490, combustivel:1675.14, pedagio:254, motorista:950, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:1929.14, custo_total:4242.76, observacao:'' },
  { cidade:'Brasília D.F', km:1820, combustivel:2024, pedagio:281.82, motorista:1200, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:2305.82, custo_total:4869.44, observacao:'' },
  { cidade:'Igarapava S.P', km:624, combustivel:674.66, pedagio:164.4, motorista:550, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:839.06, custo_total:2752.68, observacao:'' },
  { cidade:'Cravinhos S.P', km:316, combustivel:349.06, pedagio:101.2, motorista:550, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:450.26, custo_total:2363.88, observacao:'' },
  { cidade:'Campo Alegre G.O', km:1350, combustivel:1527.14, pedagio:236.2, motorista:850, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:1763.34, custo_total:3976.96, observacao:'' },
  { cidade:'São Joaquim da Barra S.P', km:498, combustivel:541.46, pedagio:129.8, motorista:550, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:671.26, custo_total:2584.88, observacao:'' },
  { cidade:'Araguari M.G', km:974, combustivel:1079.66, pedagio:202.4, motorista:650, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:1282.06, custo_total:3295.68, observacao:'' },
  { cidade:'Jardinopolis S.P', km:398, combustivel:435.74, pedagio:101.2, motorista:550, gta_ajudante:170, seguro_caminhao:193.62, custo_manutencoes:1000, total_gastos:536.94, custo_total:2450.56, observacao:'' }
];
const CUSTO_RIBEIRAO = [
  { descricao:'Uberaba M.G', km:696, combustivel:375.39, pedagio:87.8, motorista:325, gta_ajudante:85, seguro_caminhao:96.81, custo_manutencoes:500, total_gastos:463.19, custo_total:1470, observacao:'' },
  { descricao:'Brasília D.F', km:1820, combustivel:674.67, pedagio:93.94, motorista:400, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:768.61, custo_total:1623.15, observacao:'' },
  { descricao:'Cristalina G.O', km:1490, combustivel:558.38, pedagio:84.67, motorista:316.67, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:643.05, custo_total:1414.26, observacao:'' },
  { descricao:'Igarapava S.P', km:624, combustivel:337.33, pedagio:82.2, motorista:275, gta_ajudante:85, seguro_caminhao:96.81, custo_manutencoes:500, total_gastos:419.53, custo_total:1376.34, observacao:'' },
  { descricao:'Catalão G.O', km:1128, combustivel:414.15, pedagio:72.33, motorista:250, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:486.48, custo_total:1191.02, observacao:'' },
  { descricao:'Campo Alegre G.O', km:1350, combustivel:509.05, pedagio:78.73, motorista:283.33, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:587.78, custo_total:1325.65, observacao:'' },
  { descricao:'Araguari M.G', km:974, combustivel:359.89, pedagio:67.47, motorista:216.67, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:427.36, custo_total:1098.57, observacao:'' }
];
const CUSTO_FRANCA = [
  { descricao:'Catalão G.O', km:1128, combustivel:414.15, pedagio:72.33, motorista:250, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:486.48, custo_total:1191.02, observacao:'' },
  { descricao:'Araguari M.G', km:974, combustivel:359.89, pedagio:67.47, motorista:216.67, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:427.36, custo_total:1098.57, observacao:'' },
  { descricao:'Cristalina G.O', km:1490, combustivel:558.38, pedagio:84.67, motorista:316.67, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:643.05, custo_total:1414.26, observacao:'' },
  { descricao:'Campo Alegre G.O', km:1350, combustivel:509.05, pedagio:78.73, motorista:283.33, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:587.78, custo_total:1325.65, observacao:'' },
  { descricao:'Brasília D.F', km:1820, combustivel:674.67, pedagio:93.94, motorista:400, gta_ajudante:56.67, seguro_caminhao:64.54, custo_manutencoes:333.33, total_gastos:768.61, custo_total:1623.15, observacao:'' }
];
const RECEIVEIS_RIBEIRAO = [
  { descricao:'5° Parcela referente a campanha 2026', valor:1500, data_vencimento:'2026-08-08', data_pagamento:'2026-08-08', status:'Pago', observacao:'' },
  { descricao:'4° Parcela referente a campanha de 2026', valor:1000, data_vencimento:'2026-07-25', data_pagamento:'2026-07-25', status:'Pago', observacao:'' },
  { descricao:'3° Parcela referente a campanha 2026', valor:1000, data_vencimento:'2026-07-18', data_pagamento:'2026-07-18', status:'Pago', observacao:'' },
  { descricao:'2° Parcela referente campanha 2026', valor:1000, data_vencimento:'2026-07-11', data_pagamento:'2026-07-11', status:'Pago', observacao:'' },
  { descricao:'1° Parcela referente a campanha 2026', valor:1000, data_vencimento:'2026-07-04', data_pagamento:'2026-07-04', status:'Pago', observacao:'' }
];
const RECEIVEIS_FRANCA = [
  { descricao:'2° Parcela referente a campanha 2026', valor:2000, data_vencimento:'2026-08-10', data_pagamento:'2026-08-10', status:'Pago', observacao:'' },
  { descricao:'1° parcela referente a campanha 2026', valor:1500, data_vencimento:'2026-07-18', data_pagamento:'2026-07-18', status:'Pago', observacao:'' }
];
const SOCIO_LIMEIRA = [
  { nome:'Carlos Alberto da Silva', telefone:'', email:'', observacao:'', parcela_1:200, parcela_2:200, parcela_3:200, parcela_4:200, parcela_5:200, parcela_6:500, parcela_7:0, parcela_8:0, parcela_9:0, parcela_10:0, data_parcela_1:'2026-01-05', data_parcela_2:'2026-06-05', data_parcela_3:'2026-03-05', data_parcela_4:'2026-04-05', data_parcela_5:'2026-05-05', data_parcela_6:'2026-07-04', data_parcela_7:'', data_parcela_8:'', data_parcela_9:'', data_parcela_10:'', pago_parcela_1:true, pago_parcela_2:true, pago_parcela_3:true, pago_parcela_4:true, pago_parcela_5:true, pago_parcela_6:true, pago_parcela_7:false, pago_parcela_8:false, pago_parcela_9:false, pago_parcela_10:false },
  { nome:'Cesar Araraquara', telefone:'', email:'', observacao:'', parcela_1:200, parcela_2:200, parcela_3:200, parcela_4:200, parcela_5:200, parcela_6:200, parcela_7:200, parcela_8:0, parcela_9:0, parcela_10:0, data_parcela_1:'2025-01-05', data_parcela_2:'2026-06-19', data_parcela_3:'2026-06-27', data_parcela_4:'2026-07-04', data_parcela_5:'2026-07-12', data_parcela_6:'2026-07-20', data_parcela_7:'2026-07-31', data_parcela_8:'', data_parcela_9:'', data_parcela_10:'', pago_parcela_1:true, pago_parcela_2:true, pago_parcela_3:true, pago_parcela_4:true, pago_parcela_5:true, pago_parcela_6:true, pago_parcela_7:true, pago_parcela_8:false, pago_parcela_9:false, pago_parcela_10:false },
  { nome:'Edosn Roberto da Silva', telefone:'', email:'', observacao:'', parcela_1:250, parcela_2:250, parcela_3:250, parcela_4:500, parcela_5:0, parcela_6:0, parcela_7:0, parcela_8:0, parcela_9:0, parcela_10:0, data_parcela_1:'2026-01-05', data_parcela_2:'2026-06-05', data_parcela_3:'2026-07-07', data_parcela_4:'2026-08-08', data_parcela_5:'', data_parcela_6:'', data_parcela_7:'', data_parcela_8:'', data_parcela_9:'', data_parcela_10:'', pago_parcela_1:true, pago_parcela_2:true, pago_parcela_3:true, pago_parcela_4:true, pago_parcela_5:false, pago_parcela_6:false, pago_parcela_7:false, pago_parcela_8:false, pago_parcela_9:false, pago_parcela_10:false },
  { nome:'Fernando Araujo', telefone:'', email:'', observacao:'', parcela_1:200, parcela_2:200, parcela_3:200, parcela_4:200, parcela_5:200, parcela_6:200, parcela_7:200, parcela_8:200, parcela_9:200, parcela_10:200, data_parcela_1:'2026-01-05', data_parcela_2:'2026-02-05', data_parcela_3:'2026-03-05', data_parcela_4:'2026-04-05', data_parcela_5:'2026-05-05', data_parcela_6:'2026-06-05', data_parcela_7:'2026-07-05', data_parcela_8:'2026-08-05', data_parcela_9:'2026-09-05', data_parcela_10:'2026-10-05', pago_parcela_1:true, pago_parcela_2:true, pago_parcela_3:true, pago_parcela_4:true, pago_parcela_5:true, pago_parcela_6:true, pago_parcela_7:true, pago_parcela_8:true, pago_parcela_9:true, pago_parcela_10:true },
  { nome:'Paschoal Louvadine', telefone:'', email:'', observacao:'', parcela_1:200, parcela_2:200, parcela_3:200, parcela_4:200, parcela_5:200, parcela_6:200, parcela_7:200, parcela_8:200, parcela_9:0, parcela_10:0, data_parcela_1:'2026-06-06', data_parcela_2:'2026-06-20', data_parcela_3:'2026-06-27', data_parcela_4:'2026-07-04', data_parcela_5:'2026-07-11', data_parcela_6:'2026-07-17', data_parcela_7:'2026-07-25', data_parcela_8:'2026-08-08', data_parcela_9:'', data_parcela_10:'', pago_parcela_1:true, pago_parcela_2:true, pago_parcela_3:true, pago_parcela_4:true, pago_parcela_5:true, pago_parcela_6:true, pago_parcela_7:true, pago_parcela_8:true, pago_parcela_9:false, pago_parcela_10:false },
  { nome:'Vilmar José Sintra', telefone:'', email:'', observacao:'', parcela_1:200, parcela_2:200, parcela_3:200, parcela_4:200, parcela_5:200, parcela_6:200, parcela_7:200, parcela_8:200, parcela_9:200, parcela_10:200, data_parcela_1:'2026-01-05', data_parcela_2:'2026-02-05', data_parcela_3:'2026-03-05', data_parcela_4:'2026-04-05', data_parcela_5:'2026-05-05', data_parcela_6:'2026-06-05', data_parcela_7:'2026-07-05', data_parcela_8:'2026-08-05', data_parcela_9:'2026-09-05', data_parcela_10:'2026-10-05', pago_parcela_1:true, pago_parcela_2:true, pago_parcela_3:true, pago_parcela_4:true, pago_parcela_5:true, pago_parcela_6:true, pago_parcela_7:true, pago_parcela_8:true, pago_parcela_9:true, pago_parcela_10:true }
];
const VENDA_ANILHA = [];
const CONFIGURACAO = [
  { chave:'valor_campeonato', valor_numero:2000, valor_texto:'10x de R$ 200,00' }
];

// Function to seed all data into localStorage
export function seedData() {
  const seed = (key, data) => {
    const existing = localStorage.getItem('colombus_' + key);
    if (existing && JSON.parse(existing).length > 0) {
      console.log(`Skipping ${key} - already has data`);
      return;
    }
    const items = data.map((item, i) => ({
      ...item,
      id: item.id || `imported_${key}_${i+1}`,
      createdAt: item.created_date || new Date().toISOString()
    }));
    localStorage.setItem('colombus_' + key, JSON.stringify(items));
    console.log(`✅ Seeded ${key}: ${items.length} records`);
  };

  seed('provas', PROVAS);
  seed('custo_logistico', CUSTO_LOGISTICO);
  seed('custo_ribeirao', CUSTO_RIBEIRAO);
  seed('custo_franca', CUSTO_FRANCA);
  seed('receiveis_ribeirao', RECEIVEIS_RIBEIRAO);
  seed('receiveis_franca', RECEIVEIS_FRANCA);
  seed('socio_limeira', SOCIO_LIMEIRA);
  seed('venda_anilha', VENDA_ANILHA);
  seed('configuracao', CONFIGURACAO);
}

// Function to add more data after initial seed
export function addImportedData(entityKey, data) {
  const key = 'colombus_' + entityKey;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const newItems = data.map((item, i) => ({
    ...item,
    id: item.id || `imported_${entityKey}_${existing.length + i + 1}`,
    createdAt: item.created_date || new Date().toISOString()
  }));
  localStorage.setItem(key, JSON.stringify([...existing, ...newItems]));
  console.log(`✅ Added ${newItems.length} records to ${entityKey} (total: ${existing.length + newItems.length})`);
}
