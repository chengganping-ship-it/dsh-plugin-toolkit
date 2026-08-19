const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Get list of pages from existing Chromium instance
  // Actually we need to attach to existing browser...
})();
