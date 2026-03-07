const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Login
  await page.goto('http://localhost:4200/auth/login');
  await page.fill('input[type="text"]', 'ethernanos');
  await page.fill('input[type="password"]', 'admin1234');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  // Navigate directly
  await page.goto('http://localhost:4200/evaluations/sessions');
  await page.waitForSelector('app-evaluation-list');

  // Any errors in console?
  let hasErrors = false;
  page.on('console', msg => {
      if (msg.type() === 'error') {
          console.log(`PAGE ERROR: ${msg.text()}`);
          hasErrors = true;
      }
  });

  // Open modal
  await page.locator('button:has-text("Nouvelle Épreuve")').first().click();
  await page.waitForSelector('app-evaluation-form');
  
  // Tab 1
  await page.getByLabel('Titre de la Session').fill('Test Chrome Auto');
  await page.waitForTimeout(500);

  // Tab 2
  await page.locator('button:has-text("2. Épreuves")').click();
  await page.locator('button:has-text("Ajouter une épreuve")').click();
  await page.waitForTimeout(500);

  // Select Subject (ng-select)
  await page.locator('app-ui-select:has-text("Matière") select').selectOption({ index: 1 });
  await page.waitForTimeout(500);

  // Tab 3
  await page.locator('button:has-text("3. Planification")').click();
  await page.locator('button:has-text("Ajouter une plage horaire")').click();
  await page.getByLabel('Date').fill('2026-03-10');
  await page.getByLabel('Heure').fill('10:00');
  await page.getByLabel('Durée (min)').fill('120');

  // Tab 4
  await page.locator('button:has-text("4. Surveillance")').click();
  await page.locator('button:has-text("Activer la surveillance")').click();
  
  // Save
  await page.locator('button:has-text("Enregistrer")').click();
  await page.waitForTimeout(2000);
  
  if (!hasErrors) {
      console.log('SUCCESS: Form filled and saved without console errors.');
  }

  await browser.close();
})();
