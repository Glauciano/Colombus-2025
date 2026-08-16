const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Go to login page
  console.log('1. Navigating to login page...');
  await page.goto('https://colombus-race-pro.base44.app/login', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Take screenshot of login page
  await page.screenshot({ path: '/tmp/login_page.png' });
  console.log('2. Login page loaded');
  
  // Fill in email
  const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email"]');
  if (emailInput) {
    await emailInput.click();
    await emailInput.type('glaucianosilva@gmail.com', { delay: 50 });
    console.log('3. Email filled');
  } else {
    // Try all inputs
    const inputs = await page.$$('input');
    console.log('Found inputs:', inputs.length);
    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].evaluate(el => el.type);
      const name = await inputs[i].evaluate(el => el.name || el.placeholder || '');
      console.log(`  Input ${i}: type=${type}, name=${name}`);
    }
    // Type email in first visible text input
    if (inputs.length > 0) {
      await inputs[0].click();
      await inputs[0].type('glaucianosilva@gmail.com', { delay: 50 });
      console.log('3. Email filled (first input)');
    }
  }
  
  // Fill in password
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click();
    await passInput.type('Gs030127', { delay: 50 });
    console.log('4. Password filled');
  } else {
    console.log('4. No password input found!');
  }
  
  await page.screenshot({ path: '/tmp/login_filled.png' });
  
  // Click login button
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    console.log('5. Clicking submit...');
    await Promise.all([
      submitBtn.click(),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => console.log('Navigation timeout (might be okay)'))
    ]);
  } else {
    // Try clicking any button with "Sign in" or "Entrar" text
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      console.log('Button:', text.trim());
      if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('entrar') || text.toLowerCase().includes('login')) {
        console.log('5. Clicking button:', text.trim());
        await Promise.all([
          btn.click(),
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => console.log('Navigation timeout'))
        ]);
        break;
      }
    }
  }
  
  await page.screenshot({ path: '/tmp/login_after.png' });
  console.log('6. Current URL:', page.url());
  
  // Check if we're logged in by checking the URL
  if (page.url().includes('/login')) {
    console.log('ERROR: Still on login page. Login may have failed.');
    
    // Check for error messages
    const errorEl = await page.$('[class*="error"], [class*="alert"], [role="alert"]');
    if (errorEl) {
      const errorText = await errorEl.evaluate(el => el.textContent);
      console.log('Error message:', errorText);
    }
    
    await browser.close();
    process.exit(1);
  }
  
  console.log('7. Login successful! Extracting data...');
  
  // Get the auth token from localStorage
  const token = await page.evaluate(() => {
    return localStorage.getItem('base44_access_token') || localStorage.getItem('token');
  });
  console.log('8. Token:', token ? token.substring(0, 30) + '...' : 'null');
  
  // Save token
  if (token) {
    fs.writeFileSync('/tmp/base44_token.txt', token);
  }
  
  // Extract cookies
  const cookies = await page.cookies();
  fs.writeFileSync('/tmp/base44_cookies.json', JSON.stringify(cookies, null, 2));
  
  // Now fetch data from each entity using the API
  const entities = ['Prova', 'CustoLogistico', 'CustoRibeiraoPreto', 'CustoFranca', 'RecebiveisRibeiraoPreto', 'RecebiveisFranca', 'SocioLimeira', 'Configuracao'];
  const allData = {};
  
  for (const entity of entities) {
    console.log(`9. Fetching ${entity}...`);
    try {
      const response = await page.evaluate(async (entityName) => {
        const res = await fetch(`/api/entities/${entityName}`);
        return { status: res.status, data: await res.json() };
      }, entity);
      
      allData[entity] = response.data || response;
      console.log(`   ${entity}: ${Array.isArray(response.data) ? response.data.length + ' records' : JSON.stringify(response).substring(0, 100)}`);
    } catch (err) {
      console.log(`   ${entity}: ERROR - ${err.message}`);
    }
  }
  
  // Save all data
  fs.writeFileSync('/tmp/base44_data.json', JSON.stringify(allData, null, 2));
  console.log('\n10. Data saved to /tmp/base44_data.json');
  console.log('Summary:');
  for (const [entity, data] of Object.entries(allData)) {
    console.log(`  ${entity}: ${Array.isArray(data) ? data.length + ' records' : typeof data}`);
  }
  
  await browser.close();
})().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
