const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleMsgs = [];
  page.on('console', msg => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleMsgs.push(`[PAGEERROR] ${err.stack || err.message}`));

  try {
    console.log('=== 1. Login ===');
    await page.goto('http://localhost:4200/login', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('input[placeholder="Votre identifiant"]', { timeout: 15000 });
    await page.fill('input[placeholder="Votre identifiant"]', 'ethernanos');
    await page.fill('input[placeholder="Votre mot de passe"]', 'admin1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    await page.waitForTimeout(4000);

    // Inspect header component internals
    const info1 = await page.evaluate(() => {
      const el = document.querySelector('app-header');
      if (!el) return { error: 'no app-header element' };
      const ng = window['ng'];
      if (!ng || !ng.getComponent) return { error: 'no ng.getComponent' };
      const comp = ng.getComponent(el);
      if (!comp) return { error: 'no component' };
      return {
        hasSearchControl: !!comp.searchControl,
        searchValue: comp.searchControl?.value,
        showResults: comp.showResults,
        hasFilteredPages: !!comp.filteredPages$,
        filteredPagesType: typeof comp.filteredPages$,
      };
    });
    console.log('Header internals before typing:', JSON.stringify(info1));

    // Subscribe to filteredPages$ and inspect emissions
    const subInfo = await page.evaluate(() => {
      return new Promise((resolve) => {
        const el = document.querySelector('app-header');
        const ng = window['ng'];
        const comp = ng.getComponent(el);
        const emissions = [];
        const sub = comp.filteredPages$.subscribe({
          next: (v) => { emissions.push({ len: Array.isArray(v) ? v.length : v, showResults: comp.showResults, term: comp.searchControl.value }); },
          error: (e) => { resolve({ error: String(e), emissions }); },
          complete: () => { resolve({ complete: true, emissions }); },
        });
        // Type after subscription
        setTimeout(() => {
          const input = document.querySelector('input[placeholder="Recherche rapide..."]');
          input.value = 'élèves';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          setTimeout(() => {
            try { sub.unsubscribe(); } catch (e) {}
            resolve({ emissions });
          }, 800);
        }, 300);
      });
    });
    console.log('filteredPages$ emissions:', JSON.stringify(subInfo));

    // Inspect after typing
    const info2 = await page.evaluate(() => {
      const el = document.querySelector('app-header');
      const ng = window['ng'];
      const comp = ng.getComponent(el);
      return {
        searchValue: comp.searchControl?.value,
        showResults: comp.showResults,
      };
    });
    console.log('Header internals after typing:', JSON.stringify(info2));

    // Count dropdown elements in DOM
    const ddCount = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('app-header div'));
      const candidates = all.filter(d => d.className && String(d.className).includes('absolute') && String(d.className).includes('top-full'));
      return { count: candidates.length, classes: candidates.map(c => String(c.className)) };
    });
    console.log('Dropdown candidates:', JSON.stringify(ddCount));

  } catch (e) {
    console.log('EXCEPTION:', e.message);
  }

  console.log('\n=== CONSOLE (filtered) ===');
  consoleMsgs.filter(m => m.includes('ERROR') || m.includes('error') || m.includes('ERROR')).slice(0, 40).forEach(m => console.log(m));

  await browser.close();
})();
