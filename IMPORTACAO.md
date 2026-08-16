# 🕊️ Como Importar os Dados do Base44

## Método: Pegar o token do navegador

O Google bloqueia login automatizado, então precisamos pegar o token manualmente do seu navegador.

### Passo a passo:

1. **Abra o app** no navegador: https://colombus-race-pro.base44.app
2. **Faça login** normalmente (com Google)
3. **Abra o DevTools** do navegador:
   - Chrome: `F12` ou `Ctrl+Shift+I` (Mac: `Cmd+Option+I`)
4. **Vá no Console** (tab "Console")
5. **Cole este código e aperte Enter:**

```javascript
copy(localStorage.getItem('base44_access_token') || localStorage.getItem('token'))
```

6. O token foi copiado para sua área de transferência (clipboard)
7. **Cole o token aqui no chat** para mim

---

### Alternativa: Exportar os dados direto

Se preferir, depois de logado, cole ESTE código no Console:

```javascript
(async () => {
  const entities = ['Prova', 'CustoLogistico', 'CustoRibeiraoPreto', 'CustoFranca', 'RecebiveisRibeiraoPreto', 'RecebiveisFranca', 'SocioLimeira', 'Configuracao'];
  const allData = {};
  for (const entity of entities) {
    const res = await fetch(`/api/entities/${entity}`);
    allData[entity] = await res.json();
  }
  copy(JSON.stringify(allData, null, 2));
  console.log('✅ Dados copiados! Total de registros por entidade:');
  for (const [k, v] of Object.entries(allData)) {
    console.log(`  ${k}: ${Array.isArray(v) ? v.length : 'erro'}`);
  }
})();
```

Isso vai copiar **TODOS os dados** do seu app para a área de transferência. 
Depois é só colar aqui!
