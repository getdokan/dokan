import { test } from '@playwright/test';
import { data } from './utils/testData.js';

test('Investigate modern dashboard structure', async ({ browser }) => {
    const vendorContext = await browser.newContext(data.auth.vendorAuth);
    const page = await vendorContext.newPage();
    
    // Navigate to vendor dashboard
    await page.goto(data.subUrls.frontend.vDashboard.dashboard);
    await page.waitForLoadState('networkidle');
    
    console.log('\n=== MODERN DASHBOARD INVESTIGATION ===');
    console.log('URL:', page.url());
    
    // Get the page content to analyze structure
    const dashboardContent = await page.locator('.dokan-dashboard-content').innerHTML();
    
    // Look for any elements that might contain analytics data or widgets
    const possibleSelectors = [
        // Analytics/Chart elements
        'canvas',
        '[class*="chart"]', 
        '[class*="analytics"]',
        '[class*="widget"]',
        '[class*="counter"]',
        '[class*="metric"]',
        '[class*="stat"]',
        
        // React/Vue components
        '[id*="root"]',
        '[class*="app"]',
        '[class*="component"]',
        
        // Tables or data displays
        'table',
        '[class*="table"]',
        '[class*="grid"]',
        
        // Cards or panels
        '[class*="card"]',
        '[class*="panel"]',
        '[class*="box"]'
    ];
    
    console.log('\n=== SEARCHING FOR DASHBOARD ELEMENTS ===');
    
    for (const selector of possibleSelectors) {
        const elements = await page.locator(selector).all();
        if (elements.length > 0) {
            console.log(`\n✅ Found ${elements.length} elements: ${selector}`);
            
            // Get details about first few elements
            for (let i = 0; i < Math.min(3, elements.length); i++) {
                const className = await elements[i].getAttribute('class') || '';
                const id = await elements[i].getAttribute('id') || '';
                const tagName = await page.evaluate(el => el.tagName.toLowerCase(), await elements[i].elementHandle());
                const text = (await elements[i].textContent() || '').substring(0, 100);
                
                console.log(`  ${i + 1}. <${tagName}> class="${className}" id="${id}"`);
                if (text.trim()) {
                    console.log(`     Text: "${text}${text.length >= 100 ? '...' : ''}"`);
                }
            }
        }
    }
    
    // Check for any iframes (React/Vue apps might be in iframes)
    const iframes = await page.locator('iframe').all();
    if (iframes.length > 0) {
        console.log(`\n📱 Found ${iframes.length} iframes - modern app might be inside iframe`);
        for (let i = 0; i < iframes.length; i++) {
            const src = await iframes[i].getAttribute('src') || '';
            console.log(`  Iframe ${i + 1}: ${src}`);
        }
    }
    
    // Save page content for manual analysis
    console.log('\n💾 Saving dashboard content for manual analysis...');
    require('fs').writeFileSync('dashboard-content.html', dashboardContent);
    
    // Take screenshot  
    await page.screenshot({ path: 'modern-dashboard-investigation.png', fullPage: true });
    console.log('📸 Screenshot saved: modern-dashboard-investigation.png');
    
    await vendorContext.close();
});
