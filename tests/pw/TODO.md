<!-- prettier-ignore -->

# Dokan E2E-API TaskList

### Todo: E2e Suite

- [ ] List all core tests and setup tests : plugins activated, wp settings, woocommerce settings, dokan modules activated , dokan settings for both e2e and api  
- [ ] GRAB CONSOLE ERROR, And PHP ERROR  
- [ ] Make tests more independent where possible specially admin parts : use before-all , after-all, delete data in before-all or after-all to repeat each tests: test should be passed for repeat-each:5, can be test parallely  
- [ ] Slack integration  
- [ ] Working-directory: ./path/to/tests  
- [ ] Update auth if expired instead of every-time  
- [ ] Report: separate two junit report showing on simple git-action summary  
- [ ] Global setup & teardown can be converted to project setup: no need  
- [ ] Project Configuration: separate everything for local & CI like: global setup, env, playwright config, Configure projects for multiple environments : ci, local,  
- [ ] Fixture: add fixture: separate user role, implement fixture for lite pro issue handle  
- [ ] ESlint: # // "no-unused-vars": "off" is enabled for now but remove before push, remove every eslint comment before push  
- [ ] Test basic auth can be used instead of cookies for authentication , no need to do this  
- [ ] why two pages are opening : fix that  
- [ ] Wp-env: Theme activation, permalink update and wp cli not work for latest wp-env version  
- [ ] Modal: Close modal if exists, causes issue with other tests where popup blocks next step*****  
- [ ] add new tests or multiple entry in same test for all search parameter, i.e : by-customer, by-product, but-store,..  
- [ ] insert all date format according to site format , currently hardcoded to default format -> helpers.dateFormatFYJ  
- [ ] try to fix product advertisement product, reverse withdraw product, store map save via api, currently e2e is used  
- [ ] *** need custom check method  
- [ ] add all email tests  
- [ ] add more fields in settings test  
- [ ] short browser context load in spec file  

### Todo: Project

- [ ] add comments  
- [ ] add coverage report  
- [ ] add linters  
- [ ] add JSDOC  
- [ ] cmd + save & npm run prettier:fix formatting differently  
- [ ] todo.md not ignored by prettier  

### Todo: Test Data

- [ ] update all image path from project root  
- [ ] Zip Testing  
- [ ] add zip testing tests  
- [ ] Wp-Env  

### Todo: Selectors

- [ ] add html tag to every css locator by-id, by-class e.g. #id to input#id  
- [ ] shorten selector is all pages e.g. locator = selector.admin.dokan.settings; locator length can be shorten  

### Todo: Assertions

- [ ] assert to have count more than , less than used not-to-have-count  
- [ ] either this or that assertion  
- [ ] convert all expect parameter to correct way: left side received and right side expected  
- [ ] received & expected data: -> 1. trim if necessary 2. lowercase if necessary  
- [ ] convert by locator, also move this to base page await this.page.getByRole('listitem').filter({ hasText: deliveryTime.openingTime }).click();  
- [ ] convert with to have grater than expect(Number(count)).not.toBe(0); to -> expect(Number(count)).toBeGreaterThan(0);  

### Todo: Playwright

- [ ] implement new playwright settings  
- [ ] fix npm run error without npx  
- [ ] read every playwright github issue & playwright comment  

### Todo: Reporter

- [ ] add os and browsers in env info  
- [ ] convert testSummary from commonjs module to es-module  
- [ ] add json reporter and try to replace junit, use json report for test summary if summary exists ['json', { outputFile: 'results.json' }]  

### Todo: Readme

- [ ] add lite & pro config on readme  
- [ ] update readme contribute to e2e api  
- [ ] use chatgpt to rephrase readme  
- [ ] make readme follow readme guideline  

### Todo: Api Suite

- [ ] make api suite independent, import: => like dokan pro exists or not, test summary, env setup from e2e suite  
- [ ] convert admin as vendor to vendor for whole suite  
- [ ] fix rank math api  
- [ ] create valid payload for every request : which doesn't cause any php warning  
- [ ] run with parallel mode on , make tests independent if necessary  
- [ ] update all tests with product-id, customer-id, to make it faster  
- [ ] hardcoding admin auth will hinder negative testing : test with invalid user  
- [ ] reverse withdraw and product advertisement setup needed on api suite  
- [ ] run loop & increment page to grab all plugins/products/users/... see woocommerce code base  

### In Progress


### Done ✓


