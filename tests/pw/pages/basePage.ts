/* eslint-disable playwright/no-element-handle */
/* eslint-disable playwright/no-wait-for-timeout */
/* eslint-disable playwright/no-page-pause */
/* eslint-disable playwright/no-force-option */

import { expect, Page, BrowserContext, Cookie, Request, Response, Locator, Frame, FrameLocator, JSHandle, ElementHandle } from '@playwright/test';
import { data } from '@utils/testData';
import { selector } from '@pages/selectors';

const { BASE_URL } = process.env;

// This Page Contains All Necessary Playwright Automation Methods

export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Page navigation methods
     */

    // wait for request
    async waitForRequest(url: string): Promise<Request> {
        return await this.page.waitForRequest(url);
    }

    // wait for Response
    async waitForResponse(url: string): Promise<Response> {
        return await this.page.waitForResponse(url);
    }

    // wait for load state
    async waitForLoadState(state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded', options?: { timeout?: number } | undefined): Promise<void> {
        await this.page.waitForLoadState(state, options);
    }

    // wait for url to be loaded
    async waitForUrl(url: string, options: { timeout?: number | undefined; waitUntil?: 'networkidle' | 'load' | 'domcontentloaded' | 'commit' | undefined } | undefined): Promise<void> {
        await this.page.waitForURL(url, options);
    }

    // goto subUrl
    async goto(subPath: string, options: { referer?: string; timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } | undefined = { waitUntil: 'domcontentloaded' }): Promise<void> {
        await this.page.goto(subPath, options);
    }

    // goto subUrl until networkidle
    async gotoUntilNetworkidle(subPath: string, options: { referer?: string; timeout?: number; waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' } | undefined = { waitUntil: 'networkidle' }): Promise<void> {
        await this.goto(subPath, options);
    }

    // go forward
    async goForward(): Promise<void> {
        await this.page.goForward();
    }

    // go back
    async goBack(): Promise<void> {
        await this.page.goBack();
    }

    // reload page
    async reload(): Promise<void> {
        await this.page.reload();
    }

    // reload if visible
    async reloadIfVisible(selector: string): Promise<void> {
        const isVisible = await this.isVisible(selector);
        if (isVisible) {
            await this.reload();
        }
    }

    // returns whether the current URL is expected
    isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, ''); // remove last '/' from the url
        return currentURL === this.createUrl(subPath);
    }

    // Create a New URL
    createUrl(subPath: string): string {
        // let url = new URL(BASE_URL)
        // url.pathname = url.pathname + subPath + '/'
        // return url.href
        return BASE_URL + '/' + subPath;
    }

    // goto subPath if not already there
    async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' | 'commit' = 'domcontentloaded'): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            // console.log('url: ', url);
            await this.toPass(async () => {
                await this.goto(url, { waitUntil: waitUntil });
                const currentUrl = this.getCurrentUrl();
                expect(currentUrl).toMatch(subPath);
            });
        }
    }

    // goto subPath if about:blank is loaded
    async goIfBlank(subPath: string): Promise<void> {
        const blankPage = await this.page.evaluate(() => window.location.href === 'about:blank');
        if (blankPage) {
            await this.goto(subPath);
        }
    }

    /**
     * Current page methods
     */

    // get base url
    getBaseUrl(): string {
        const url = this.getCurrentUrl();
        return new URL(url).origin;
    }

    // get current page url
    getCurrentUrl(): string {
        return this.page.url();
    }

    // get current page title
    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    // get full HTML contents of the current page
    async getFullHtml(): Promise<string> {
        return await this.page.content();
    }

    // get the browser context that the page belongs to.
    getPageContext(): BrowserContext {
        return this.page.context();
    }

    // assign html markup to the current page
    async setContent(html: string): Promise<void> {
        await this.page.setContent(html);
    }

    // brings page to front (activates tab)
    async bringToFront(): Promise<void> {
        await this.page.bringToFront();
    }

    // scroll to top
    async scrollToTop(): Promise<void> {
        await this.page.keyboard.down(data.key.home);
        // await this.page.evaluate(() => window.scroll(0, 0));
    }

    // scroll to bottom
    async scrollToBottom(): Promise<void> {
        await this.page.keyboard.down(data.key.end);
        // await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }

    /**
     * Click methods
     */

    // click on element
    async click(selector: string): Promise<void> {
        await this.clickLocator(selector);
    }

    // click on element
    async clickByPage(selector: string): Promise<void> {
        await this.page.click(selector);
    }

    // click on element by Running the js element.Click() method
    async clickJs(selector: string): Promise<void> {
        const element = this.getElement(selector);
        await element.click();
    }

    // click on element
    async focusAndClick(selector: string): Promise<void> {
        await this.focus(selector);
        await this.clickLocator(selector);
    }

    // double click on element
    async doubleClick(selector: string): Promise<void> {
        await this.page.dblclick(selector);
    }

    // click & wait for another locator to be visible [useful for modals]
    async clickAndWaitForLocatorToBeVisible(selector: string, selector2: string): Promise<void> {
        await Promise.all([this.toBeVisible(selector2), this.page.locator(selector).click()]);
    }

    // click & wait for load state to complete
    async clickAndWaitForLoadState(selector: string): Promise<void> {
        await Promise.all([this.waitForLoadState(), this.page.locator(selector).click()]);
    }

    // click & wait for navigation to complete
    async clickAndWaitForUrl(url: string | RegExp, selector: string): Promise<void> {
        await Promise.all([this.page.waitForURL(url, { waitUntil: 'domcontentloaded' }), this.page.locator(selector).click()]);
    }

    // click & wait for request
    async clickAndWaitForRequest(url: string, selector: string): Promise<void> {
        await Promise.all([this.page.waitForRequest(url), this.page.locator(selector).click()]);
    }

    // click & wait for response
    async clickLocatorAndWaitForResponse(subUrl: string, locator: Locator, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), locator.click()]);
        return response;
    }

    // click & wait for response
    async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        return response;
    }

    // click & wait for response with response type
    async clickAndWaitForResponseWithType(subUrl: string, selector: string, requestType: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([
            this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.request().method().toLowerCase() == requestType.toLowerCase() && resp.status() === code),
            this.page.locator(selector).click(),
        ]);
        return response;
    }

    // click & wait for response
    async clickAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [, response] = await Promise.all([this.waitForLoadState(), this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        expect(response.status()).toBe(code);
        return response;
    }

    // click & wait for response until network idle
    async clickAndWaitForResponseAndLoadStateUntilNetworkIdle(subUrl: string, selector: string, code = 200): Promise<Response> {
        // eslint-disable-next-line playwright/no-networkidle
        const [, response] = await Promise.all([this.waitForLoadState('networkidle'), this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).click()]);
        expect(response.status()).toBe(code);
        return response;
    }

    // click & wait for responses sequentially (requests are made one after the other)
    async clickAndWaitForResponsesSequentially(subUrls: string[], selector: string, codes: number[] = [200]): Promise<Response[]> {
        await this.page.locator(selector).click();
        const responses: Response[] = [];
        for (const [i, subUrl] of subUrls.entries()) {
            const response = await this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === (codes[i] || 200));
            responses.push(response);
        }
        return responses;
    }

    // click & wait for responses
    async clickAndWaitForResponses(subUrls: string[], selector: string, codes: number[] = [200]): Promise<Response[]> {
        const responsePromises = subUrls.map((subUrl, index) => this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === codes[index % codes.length]));
        await this.page.locator(selector).click();
        const responses = await Promise.all(responsePromises);
        return responses;
    }

    // click & wait for responses
    async clickAndWaitForResponsesAndLoadState(subUrls: string[], selector: string, codes: number[] = [200]): Promise<Response[]> {
        const responsePromises = subUrls.map((subUrl, index) => this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === codes[index % codes.length]));
        await this.page.locator(selector).click();
        const [, ...responses] = await Promise.all([this.waitForLoadState(), ...responsePromises]);
        return responses;
    }

    // click & accept
    async clickAndAccept(selector: string): Promise<void> {
        await Promise.all([this.acceptAlert(), this.page.locator(selector).click()]);
    }

    // click & wait for response
    async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
        // todo: need error message for all click & wait for response methods
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.acceptAlert(), this.page.locator(selector).click()]);
        return response;
    }

    // click & wait for response
    async clickAndAcceptAndWaitForResponseAndLoadState(subUrl: string, selector: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.acceptAlert(), this.waitForLoadState(), this.page.locator(selector).click()]);
        return response;
    }

    // type & wait for response
    async typeByPageAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.locator(selector).pressSequentially(text, { delay: 200 })]);
        return response;
    }

    // type & wait for response
    async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.clearAndFill(selector, text)]);
        return response;
    }

    // type & wait for response and LoadState
    async typeAndWaitForResponseAndLoadState(subUrl: string, selector: string, text: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.waitForLoadState(), this.clearAndFill(selector, text)]);
        return response;
    }

    // type & wait for response and LoadState
    async pressOnLocatorAndWaitForResponseAndLoadState(subUrl: string, selector: string, key: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.waitForLoadState(), this.keyPressOnLocator(selector, key)]);
        return response;
    }

    // type & wait for load state
    async pressAndWaitForLoadState(key: string): Promise<void> {
        await Promise.all([this.waitForLoadState(), this.press(key)]);
    }

    // type & wait for response
    async pressAndWaitForResponse(subUrl: string, key: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.press(key)]);
        return response;
    }

    // click & wait for event
    async clickAndWaitForEvent(event: any, selector: string): Promise<Page> {
        const [res] = await Promise.all([this.page.waitForEvent(event), this.page.locator(selector).click()]);
        return res;
    }

    // click & wait for download event
    async clickAndWaitForDownload(selector: string): Promise<void> {
        await this.clickAndWaitForEvent('download', selector);
    }

    // click if visible
    async clickIfVisible(selector: string): Promise<void> {
        const isVisible = await this.isVisible(selector, 1);
        if (isVisible) {
            await this.click(selector);
        }
    }

    // click and wait for response if visible
    async clickAndWaitForResponseIfVisible(subUrl: string, selector: string): Promise<void> {
        const isVisible = await this.isVisible(selector);
        if (isVisible) {
            await this.clickAndWaitForResponse(subUrl, selector);
        }
    }

    // click if exists
    async clickIfExists(selector: string): Promise<void> {
        const isExists = await this.isLocatorExists(selector);
        if (isExists) {
            await this.click(selector);
        }
    }

    // is locator exists
    async isLocatorExists(selector: string): Promise<boolean> {
        return (await this.page.locator(selector).count()) > 0;
    }

    // is element exists
    async isElementExists(selector: string): Promise<boolean> {
        return (await this.page.$(selector).catch(() => null)) !== null;
    }

    /**
     * Keyboard methods
     */

    // press key
    async press(key: string): Promise<void> {
        await this.page.keyboard.press(key);
    }

    // press on selector [Focuses the element, and then uses keyboard press]
    async pressOnSelector(selector: string, key: string): Promise<void> {
        await this.page.press(selector, key);
    }

    /**
     * Selector methods
     */

    // wait for selector
    async waitForSelector(selector: string, options?: any): Promise<void> {
        await this.page.locator(selector).waitFor(options);
    }

    // get locator
    getLocator(selector: string): Locator {
        return this.page.locator(selector);
    }

    // get locators
    async getLocators(selector: string): Promise<Locator[]> {
        return await this.page.locator(selector).all();
    }

    // returns whether the element is visible
    async isVisible(selector: string, timeout: number = 2): Promise<boolean> {
        const start = Date.now();
        let interval = 20;
        while (Date.now() - start < timeout * 1000) {
            try {
                const isVisible = await this.page.locator(selector).isVisible();
                if (isVisible) return true;
            } catch (error) {
                /* empty */
            }
            // console.log(`- waiting ${interval}ms\n- waiting for element to be visible`);

            // wait for the current interval before the next attempt
            await this.page.waitForTimeout(interval);

            // Adjust the interval sequence: 20ms, 100ms, 100ms, then 500ms
            if (interval === 20) {
                interval = 100;
            } else if (interval === 100) {
                // If it’s already 100ms, switch to 500ms
                interval = 500;
            }
        }
        return false;
    }

    // returns whether the element is visible
    async isVisibleByPage(selector: string): Promise<boolean> {
        return await this.page.isVisible(selector);
    }

    // returns whether the element is hidden
    async isHidden(selector: string): Promise<boolean> {
        return await this.page.isHidden(selector);
    }

    // returns whether the element is enabled
    async isEnabled(selector: string, options?: { strict?: boolean; timeout?: number } | undefined): Promise<boolean> {
        return await this.page.isEnabled(selector, options);
    }

    // returns whether the element is editable
    async isEditable(selector: string): Promise<boolean> {
        return await this.page.isEditable(selector);
    }

    // returns whether the element is disabled
    async isDisabled(selector: string): Promise<boolean> {
        return await this.isDisabledLocator(selector);
        // return await this.page.isDisabled(selector);
    }

    // returns whether the element is disabled
    async isDisabledByPage(selector: string): Promise<boolean> {
        return await this.page.isDisabled(selector);
    }

    // returns whether the element is checked
    async isChecked(selector: string): Promise<boolean> {
        return await this.page.isChecked(selector);
    }

    // focus on selector
    async focus(selector: string): Promise<void> {
        await this.page.focus(selector);
        // await this.wait(1); // for visualizing the focus
    }

    // hover on selector
    async hover(selector: string): Promise<void> {
        await this.page.locator(selector).hover();
        // await this.wait(0.2);
    }

    // drag and drop
    async dragAndDrop(source: string, target: string): Promise<void> {
        await this.page.dragAndDrop(source, target);
    }

    // get element
    getElement(selector: string): Locator {
        return this.page.locator(selector);
    }

    // get element count
    async getElementCount(selector: string): Promise<number> {
        return await this.countLocator(selector);
        // return this.page.locator(selector).count();
    }

    // get element text content
    async getElementText(selector: string): Promise<string | null> {
        return await this.textContentOfLocator(selector);
        // return await this.page.textContent(selector);
    }

    // get element text if visible
    async getElementTextIfVisible(selector: string): Promise<void | string | null> {
        const isVisible = await this.isVisible(selector);
        if (isVisible) {
            return await this.getElementText(selector);
        }
    }

    // get element text content
    async getElementTextByPage(selector: string): Promise<string | null> {
        return await this.page.textContent(selector);
    }

    // get element has test or not
    async hasText(selector: string, text: string): Promise<boolean> {
        const elementText = await this.textContentOfLocator(selector);
        return elementText?.trim() === text;
    }

    // get element inner text
    async getElementInnerText(selector: string): Promise<string> {
        return await this.page.innerText(selector);
    }

    // get element inner html
    async getElementInnerHtml(selector: string): Promise<string> {
        return await this.page.innerHTML(selector);
    }

    // get element value [input, textarea, select]
    async getElementValue(selector: string): Promise<string> {
        return await this.page.inputValue(selector);
    }

    // get class attribute value
    async getClassValue(selector: string): Promise<string | null> {
        return await this.page.getAttribute(selector, 'class');
    }

    // get element has class or not
    async hasClass(selector: string, className: string): Promise<boolean> {
        const elementClass = await this.getClassValue(selector);
        const result = elementClass!.includes(className);
        return result;
        // const element = this.getElement(selector);
        // const result = await element.evaluate((element, className) => element.classList.contains(className), className);
        // return result;
    }

    // get attribute value
    async getAttributeValue(selector: string, attribute: string): Promise<string | null> {
        return await this.page.getAttribute(selector, attribute);
    }

    // has attribute
    async hasAttribute(selector: string, attribute: string): Promise<boolean> {
        const element = this.getElement(selector);
        const hasAttribute = await element.evaluate((element, attribute) => element.hasAttribute(attribute), attribute);
        return hasAttribute;
    }

    // set attribute/class value
    async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        const element = this.getElement(selector);
        await element.evaluate((element, [attribute, value]) => element.setAttribute(attribute as string, value as string), [attribute, value]);
    }

    // add attribute/class value
    async addAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
        const previousAttribute = await this.getAttributeValue(selector, attribute);
        const newValue = `${previousAttribute} ${value}`;
        const element = this.getElement(selector);
        await element.evaluate((element, [attribute, value]) => element.setAttribute(attribute as string, value as string), [attribute, newValue]);
    }

    // remove element attribute
    async removeAttribute(selector: string, attribute: string): Promise<void> {
        const element = this.getElement(selector);
        await element.evaluate((element, attribute) => element.removeAttribute(attribute), attribute);
    }

    // get element css value
    async getElementCssStyle(selector: string): Promise<CSSStyleDeclaration> {
        const element = this.getElement(selector);
        const value = await element.evaluate(element => window.getComputedStyle(element));
        // console.log(value)
        return value;
    }

    // set element css style property
    async setElementCssStyle(selector: string, property: string, value: string): Promise<void> {
        const element = this.getElement(selector);
        await element.evaluate((element, [property, value]) => ((element.style as any)[property as string] = value), [property, value]);
    }

    // get element property value
    async getElementPropertyValue(selector: string, property: string): Promise<string> {
        const element = this.getElement(selector);
        const value = await element.evaluate((element, property) => window.getComputedStyle(element).getPropertyValue(property), property);
        // console.log(value)
        return value;
    }

    // get element property value: background color
    async getElementBackgroundColor(selector: string): Promise<string> {
        const element = this.getElement(selector);
        const value = await element.evaluate(element => window.getComputedStyle(element).getPropertyValue('background-color'));
        // console.log(value)
        return value;
    }

    // get element property value: color
    async getElementColor(selector: string): Promise<string> {
        const element = this.getElement(selector);
        const value = await element.evaluate(element => window.getComputedStyle(element).getPropertyValue('color'));
        // console.log(value)
        return value;
    }

    // has color
    async hasColor(selector: string, color: string): Promise<boolean> {
        const elementColor = await this.getElementColor(selector);
        // console.log(elementColor);
        return elementColor === color;
    }

    // get pseudo element style
    async getPseudoElementStyles(selector: string, pseudoElement: string, property: string): Promise<string> {
        const element = this.getElement(selector);
        const value = await element.evaluate((element, [pseudoElement, property]) => window.getComputedStyle(element, '::' + pseudoElement).getPropertyValue(property as string), [pseudoElement, property]);
        // console.log(value);
        return value;
    }

    // get multiple element texts
    async getMultipleElementTexts(selector: string): Promise<string[]> {
        // const texts = await this.page.$$eval(selector, (elements) => elements.map((item) => item.textContent));
        const element = this.getElement(selector);
        const allTexts = await element.allTextContents();
        // console.log(allTexts);
        return allTexts;
    }

    // get element bounding box
    async getElementBoundingBox(selector: string): Promise<null | { x: number; y: number; width: number; height: number }> {
        const boundingBox = await this.page.locator(selector).boundingBox();
        return boundingBox;
    }

    /**
     * Timeout methods
     */

    // change default maximum time(seconds) for all the methods
    setDefaultNavigationTimeout(timeout: number): void {
        this.page.setDefaultTimeout(timeout * 1000);
    }

    // change default maximum navigation time(seconds) for all navigation methods [goto, goBack, goForward, ...]
    setDefaultTimeout(timeout: number): void {
        this.page.setDefaultTimeout(timeout * 1000);
    }

    // waits for the given timeout in seconds
    async wait(seconds: number): Promise<void> {
        await this.page.waitForTimeout(seconds * 1000);
    }

    /**
     * Input field methods
     */

    // clear input field
    async clearInputField(selector: string): Promise<void> {
        await this.page.fill(selector, '');
    }

    // Or

    async clearInputFieldByMultipleClick(selector: string): Promise<void> {
        const element = this.getElement(selector);
        await element.click({ clickCount: 3 });
        await this.press('Backspace');
    }

    // clear input field and type
    async clearAndType(selector: string, text: string): Promise<void> {
        await this.fill(selector, text);
        // await this.clearAndTypeByPage(selector, text);
    }

    // clear input field and type
    async clearAndTypeByPage(selector: string, text: string): Promise<void> {
        await this.clearInputFieldByMultipleClick(selector);
        await this.type(selector, text);
    }

    // clear input field and type
    async clearAndFill(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    // type in input field
    async type(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).pressSequentially(text, { delay: 100 });
    }

    // fill in input field
    async fill(selector: string, text: string): Promise<void> {
        await this.page.locator(selector).fill(text);
    }

    // fill if visible
    async fillIfVisible(selector: string, text: string): Promise<void> {
        const IsVisible = await this.isVisible(selector);
        if (IsVisible) {
            await this.clearAndFill(selector, text);
        }
    }

    // append in input filed
    async append(selector: string, text: string): Promise<void> {
        await this.focus(selector);
        await this.press('End');
        await this.page.locator(selector).pressSequentially(text);
    }

    // check if visible
    async typeIfVisible(selector: string, text: string): Promise<void> {
        const IsVisible = await this.isVisible(selector);
        if (IsVisible) {
            await this.clearAndFill(selector, text);
        }
    }

    // check/uncheck input fields [checkbox/radio] based on choice
    async checkUncheck(selector: string, checked: boolean): Promise<void> {
        await this.page.setChecked(selector, checked);
    }

    // check input fields [checkbox/radio]
    async checkByPage(selector: string): Promise<void> {
        await this.page.check(selector);
    }

    // check input fields [checkbox/radio]
    async check(selector: string): Promise<void> {
        await this.toPass(async () => {
            // added to remove flakiness
            await this.checkLocator(selector);
            await this.toBeChecked(selector, { timeout: 200 });
            // await this.checkByPage(selector);
        });
    }

    // check input fields [checkbox/radio]
    async checkBySetChecked(selector: string): Promise<void> {
        await this.page.setChecked(selector, true);
    }

    // uncheck input fields [checkbox/radio]
    async uncheck(selector: string): Promise<void> {
        await this.page.uncheck(selector);
    }

    // check if visible
    async checkIfVisible(selector: string): Promise<void> {
        const IsVisible = await this.isVisible(selector);
        if (IsVisible) {
            await this.check(selector);
        }
    }

    // check if not checked
    async checkIfNotChecked(selector: string): Promise<void> {
        const isChecked = await this.isCheckedLocator(selector);
        if (isChecked) {
            await this.check(selector);
        }
    }

    /**
     * Input field methods
     */

    // select option by value/text/index
    async select(selector: string, choice: string, value: string | number): Promise<string[]> {
        switch (choice) {
            case 'value':
                return await this.page.selectOption(selector, { value: value as string });
            case 'label':
                return await this.page.selectOption(selector, { label: value as string });
            case 'index':
                return await this.page.selectOption(selector, { index: value as number });
            default:
                return [];
        }
    }

    // select by value
    async selectByValue(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { value });
    }

    // select by label
    async selectByLabel(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, { label: value });
    }

    // select by number
    async selectByNumber(selector: string, value: number | string): Promise<string[]> {
        return await this.page.selectOption(selector, { index: Number(value) });
    }

    // select by value and wait for response
    async selectByValueAndWaitForResponse(subUrl: string, selector: string, value: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.selectOption(selector, { value })]);
        return response;
    }

    // select by value and wait for response and load state
    async selectByValueAndWaitForResponseAndLoadState(subUrl: string, selector: string, value: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.waitForLoadState(), this.page.selectOption(selector, { value })]);
        return response;
    }

    // select by label and wait for response
    async selectByLabelAndWaitForResponse(subUrl: string, selector: string, value: string, code = 200): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(resp => resp.url().includes(subUrl) && resp.status() === code), this.page.selectOption(selector, { label: value })]);
        return response;
    }

    // get select value
    async getSelectedValue(selector: string): Promise<string> {
        const locator = this.page.locator(selector);
        const selectValue = await locator.evaluate((select: HTMLSelectElement) => select.value);
        return selectValue;
    }

    // get select text
    async getSelectedText(selector: string): Promise<string | undefined> {
        const locator = this.page.locator(selector);
        const selectedText = await locator.evaluate((select: HTMLSelectElement) => select.options[select.selectedIndex]?.text);
        return selectedText;
    }

    // get select value and test
    async getSelectedValueAndText(selector: string): Promise<(string | undefined)[]> {
        const locator = this.page.locator(selector);
        const [selectValue, selectedText] = await locator.evaluate((select: HTMLSelectElement) => [select.value, select.options[select.selectedIndex]?.text]);
        return [selectValue, selectedText];
    }

    /**
     * Files & Media methods
     */

    // upload file
    async uploadFile(selector: string, files: string | string[]): Promise<void> {
        await this.page.setInputFiles(selector, files);
    }

    // upload file
    async uploadBuffer(selector: string, filePath: string): Promise<void> {
        await this.page.setInputFiles(selector, { name: String(filePath.split('/').pop()), mimeType: 'image/' + filePath.split('.').pop(), buffer: Buffer.from(filePath) });
    }

    // upload files when input file element is missing
    async uploadFileViaListener(selector: string, files: string | string[]): Promise<void> {
        this.page.on('filechooser', async fileChooser => {
            await fileChooser.setFiles(files);
        });
        await this.page.locator(selector).click(); // invokes the filechooser
    }

    async uploadFileViaListener1(selector: string, files: string | string[]): Promise<void> {
        // Start waiting for file chooser before clicking. Note no await.
        const fileChooserPromise = this.page.waitForEvent('filechooser'); // Note: no await on listener
        await this.page.locator(selector).click(); //  invokes the filechooser
        const fileChooser = await fileChooserPromise;
        await fileChooser.setFiles(files);
        // or
        // const [fileChooser] = await Promise.all([this.page.waitForEvent('filechooser'), this.page.locator(selector).click()])
        // await fileChooser.setFiles(files)
    }

    // remove selected files to upload
    async removeSelectedFileToUpload(selector: string, file: [] = []): Promise<void> {
        await this.page.setInputFiles(selector, file);
    }

    // get screenshot
    async getScreenshot(path: string, fullPage = false): Promise<void> {
        await this.page.screenshot({ path, fullPage });
    }

    // get screenshots as buffer
    async getScreenshotBuffer(path: string): Promise<string> {
        const screenshot = await this.page.screenshot({ path });
        const buffer = screenshot.toString('base64');
        return buffer;
    }

    // get screenshot
    async getElementScreenshot(selector: string, path: string): Promise<void> {
        await this.page.locator(selector).screenshot({ path });
    }

    // generate a pdf of the page
    async pdf(): Promise<void> {
        await this.page.pdf();
    }

    /**
     * Frame [iframe] methods
     */

    // get all frames attached to the page
    getAllFrames(): Frame[] {
        return this.page.frames();
    }

    // get frame
    getFrame(frame: string): Frame | null {
        return this.page.frame(frame);
    }

    // get child frames
    getChildFrames(frame: string): Frame[] | null {
        const parentFrame = this.page.frame(frame)!;
        const childFrames = parentFrame.childFrames();
        return childFrames;
    }

    // get frame
    getFrameSelector(frame: string, frameSelector: string): Locator {
        return this.page.frameLocator(frame).locator(frameSelector);
    }

    // click frame locator
    async clickFrameSelector(frame: string, frameSelector: string): Promise<void> {
        const locator = this.page.frameLocator(frame).locator(frameSelector);
        await locator.click();
    }

    // get frame
    async typeFrameSelector(frame: string, frameSelector: string, text: string): Promise<void> {
        const locator = this.page.frameLocator(frame).locator(frameSelector);
        await locator.fill(text);
        // await locator.pressSequentially(text);
    }

    /**
     * Locator methods [using playwright locator class]
     */

    // get locator all inner texts
    async allInnerTextLocator(selector: string): Promise<string[]> {
        const locator = this.page.locator(selector);
        return await locator.allInnerTexts();
    }

    // get locator all text contents
    async allTextContentsLocator(selector: string): Promise<string[]> {
        const locator = this.page.locator(selector);
        return await locator.allTextContents();
    }

    // get locator boundingBox
    async boundingBoxLocator(selector: string): Promise<null | object> {
        const locator = this.page.locator(selector);
        return await locator.boundingBox();
    }

    // check locator
    async checkLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.check();
        // await locator.check({ force: true }); // forced is used to avoid "locator.check: Clicking the checkbox did not change its state" error
    }

    // click locator
    async clickLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.click();
    }

    // get locator count
    async countLocator(selector: string): Promise<number> {
        const locator = this.page.locator(selector);
        return await locator.count();
    }

    // double click element
    async dblclickLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.dblclick();
    }

    // dispatches event('click', 'dragstart',...) on the element
    async dispatchEvent(selector: string, event: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.dispatchEvent(event);
    }

    // drag locator to target locator
    async dragToTargetLocator(sourceSelector: string, targetSelector: string): Promise<void> {
        const sourceLocator = this.page.locator(sourceSelector);
        const targetLocator = this.page.locator(targetSelector);
        await sourceLocator.dragTo(targetLocator);
    }

    // resolves given locator to the first matching DOM element
    async getElementHandle(selector: string): Promise<null | ElementHandle<SVGElement | HTMLElement>> {
        const locator = this.page.locator(selector);
        return await locator.elementHandle();
    }

    // resolves given locator to all matching DOM elements
    async getElementHandles(selector: string): Promise<ElementHandle[]> {
        const locator = this.page.locator(selector);
        return await locator.elementHandles();
    }

    // returns the return value of pageFunction
    async evaluate(selector: string, pageFunction: any): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.evaluate(pageFunction);
    }

    // returns the result of pageFunction invocation
    async evaluateAll(selector: string, pageFunction: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.evaluateAll(pageFunction);
    }

    // returns the return value of pageFunction as a JSHandle
    async evaluateHandle(selector: string, pageFunction: any): Promise<JSHandle> {
        const locator = this.page.locator(selector);
        return await locator.evaluateHandle(pageFunction);
    }

    // get locator index relative to it's parent
    async getLocatorIndex(parentSelector: string, childSelector: string): Promise<number> {
        // const parent = await this.getElementHandle(parentSelector);
        const parent = this.getElement(parentSelector);
        const child = await this.getElementHandle(childSelector);
        const index = await parent.evaluate((parent, child) => Array.from(parent.children).indexOf(child as HTMLElement), child);
        // console.log(index);
        return index;
    }

    // fill input locator
    async fillLocator(selector: string, text: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.fill(text);
    }

    // filter locator through inner locator or text
    filterLocator(selector: string, filterOptions: object): Locator {
        const locator = this.page.locator(selector);
        return locator.filter(filterOptions);
    }

    // get first matching locator
    getFirstLocator(selector: string): Locator {
        const locator = this.page.locator(selector);
        return locator.first();
    }

    // focus locator
    async focusOnLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.focus();
    }

    // get frame locator
    frameLocator(selector: string): FrameLocator {
        const locator = this.page.locator(selector);
        return locator.frameLocator(selector);
    }

    // get locator attribute value
    async getAttributeOfLocator(selector: string, attribute: string): Promise<null | string> {
        const locator = this.page.locator(selector);
        return await locator.getAttribute(attribute);
    }

    // highlight locator
    async highlightLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.highlight();
    }

    // hover on locator
    async hoverOnLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.hover();
    }

    // get locator inner html
    async innerHTMLOfLocator(selector: string): Promise<string> {
        const locator = this.page.locator(selector);
        return await locator.innerHTML();
    }

    // get locator inner text
    async innerTextOfLocator(selector: string): Promise<string> {
        const locator = this.page.locator(selector);
        return await locator.innerText();
    }

    // get locator input value
    async inputValueOfLocator(selector: string): Promise<string> {
        const locator = this.page.locator(selector);
        return await locator.inputValue();
    }

    // returns whether the locator is checked
    async isCheckedLocator(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector);
        return await locator.isChecked();
    }

    // returns whether the locator is disabled
    async isDisabledLocator(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector);
        return await locator.isDisabled();
    }

    // returns whether the locator is editable
    async isEditableLocator(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector);
        return await locator.isEditable();
    }

    // returns whether the locator is enabled
    async isEnabledLocator(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector);
        return await locator.isEnabled();
    }

    // returns whether the locator is hidden
    async isHiddenLocator(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector);
        return await locator.isHidden();
    }

    // returns whether the locator is visible
    async isVisibleLocator(selector: string): Promise<boolean> {
        const locator = this.page.locator(selector);
        return await locator.isVisible();
    }

    // get last matching locator
    lastLocator(selector: string): Locator {
        const locator = this.page.locator(selector);
        return locator.last();
    }

    // get child locator
    locatorOfLocator(parentSelector: string, childSelector: string): Locator {
        const locator = this.page.locator(parentSelector);
        return locator.locator(childSelector);
    }

    // get n-th matching locator
    nthLocator(selector: string, index: number): Locator {
        const locator = this.page.locator(selector);
        return locator.nth(index);
    }

    // get the page locator belongs to
    pageOfLocator(selector: string): Page {
        const locator = this.page.locator(selector);
        return locator.page();
    }

    // key press on locator
    async keyPressOnLocator(selector: string, key: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.press(key);
    }

    // take locator screenshot
    async screenshotOfLocator(selector: string): Promise<Buffer> {
        const locator = this.page.locator(selector);
        return await locator.screenshot();
    }

    // scroll locator into view if needed
    async scrollIntoViewLocator(selector: string, options?: { timeout?: number }): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.scrollIntoViewIfNeeded(options);
    }

    // select from select option through value, option, index
    async selectOptionOfLocator(selector: string, values: string): Promise<string[]> {
        const locator = this.page.locator(selector);
        return await locator.selectOption(values);
    }

    // select all locator's text content
    async selectTextOfLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.selectText();
    }

    // check/uncheck locator
    async setCheckedLocator(selector: string, checked: boolean): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.setChecked(checked);
    }

    // upload file
    async setInputFilesLocator(selector: string, file: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.setInputFiles(file);
    }

    // tap on locator
    async tapOnLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.tap();
    }

    // get locator text content
    async textContentOfLocator(selector: string): Promise<null | string> {
        const locator = this.page.locator(selector);
        return await locator.textContent();
    }

    // type on input locator
    async typeOnLocator(selector: string, text: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.pressSequentially(text);
    }

    // uncheck locator
    async uncheckLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.uncheck();
    }

    // wait for locator
    async waitForLocator(selector: string, option?: { state?: 'visible' | 'attached' | 'detached' | 'hidden' | undefined; timeout?: number | undefined } | undefined): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.waitFor(option);
    }

    // wait for locator to be visible
    async waitForVisibleLocator(selector: string): Promise<void> {
        const locator = this.page.locator(selector);
        await locator.waitFor({ state: 'visible' });
    }

    /**
     * Dialog methods
     */

    // accept alert
    acceptAlert(): void {
        // page.once is used avoid future alerts to be accepted
        this.page.once('dialog', dialog => {
            void dialog.accept();
        });
    }

    // dismiss alert
    dismissAlert(): void {
        // page.once is used avoid future alerts to be dismissed
        this.page.once('dialog', dialog => {
            void dialog.dismiss();
        });
    }

    // type on prompt box/alert
    fillAlert(value: string): void {
        // page.once is used avoid future prompts to be filled
        this.page.once('dialog', dialog => {
            void dialog.accept(value);
        });
    }

    /**
     * Cookies methods
     */

    // get cookies
    async getCookies(): Promise<Cookie[]> {
        return await this.page.context().cookies();
    }

    // add cookies
    async addCookies(
        browserContext: BrowserContext,
        cookies: {
            name: string;
            value: string;
            url?: string | undefined;
            domain?: string | undefined;
            path?: string | undefined;
            expires?: number | undefined;
            httpOnly?: boolean | undefined;
            secure?: boolean | undefined;
            sameSite?: 'Strict' | 'Lax' | 'None' | undefined;
        }[],
    ): Promise<void> {
        await browserContext.addCookies(cookies);
    }

    // get cookies
    async clearCookies(): Promise<void> {
        await this.page.context().clearCookies();
    }

    // get wp current user
    async getCurrentUser(): Promise<string | undefined> {
        const cookies = await this.getCookies();
        const cookie = cookies.find(c => {
            let _c$name: string;
            return !!(c !== null && c !== void 0 && (_c$name = c.name) !== null && _c$name !== void 0 && _c$name.startsWith('wordpress_logged_in_'));
        });
        if (!(cookie !== null && cookie !== void 0 && cookie.value)) {
            return;
        }
        return decodeURIComponent(cookie.value).split('|')[0];
    }

    /**
     * Dropdown methods
     */

    // set dropdown option  span dropdown
    async setDropdownOptionSpan(selector: string, value: string): Promise<void> {
        const elements = await this.page.$$(selector);
        for (const element of elements) {
            const text = await element.evaluate(element => element.textContent, element);
            // console.log(text)
            if (value.toLowerCase() == text?.trim().toLowerCase()) {
                await element.click();
            }
        }
    }

    /**
     * Debug methods
     */

    // pauses script execution
    async pause(): Promise<void> {
        await this.page.pause();
    }

    /**
     * Page methods
     */

    // get all pages
    getAllPages(): Page[] {
        return this.page.context().pages();
    }

    // add locator handler [useful for randomly popups] [call before the start of the test]
    async addLocatorHandler(selector: string, asyncFn: () => Promise<void>, options?: { noWaitAfter?: boolean; times?: number } | undefined): Promise<void> {
        const locator = this.page.locator(selector);
        await this.page.addLocatorHandler(locator, asyncFn, options);
    }

    /**
     * Extra methods
     */

    // click first element
    async clickFirstLocator(selector: string): Promise<void> {
        await this.page.locator(selector).first().click();
    }

    // multiple elements to be checked
    async multipleElementCheck(selectors: any) {
        for (const selector in selectors) {
            await this.check(selectors[selector]);
        }
    }

    // multiple elements to be visible
    async multipleElementVisible(selectors: any) {
        for (const selector in selectors) {
            await this.toBeVisible(selectors[selector]);
        }
    }

    // multiple elements to be visible
    async multipleElementNotVisible(selectors: any) {
        for (const selector in selectors) {
            await this.notToBeVisible(selectors[selector]);
        }
    }

    // screenshot to be similar
    async toHaveScreenshot(page: Page, locators?: Locator[]) {
        await expect(page).toHaveScreenshot({ fullPage: true, mask: locators, maskColor: 'black', animations: 'disabled' });
    }

    // click multiple elements with same selector/class/xpath
    async clickMultiple(selector: string): Promise<void> {
        for (const element of await this.page.locator(selector).all()) {
            // await this.toPass(async () => {
            await element.click();
            // });
        }
    }

    // check multiple elements with same selector/class/xpath
    async checkMultiple(selector: string): Promise<void> {
        for (const element of await this.page.locator(selector).all()) {
            await this.toPass(async () => {
                await element.check();
                await expect(element).toBeChecked();
            });
        }
    }

    /**
     * Assertion methods
     */

    // assert any element to be visible
    async toBeVisibleAnyOfThem(selectors: string[]) {
        const visibilityResults = await Promise.all(
            selectors.map(async selector => {
                const isVisible = await this.isVisible(selector);
                return isVisible ? selector : null;
            }),
        );

        const visibleSelectors = visibilityResults.filter(selector => selector !== null);
        expect(visibleSelectors.length).toBeGreaterThan(0);
        return visibleSelectors;
    }

    // assert value to be equal
    toBeEqual(received: any, expected: any) {
        expect(received).toEqual(expected);
    }

    // assert element to be enabled
    async toBeEnabled(selector: string, options?: { timeout?: number; visible?: boolean } | undefined) {
        await expect(this.page.locator(selector)).toBeEnabled(options);
    }

    // assert element to be disabled
    async toBeDisabled(selector: string, options?: { timeout?: number; visible?: boolean } | undefined) {
        await expect(this.page.locator(selector)).toBeDisabled(options);
    }

    // assert element to be visible
    async toBeVisible(selector: string, options?: { timeout?: number; visible?: boolean } | undefined) {
        await expect(this.page.locator(selector)).toBeVisible(options);
    }

    // assert checkbox to be checked
    async toBeChecked(selector: string, options?: { checked?: boolean; timeout?: number } | undefined) {
        await expect(this.page.locator(selector)).toBeChecked(options);
    }

    // assert element to have text
    async toHaveText(selector: string, text: string | RegExp | readonly (string | RegExp)[], option?: { ignoreCase?: boolean; timeout?: number; useInnerText?: boolean } | undefined) {
        await expect(this.page.locator(selector)).toHaveText(text, option);
    }

    // assert element to contain text
    async toContainText(selector: string, text: string | RegExp, options?: { ignoreCase?: boolean; timeout?: number; useInnerText?: boolean } | undefined) {
        await expect(this.page.locator(selector)).toContainText(text, options);
    }

    // assert element to have count
    async toHaveCount(selector: string, count: number) {
        await expect(this.page.locator(selector)).toHaveCount(count);
    }

    // assert element to have value
    async toHaveValue(selector: string, value: string | RegExp) {
        await expect(this.page.locator(selector)).toHaveValue(value);
    }

    // assert element to have attribute along with attribute value
    async toHaveAttribute(selector: string, attribute: string, value: string | RegExp) {
        await expect(this.page.locator(selector)).toHaveAttribute(attribute, value);
    }

    // assert element to have class [pass regex for contain class]
    async toHaveClass(selector: string, className: string | RegExp | readonly (string | RegExp)[]) {
        await expect(this.page.locator(selector)).toHaveClass(className);
    }

    // assert select element to have value [select, input]
    async toHaveSelectedValue(selector: string, value: string, options?: { timeout?: number; intervals?: number[] }) {
        await this.toPass(async () => {
            const selectedValue = await this.getSelectedValue(selector);
            expect(selectedValue).toBe(value);
        }, options);
    }

    // assert select element to have label
    async toHaveSelectedLabel(selector: string, value: string, options?: { timeout?: number; intervals?: number[] }) {
        await this.toPass(async () => {
            const selectedValue = await this.getSelectedText(selector);
            expect(selectedValue).toBe(value);
        }, options);
    }

    // assert element to have background color
    async toHaveBackgroundColor(selector: string, backgroundColor: string, options?: { timeout?: number; intervals?: number[] }) {
        await this.toPass(async () => {
            const value = await this.getElementBackgroundColor(selector);
            expect(value).toBe(backgroundColor);
        }, options);
    }

    // assert element to have color
    async toHaveColor(selector: string, backgroundColor: string, options?: { timeout?: number; intervals?: number[] }) {
        await this.toPass(async () => {
            const value = await this.getElementColor(selector);
            expect(value).toBe(backgroundColor);
        }, options);
    }

    // assert element to contain text
    async toContainTextFrameLocator(frame: string, frameSelector: string, text: string | RegExp, options?: { timeout?: number; intervals?: number[] }): Promise<void> {
        await this.toPass(async () => {
            const locator = this.page.frameLocator(frame).locator(frameSelector);
            await expect(locator).toContainText(text);
        }, options);
    }

    // assert async function (test step) to pass
    async toPass(asyncFn: () => Promise<void>, options?: { timeout?: number; intervals?: number[] } | undefined) {
        await expect(async () => {
            await asyncFn();
        }).toPass(options);
    }

    // assert async function (api request) to poll
    async toPoll(asyncFn: () => Promise<number>, options?: { message?: string; timeout?: number }) {
        await expect
            .poll(async () => {
                return await asyncFn();
            }, options)
            .toBe(200);
    }

    // assert element not to be visible
    async notToBeVisible(selector: string) {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    // assert checkbox to be unchecked
    async notToBeChecked(selector: string, options?: { checked?: boolean; timeout?: number } | undefined) {
        await expect(this.page.locator(selector)).not.toBeChecked(options);
    }

    // assert element not to have text
    async notToHaveText(selector: string, text: string | RegExp | readonly (string | RegExp)[], option?: { ignoreCase?: boolean; timeout?: number; useInnerText?: boolean } | undefined) {
        await expect(this.page.locator(selector)).not.toHaveText(text, option);
    }

    // assert element not to contain text
    async notToContainText(selector: string, text: string | RegExp | readonly (string | RegExp)[], options?: { ignoreCase?: boolean; timeout?: number; useInnerText?: boolean } | undefined) {
        await expect(this.page.locator(selector)).not.toContainText(text, options);
    }

    // assert element not to have count
    async notToHaveCount(selector: string, count: number) {
        await expect(this.page.locator(selector)).not.toHaveCount(count);
    }

    // assert element not to have value
    async notToHaveValue(selector: string, value: string | RegExp) {
        await expect(this.page.locator(selector)).not.toHaveValue(value);
    }

    // assert element not to have attribute
    async notToHaveAttribute(selector: string, attribute: string, value: string) {
        await expect(this.page.locator(selector)).not.toHaveAttribute(attribute, value);
    }

    // assert element not to have class
    async notToHaveClass(selector: string, className: string | RegExp | readonly (string | RegExp)[]) {
        await expect(this.page.locator(selector)).not.toHaveClass(className);
    }

    /**
     * Custom assertion methods
     */

    // checked multiple elements with same selector/class/xpath
    async toBeCheckedMultiple(selector: string): Promise<void> {
        for (const element of await this.page.locator(selector).all()) {
            await expect(element).toBeChecked();
        }
    }

    // admin enable switcher, if enabled then Skip : admin settings switcher
    async switcherHasColor(selector: string, color: string): Promise<void> {
        selector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        await this.toHaveBackgroundColor(selector, color);
    }

    /**
     * Custom methods
     */

    // dokan select2
    async select2ByText(selectSelector: string, optionSelector: string, text: string): Promise<void> {
        await this.click(selectSelector);
        await this.typeAndWaitForResponse(data.subUrls.ajax, optionSelector, text);
        await this.toContainText('.select2-results__option.select2-results__option--highlighted', text);
        await this.press('Enter');
    }

    // dokan select2 multi-selector
    async select2ByTextMultiSelector(selectSelector: string, optionSelector: string, text: string): Promise<void> {
        const isExists = await this.isLocatorExists(`//li[@class="select2-selection__choice" and @title="${text}"]`);
        if (!isExists) {
            await this.click(selectSelector);
            await this.typeAndWaitForResponse(data.subUrls.ajax, optionSelector, text);
            await this.toContainText('.select2-results__option.select2-results__option--highlighted', text);
            await this.press('Enter');
        }
    }

    // admin enable switcher, if enabled then Skip : admin settings switcher
    async enableSwitcher(selector: string): Promise<void> {
        selector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(selector);
        if (!value.includes('rgb(0, 144, 255)')) {
            await this.click(selector);
        }
    }

    // admin disable switcher, if disabled then skip : admin settings switcher
    async disableSwitcher(selector: string): Promise<void> {
        selector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(selector);
        if (value.includes('rgb(0, 144, 255)')) {
            await this.click(selector);
        }
    }

    // admin enable switcher, if enabled then Skip : admin settings switcher
    async enableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response | string> {
        selector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(selector);
        if (!value.includes('rgb(0, 144, 255)')) {
            const response = await this.clickAndWaitForResponse(subUrl, selector, code);
            return response;
        }
        return '';
    }

    // admin disable switcher, if disabled then skip : admin settings switcher
    async disableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response | string> {
        selector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(selector);
        if (value.includes('rgb(0, 144, 255)')) {
            const response = await this.clickAndWaitForResponse(subUrl, selector, code);
            return response;
        }
        return '';
    }

    // enable switch or checkbox: dokan setup wizard
    async enableSwitcherSetupWizard(selector: string): Promise<void> {
        const value = await this.getPseudoElementStyles(selector, 'before', 'background-color');
        // rgb(251, 203, 196) for switcher & rgb(242, 98, 77) for checkbox
        if (!value.includes('rgb(251, 203, 196)') && !value.includes('rgb(242, 98, 77)')) {
            if (selector.includes('withdraw_methods')) selector += '/..';
            await this.click(selector);
        }
    }

    // disable switch or checkbox: dokan setup wizard
    async disableSwitcherSetupWizard(selector: string): Promise<void> {
        const value = await this.getPseudoElementStyles(selector, 'before', 'background-color');
        // rgb(251, 203, 196) for switcher & rgb(242, 98, 77) for checkbox
        if (value.includes('rgb(251, 203, 196)') || value.includes('rgb(242, 98, 77)')) {
            if (selector.includes('withdraw_methods')) selector += '/..';
            await this.click(selector);
        }
    }

    // admin enable switcher , if enabled then Skip : vendor dashboard disbursements
    async enableSwitcherDisbursement(selector: string): Promise<void> {
        selector = /^(\/\/|\(\/\/)/.test(selector) ? `${selector}//span` : `${selector} span`;
        const value = await this.getElementBackgroundColor(selector);
        if (!value.includes('rgb(33, 150, 243)')) {
            await this.click(selector);
        }
    }

    // enable switch or checkbox: vendor dashboard delivery time
    async enableSwitcherDeliveryTime(selector: string): Promise<void> {
        const value = await this.hasClass((selector += '//div[contains(@class,"minitoggle")]'), 'active');
        if (!value) {
            await this.click(selector);
        }
    }

    // admin enable payment methods via slider
    async enablePaymentMethod(selector: string): Promise<void> {
        const value = await this.hasClass(selector, 'woocommerce-input-toggle--disabled');
        if (value) {
            await this.clickAndWaitForResponse(data.subUrls.ajax, selector);
        }
        await this.toHaveClass(selector, /woocommerce-input-toggle--enabled/);
        await this.toHaveBackgroundColor(selector, 'rgb(0, 124, 186)');
    }

    // upload media
    async uploadMedia(file: string) {
        await this.click(selector.wpMedia.mediaLibrary);
        const uploadedMediaIsVisible = await this.isVisible(selector.wpMedia.uploadedMediaFirst, 3);
        if (uploadedMediaIsVisible) {
            await this.click(selector.wpMedia.uploadedMediaFirst);
            console.log('File Already Uploaded');
        } else {
            await this.click(selector.wpMedia.uploadFiles);
            await this.uploadFile(selector.wpMedia.selectFilesInput, file);
            console.log('File Uploaded');
        }

        await this.toPass(async () => {
            const isSelected = await this.isEnabled(selector.wpMedia.select);
            if (!isSelected) {
                await this.click(selector.wpMedia.selectUploadedMedia);
            }
            await this.toBeEnabled(selector.wpMedia.select);
        });

        await this.click(selector.wpMedia.select);
        await this.clickIfVisible(selector.wpMedia.crop);
    }
}
