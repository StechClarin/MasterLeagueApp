const { chromium } = require('playwright');

(async () => {
    console.log('Starting Playwright headed test...');
    // OPEN VISIBLE BROWSER WINDOW
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        console.log('Navigating to login...');
        await page.goto('http://localhost:4200/auth/login');
        await page.waitForTimeout(2000);

        // If we see the login form, login. Otherwise we might already be redirected to dashboard.
        const isLoginVisible = await page.isVisible('input[type="text"]');
        if (isLoginVisible) {
            console.log('Logging in...');
            await page.fill('input[type="text"]', 'ethernanos');
            await page.fill('input[type="password"]', 'admin1234');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(2000);
        } else {
            console.log('Already logged in or bypassed auth.');
        }

        console.log('Navigating to evaluations list...');
        await page.goto('http://localhost:4200/evaluations/sessions');
        await page.waitForTimeout(3000);

        console.log('Opening modal...');
        await page.locator('button:has-text("Nouvelle Épreuve")').first().click();
        await page.waitForTimeout(2000);

        // Tab 1
        console.log('Filling Tab 1...');
        await page.getByLabel('Titre de la Session').fill('Test Playwright Visible');

        await page.locator('app-ui-select:has-text("Type d\'Évaluation") select').selectOption({ index: 1 });
        await page.locator('app-ui-select:has-text("Période Académique") select').selectOption({ index: 1 });

        // Tab 2
        console.log('Filling Tab 2...');
        await page.locator('button:has-text("2. Épreuves")').click();
        await page.waitForTimeout(1000);
        await page.locator('button:has-text("Ajouter une épreuve")').click();
        await page.waitForTimeout(1000);
        await page.locator('app-ui-select:has-text("Matière") select').first().selectOption({ index: 1 });
        await page.getByLabel('Note sur').first().fill('20');

        // Tab 3
        console.log('Filling Tab 3...');
        await page.locator('button:has-text("3. Planification")').click();
        await page.waitForTimeout(1000);
        await page.locator('button:has-text("Ajouter une plage horaire")').click();
        await page.waitForTimeout(1000);
        await page.getByLabel('Date').first().fill('2026-03-10');
        await page.getByLabel('Heure').first().fill('10:00');

        // Tab 4
        console.log('Filling Tab 4...');
        await page.locator('button:has-text("4. Surveillance")').click();
        await page.waitForTimeout(1000);
        await page.locator('button:has-text("Activer la surveillance")').first().click();
        await page.waitForTimeout(1000);

        // Save
        console.log('Saving Evaluation...');
        await page.locator('button:has-text("Enregistrer")').click();
        await page.waitForTimeout(3000);

        console.log('SUCCESS: Form completed and saved! Keeping window open for 10 seconds...');
        await page.waitForTimeout(10000);
    } catch (error) {
        console.error('Test failed with error:', error.message);
    } finally {
        console.log('Closing browser...');
        await browser.close();
    }
})();
