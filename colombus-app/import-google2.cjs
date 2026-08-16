const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Remove webdriver detection
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  
  // Go to login page
  console.log('1. Going to Colombus login page...');
  await page.goto('https://colombus-race-pro.base44.app/login', { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Click Continue with Google
  console.log('2. Clicking Continue with Google...');
  const googleBtn = await page.evaluateHandle(() => {
    const btns = [...document.querySelectorAll('button')];
    return btns.find(b => b.textContent.includes('Google'));
  });
  await googleBtn.click();
  await new Promise(r => setTimeout(r, 5000));
  console.log('3. On Google page:', page.url().includes('accounts.google.com'));
  
  // Type email in Google's identifier input
  console.log('4. Typing email...');
  const emailInput = await page.waitForSelector('input[name="identifier"]', { timeout: 10000 });
  await emailInput.click();
  await page.type('input[name="identifier"]', 'glaucianosilva@gmail.com', { delay: 80 });
  
  // Click Next button
  console.log('5. Clicking Next...');
  const nextBtn = await page.evaluateHandle(() => {
    const btns = [...document.querySelectorAll('button')];
    return btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Próximo'));
  });
  if (nextBtn) {
    await nextBtn.click();
  } else {
    await page.keyboard.press('Enter');
  }
  
  await new Promise(r => setTimeout(r, 5000));
  console.log('6. URL after email:', page.url().substring(0, 80));
  await page.screenshot({ path: '/tmp/google_password_step.png' });
  
  // Type password
  console.log('7. Typing password...');
  try {
    const passInput = await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await passInput.click();
    await page.type('input[type="password"]', 'Gs030127', { delay: 80 });
    
    // Click Next again
    const nextBtn2 = await page.evaluateHandle(() => {
      const btns = [...document.querySelectorAll('button')];
      return btns.find(b => b.textContent.includes('Next') || b.textContent.includes('Próximo'));
    });
    if (nextBtn2) {
      await nextBtn2.click();
    } else {
      await page.keyboard.press('Enter');
    }
    
    await new Promise(r => setTimeout(r, 8000));
    console.log('8. URL after password:', page.url().substring(0, 80));
    await page.screenshot({ path: '/tmp/google_after_password.png' });
    
    // Check for consent screen
    if (page.url().includes('accounts.google.com')) {
      console.log('9. Possible consent/2FA screen...');
      const pageText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
      console.log('Page text (first 500):', pageText.substring(0, 500));
      
      // Try clicking Continue/Consent
      try {
        const consentBtn = await page.evaluateHandle(() => {
          const btns = [...document.querySelectorAll('button')];
          return btns.find(b => 
            b.textContent.includes('Continue') || 
            b.textContent.includes('Allow') ||
            b.textContent.includes('Concordo')
          );
        });
        if (consentBtn) {
          console.log('Clicking consent button...');
          await consentBtn.click();
          await new Promise(r => setTimeout(r, 5000));
        }
      } catch(e) {}
    }
    
  } catch(e) {
    console.log('Password step error:', e.message);
    await page.screenshot({ path: '/tmp/google_error.png' });
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log('Page text:', pageText.substring(0, 500));
  }
  
  console.log('9. Final URL:', page.url());
  await page.screenshot({ path: '/tmp/google_final.png' });
  
  // Check if we're logged in to the app
  if (!page.url().includes('accounts.google.com') && !page.url().includes('/login')) {
    console.log('\n✅ LOGIN SUCCESSFUL!');
    
    // Get token
    const token = await page.evaluate(() => 
      localStorage.getItem('base44_access_token') || localStorage.getItem('token')
    );
    console.log('Token:', token ? token.substring(0, 40) + '...' : 'null');
    
    if (token) {
      fs.writeFileSync('/tmp/base44_token.txt', token);
      
      // Fetch all data
      const entities = [
        'Prova', 'CustoLogistico', 'CustoRibeiraoPreto', 'CustoFranca',
        'RecebiveisRibeiraoPreto', 'RecebiveisFranca', 'SocioLimeira', 'Configuracao'
      ];
      const allData = {};
      
      for (const entity of entities) {
        console.log(`\nFetching ${entity}...`);
        try {
          const response = await page.evaluate(async (entityName) => {
            const res = await fetch(`/api/entities/${entityName}`);
            return await res.json();
          }, entity);
          allData[entity] = response;
          console.log(`  ${entity}: ${Array.isArray(response) ? response.length + ' records' : JSON.stringify(response).substring(0, 100)}`);
        } catch (err) {
          console.log(`  ${entity}: ERROR - ${err.message}`);
        }
      }
      
      fs.writeFileSync('/tmp/base44_data.json', JSON.stringify(allData, null, 2));
      console.log('\n✅ Data saved to /tmp/base44_data.json');
      
      // Summary
      console.log('\n=== SUMMARY ===');
      for (const [entity, data] of Object.entries(allData)) {
        if (Array.isArray(data)) {
          console.log(`${entity}: ${data.length} records`);
        }
      }
    }
  } else {
    console.log('\n❌ Login failed or requires 2FA');
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('Page text:', pageText.substring(0, 800));
  }
  
  await browser.close();
})().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
