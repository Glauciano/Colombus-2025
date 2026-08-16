const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
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
  await new Promise(r => setTimeout(r, 3000));
  console.log('3. Google auth page:', page.url().substring(0, 80));
  
  // Type email on Google page
  console.log('4. Typing Google email...');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.type('input[type="email"]', 'glaucianosilva@gmail.com', { delay: 50 });
  
  // Click Next
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 4000));
  console.log('5. After email step, URL:', page.url().substring(0, 80));
  await page.screenshot({ path: '/tmp/google_step2.png' });
  
  // Type password
  console.log('6. Typing Google password...');
  try {
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.type('input[type="password"]', 'Gs030127', { delay: 50 });
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 5000));
  } catch(e) {
    console.log('Password input not found. Checking page...');
    await page.screenshot({ path: '/tmp/google_nopass.png' });
    const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
    console.log('Page text:', text.substring(0, 500));
  }
  
  console.log('7. Current URL:', page.url());
  await page.screenshot({ path: '/tmp/google_after_login.png' });
  
  // Check if we need to handle any consent/approve screen
  if (page.url().includes('accounts.google.com')) {
    console.log('Still on Google, might need consent...');
    // Try to click "Continue" or "Allow" buttons
    try {
      const continueBtn = await page.evaluateHandle(() => {
        const btns = [...document.querySelectorAll('button')];
        return btns.find(b => b.textContent.includes('Continue') || b.textContent.includes('Allow'));
      });
      if (continueBtn) {
        await continueBtn.click();
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch(e) {}
  }
  
  console.log('8. Final URL:', page.url());
  
  // If we're back on the app, we're logged in!
  if (!page.url().includes('accounts.google.com') && !page.url().includes('/login')) {
    console.log('9. LOGIN SUCCESSFUL!');
    await page.screenshot({ path: '/tmp/logged_in.png' });
    
    // Get token
    const token = await page.evaluate(() => localStorage.getItem('base44_access_token') || localStorage.getItem('token'));
    console.log('Token:', token ? token.substring(0, 40) + '...' : 'null');
    
    if (token) {
      fs.writeFileSync('/tmp/base44_token.txt', token);
      
      // Fetch all entities data
      const entities = [
        'Prova', 'CustoLogistico', 'CustoRibeiraoPreto', 'CustoFranca',
        'RecebiveisRibeiraoPreto', 'RecebiveisFranca', 'SocioLimeira', 'Configuracao'
      ];
      const allData = {};
      
      for (const entity of entities) {
        console.log(`Fetching ${entity}...`);
        try {
          const response = await page.evaluate(async (entityName) => {
            const res = await fetch(`/api/entities/${entityName}`);
            return await res.json();
          }, entity);
          allData[entity] = response;
          console.log(`  ${entity}: ${Array.isArray(response) ? response.length + ' records' : 'error'}`);
        } catch (err) {
          console.log(`  ${entity}: ERROR - ${err.message}`);
        }
      }
      
      fs.writeFileSync('/tmp/base44_data.json', JSON.stringify(allData, null, 2));
      console.log('\nData saved to /tmp/base44_data.json');
    }
  } else {
    console.log('Login may have failed or needs 2FA');
    await page.screenshot({ path: '/tmp/login_failed.png' });
    const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('Page text:', text.substring(0, 1000));
  }
  
  await browser.close();
})().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
