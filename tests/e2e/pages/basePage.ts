import {
	expect,
	type Page,
	type BrowserContext,
	type Cookie,
	type Request,
	type Response,
	type Locator,
	type Frame,
	type FrameLocator,
	type JSHandle,
	type ElementHandle,
} from '@playwright/test';
import { helpers } from '../utils/helpers';
import { selector } from './selectors';
require('dotenv').config();

// This Page Contains All Necessary Playwright Automation Methods

export class BasePage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	/**
	 * Page navigation methods
	 */

	// wait for navigation to complete
	async waitForNavigation(): Promise<void> {
		await this.page.waitForNavigation({ waitUntil: 'networkidle' });
	}

	// wait for request
	async waitForRequest(url: string): Promise<Request> {
		return await this.page.waitForRequest(url);
	}

	// wait for Response
	async waitForResponse(url: string): Promise<Response> {
		return await this.page.waitForResponse(url);
	}

	// wait for load state
	async waitForLoadState(): Promise<void> {
		return await this.page.waitForLoadState();
	}

	// wait for url to be loaded
	async waitForUrl(url: string): Promise<void> {
		await this.page.waitForURL(url);
	}

	// goto subUrl
	async goto(subPath: string) {
		// let subPath1: string = await this.createUrl(subPath)
		await this.page.goto(subPath);
	}

	// go forward
	async goForward() {
		await this.page.goForward();
	}

	// go back
	async goBack() {
		await this.page.goBack();
	}

	// reload page
	async reload() {
		await this.page.reload();
	}

	//  returns whether the current URL is expected
	async isCurrentUrl(subPath: string): Promise<boolean> {
		const currentURL = new URL(await this.getCurrentUrl());
		return currentURL.href === await this.createUrl(subPath);
	}

	// Create a New URL
	async createUrl(subPath: string) {
		// let url = new URL(process.env.BASE_URL)
		// url.pathname = url.pathname + subPath + '/'
		// return url.href
		return process.env.BASE_URL + '/' + subPath;
	}

	// goto subPath if not already there
	async goIfNotThere(subPath: string) {
		if (! await this.isCurrentUrl(subPath)) {
			const url = await this.createUrl(subPath);
			await this.page.goto(url, { waitUntil: 'networkidle' });

			const currentUrl = await this.getCurrentUrl();
			expect(currentUrl).toMatch(subPath);
		}
	}

	// goto subPath if about:blank is loaded
	async goIfBlank(subPath: string) {
		const blankPage = await this.page.evaluate(() => window.location.href === 'about:blank');
		if (blankPage) {
			await this.goto(subPath);
		}
	}

	/**
	 * current page methods
	 */

	// get base url
	async getBaseUrl(): Promise<string> {
		const url = await this.getCurrentUrl();
		return new URL(url).origin;
	}

	// get current page url
	async getCurrentUrl(): Promise<string> {
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
	async getPageContext(): Promise<BrowserContext> {
		return this.page.context();
	}

	// assign html markup to the current page
	async setContent(html: string): Promise<void> {
		await this.page.setContent(html);
	}

	//brings page to front (activates tab)
	async bringToFront(): Promise<void> {
		await this.page.bringToFront();
	}

	// scroll to top
	async scrollToTop() { //TODO: crosscheck
		await this.page.evaluate(() => {
			window.scroll(0, 0);
		});
		await this.page.waitForTimeout(1000);
	}

	/**
	 * click methods
	 */

	// click on element
	async click(selector: string): Promise<void> {
		await this.page.locator(selector).click();
		// await this.page.click(selector)
	}

	// double click on element
	async doubleClick(selector: string): Promise<void> {
		await this.page.dblclick(selector);
	}

	// click & wait for navigation to complete
	async clickAndWaitForNavigation(selector: string): Promise<void> {
		await Promise.all([this.page.waitForNavigation({ waitUntil: 'networkidle' }), this.page.locator(selector).click()]);
	}

	// click & wait for request
	async clickAndWaitForRequest(url: string, selector: string): Promise<void> {
		await Promise.all([this.page.waitForRequest(url), this.page.locator(selector).click()]);
	}

	// click & wait for response
	async clickAndWaitForResponse(subUrl: string, selector: string, code: number = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			this.page.locator(selector).click(),
		]);
		expect(response.status()).toBe(code);
		return response;
	}

	// type & wait for response
	async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code: number = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			// await this.page.type(selector, text),
			await this.clearAndFill(selector, text),
		]);
		expect(response.status()).toBe(code);
		return response;
	}

	// type & wait for response
	async pressAndWaitForResponse(subUrl: string, key: string, code: number = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			this.press(key),
		]);
		expect(response.status()).toBe(code);
		return response;
	}

	// click & wait for event
	async clickAndWaitForEvent(event: any, selector: string): Promise<void> {
		await Promise.all([this.page.waitForEvent(event), this.page.locator(selector).click()]);
		// const popupPromise = this.page.waitForEvent(event)
		// this.page.locator(selector).click()
		// const popup = await popupPromise
	}

	// click & wait for load state
	async clickAndWaitForLoadState(url: string, selector: string): Promise<void> {
		await Promise.all([this.page.waitForLoadState(), this.page.locator(selector).click()]);
	}

	// click if visible
	async clickIfVisible(selector: string) {
		const IsVisible = await this.isVisible(selector);
		if (IsVisible) {
			await this.click(selector);
		}
	}

	/**
	 * Keyboard methods
	 */

	// press key
	async press(key: string) {
		await this.page.keyboard.press(key);
	}

	// press on selector [Focuses the element, and then uses keyboard press]
	async pressOnSelector(selector: string, key: string) {
		await this.page.press(selector, key);
	}

	/**
	 * selector methods
	 */

	// wait for selector
	async waitForSelector(selector: string): Promise<void> {
		await this.page.waitForSelector(selector);
	}

	// get locator //TODO: need to update this
	async getLocator(selector: string): Promise<object> {
		return this.page.locator(selector);
	}

	// get locators  //TODO: need to test
	async getLocators(selector: string): Promise<object> {
		return this.page.locator(selector).elementHandles();
		// return this.page.$$(selector);
	}

	// returns whether the element is visible
	async isVisible(selector: string): Promise<boolean> {
		return await this.page.isVisible(selector);
	}

	// returns whether the element is hidden
	async isHidden(selector: string): Promise<boolean> {
		return await this.page.isHidden(selector);
	}

	// returns whether the element is enabled
	async isEnabled(selector: string): Promise<boolean> {
		return await this.page.isEnabled(selector);
	}

	// returns whether the element is editable
	async isEditable(selector: string): Promise<boolean> {
		return await this.page.isEditable(selector);
	}

	// returns whether the element is disabled
	async isDisabled(selector: string): Promise<boolean> {
		return await this.page.isDisabled(selector);
	}

	// returns whether the element is checked
	async isChecked(selector: string): Promise<boolean> {
		return await this.page.isChecked(selector);
	}

	// focus on selector
	async focus(selector: string): Promise<void> {
		await this.page.focus(selector);
	}

	// hover on selector
	async hover(selector: string): Promise<void> {
		await this.page.hover(selector, { timeout: 20000 });
		await this.wait(1);
	}

	// drag and drop
	async dragAndDrop(source: string, target: string): Promise<void> {
		await this.page.dragAndDrop(source, target);
	}

	// get element
	async getElement(selector: string): Promise<Locator> {
		return this.page.locator(selector);
	}

	// get element text content
	async getElementText(selector: string): Promise<string | null> {
		return await this.page.textContent(selector);
	}

	// get element inner text
	async getElementInnerText(selector: string): Promise<string> {
		return await this.page.innerText(selector);
	}

	// get element inner html
	async getElementInnerHtml(selector: string): Promise<string> {
		return await this.page.innerHTML(selector);
	}

	//get element value [input, textarea, select]
	async getElementValue(selector: string): Promise<string> {
		return await this.page.inputValue(selector);
	}

	//get attribute value
	async getAttributeValue(selector: string, attribute: string): Promise<string | null> {
		return await this.page.getAttribute(selector, attribute);
	}

	//get class attribute value
	async getClassValue(selector: string): Promise<string | null> {
		return await this.page.getAttribute(selector, 'className'); //TODO: maybe class
	}

	// set attribute value
	async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> { //TODO: update with playwright method
		// await page.$eval(selector, (element, attribute, value) => element.setAttribute(attribute, value), attribute, value)
		const element = this.page.locator(selector);
		// await this.page.evaluate((element, attribute, value) => element.setAttribute(attribute, value), element, attribute, value)
		await element.evaluate((element) => element.setAttribute(attribute, value));
	}

	// remove element attribute
	async removeAttribute(selector: string, attribute: string): Promise<void> { //TODO: update with playwright method
		// let element = await this.getElement(selector)
		// await this.page.evaluate((element, attribute) => element.removeAttribute(attribute), element, attribute)
		const elementHandle = await this.page.$(selector);
		// let elementHandle = await this.page.waitForSelector(selector)
		await elementHandle.evaluate((element) => element.removeAttribute(attribute));
	}

	// get element property value: background color
	async getElementBackgroundColor(selector: string) {
		const element = this.page.locator(selector);
		const value = await element.evaluate((element) => window.getComputedStyle(element).getPropertyValue('background-color'));
		// console.log(value)
		return value;
	}

	// get element property value: background color
	async getElementColor(selector: string) {
		const element = this.page.locator(selector);
		const value = await element.evaluate((element) => window.getComputedStyle(element).getPropertyValue('color'));
		// console.log(value)
		return value;
	}

	// get multiple element texts
	async getMultipleElementTexts(selector: string) {
		const texts = await this.page.$$eval(selector, (elements) => elements.map((item) => item.textContent));
		// console.log(texts)
		return texts;
	}

	// get element bounding box
	async getElementBoundingBox(selector: string) {
		const boundingBox = await this.page.locator(selector).boundingBox();
		return boundingBox;
	}

	/**
	 * timeout methods
	 */

	// change default maximum time(seconds) for all the methods
	async setDefaultNavigationTimeout(timeout: number): Promise<void> {
		this.page.setDefaultTimeout(timeout * 1000);
	}

	// change default maximum navigation time(seconds) for all navigation methods [goto, goBack, goForward, ...]
	async setDefaultTimeout(timeout: number): Promise<void> {
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

	// clear input field and type
	// async clearAndType(selector: string, text: string): Promise<void> { // TODO: need to update
	// 	await this.page.type(selector, text);
	// }

	// clear input field and type
	async clearAndFill(selector: string, text: string): Promise<void> {
		await this.page.fill(selector, text);
	}

	// type in input field
	async type(selector: string, text: string) {
		await this.page.type(selector, text);
	}

	// fill in input field
	async fill(selector: string, text: string) {
		await this.page.fill(selector, text);
	}

	// append in input filed
	async append(selector: string, text: string) {
		await this.focus(selector);
		await this.press('End');
		await this.page.type(selector, text);
	}

	// check/uncheck input fields [checkbox/radio] based on choice
	async checkUncheck(selector: string, checked: boolean): Promise<void> {
		await this.page.setChecked(selector, checked);
	}

	// check input fields [checkbox/radio]
	async check1(selector: string,): Promise<void> {
		await this.page.check(selector);
	}

	// check input fields [checkbox/radio]
	async check(selector: string,): Promise<void> {
		await this.page.setChecked(selector, true);
	}

	// uncheck input fields [checkbox/radio]
	async uncheck(selector: string): Promise<void> {
		await this.page.uncheck(selector);
	}

	/**
	 * Input field methods
	 */

	// // select option by value/text/index
	// async select(selector: string, choice: string, value: string | number): Promise<string[]> {
	//     switch (choice) {
	//     case 'value':
	//     return await this.page.selectOption(selector, {value: value})
	//         case 'label':
	//     return await this.page.selectOption(selector, {label: value})
	//         case 'index':
	//     return await this.page.selectOption(selector, {index: value})
	//         default:
	//         break
	// }
	// }

	// select by value
	async selectByValue(selector: string, value: string): Promise<string[]> {
		return await this.page.selectOption(selector, { value });
	}

	// select by label
	async selectByLabel(selector: string, value: string): Promise<string[]> {
		return await this.page.selectOption(selector, { label: value });
	}

	// select by number
	async selectByNumber(selector: string, value: number): Promise<string[]> {
		return await this.page.selectOption(selector, { index: value });
	}

	// // set value based on select options text
	// async selectByText(selectSelector: string, optionSelector: string, text: string) {
	//     let optionValue = await this.page.$$eval(optionSelector, (options, text) => options.find(option => (option.innerText).toLowerCase() === text.toLowerCase())?.value, text)
	//     await this.selectByValue(selectSelector, optionValue);
	// }

	/**
	 * Files & Media methods
	 */

	// upload file
	async uploadFile(selector: string, files: []): Promise<void> {
		await this.page.setInputFiles(selector, files);
	}

	// upload file
	async uploadBuffer(selector: string, fileName: string, mimeType: string, buffer: Buffer): Promise<void> {
		await this.page.setInputFiles(selector, {
			name: fileName,
			mimeType,
			buffer: Buffer.from(buffer),
		});
	}

	// upload files when input file element is missing
	async uploadFileViaListener(selector: string, files: []): Promise<void> {
		this.page.on('filechooser', async (fileChooser: any) => {
			await fileChooser.setFiles(files);
		});
		await this.page.locator(selector).click(); //    invokes the filechooser
	}

	async uploadFileViaListener1(selector: string, files: []): Promise<void> {
		// Start waiting for file chooser before clicking. Note no await.
		const fileChooserPromise = this.page.waitForEvent('filechooser'); //Note: no await on listener
		await this.page.locator(selector).click(); //    invokes the filechooser
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(files);

		// or
		// const fileChooserPromise = await Promise.all([
		//     this.page.waitForEvent('filechooser')
		//     this.page.locator(selector).click()
		// ])
		// await fileChooser.setFiles(files)
	}

	// remove selected files to upload
	async removeSelectedFileToUpload(selector: string, file: []): Promise<void> {
		await this.page.setInputFiles(selector, []);
	}

	// get screenshot
	async getScreenshot(path: string, fullPage: boolean = false): Promise<void> {
		await this.page.screenshot({ path, fullPage });
	}

	// get screenshots as buffer
	async getScreenshotBuffer(path: string): Promise<string> {
		const screenshot = await this.page.screenshot({ path });
		const buffer = screenshot.toString('base64');
		return buffer;
	}

	// get screenshot
	async getElementScreenshot(selector: string, path: string,): Promise<void> {
		await this.page.locator(selector).screenshot({ path });
	}

	// generate a pdf of the page
	async pdf(): Promise<void> {
		await this.page.pdf();
	}

	/**
	 * Frame [iframe] methods
	 */

	//  get all frames attached to the page
	async getAllFrames(): Promise<Frame[]> {
		return this.page.frames();
	}

	// get frame
	async getFrame(frame: string): Promise<Frame | null> {
		return this.page.frame(frame);
	}

	// get child frames
	async getChildFrames(frame: string): Promise<Frame[] | null> {
		const parentFrame = this.page.frame(frame);
		const childFrames = parentFrame.childFrames();
		return childFrames;
	}

	// get frame
	async getFrameSelector(frame: string, frameSelector: string): Promise<FrameLocator> {
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
		// await locator.type(text);
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
		locator.dispatchEvent(event);
	}

	// drag locator to target locator
	async dragToTargetLocator(sourceSelector: string, targetSelector: string): Promise<void> {
		const sourceLocator = await this.page.locator(sourceSelector);
		const targetLocator = await this.page.locator(targetSelector);
		await sourceLocator.dragTo(targetLocator);
	}

	// resolves given locator to the first matching DOM element
	async getElementHandle(selector: string): Promise<ElementHandle> {
		let locator = this.page.locator(selector)
		return await locator.elementHandle()
	}

	// resolves given locator to all matching DOM elements
	async getElementHandles(selector: string): Promise<ElementHandle[]> {
		const locator = this.page.locator(selector);
		return await locator.elementHandles();
	}

	// returns the return value of pageFunction
	async evaluate(selector: string, pageFunction: string): Promise<void> {
		const locator = this.page.locator(selector);
		await locator.evaluate(pageFunction);
	}

	// returns the result of pageFunction invocation
	async evaluateAll(selector: string, pageFunction: string): Promise<void> {
		const locator = this.page.locator(selector);
		await locator.evaluateAll(pageFunction);
	}

	// returns the return value of pageFunction as a JSHandle
	async evaluateHandle(selector: string, pageFunction: Function | string): Promise<JSHandle> {
		const locator = this.page.locator(selector);
		return await locator.evaluateHandle(pageFunction);
	}

	// fill input locator
	async fillLocator(selector: string, text: string): Promise<void> {
		const locator = this.page.locator(selector);
		await locator.fill(text);
	}

	// filter locator through inner locator or text
	async filterLocator(selector: string, filterOptions: object): Promise<Locator> {
		const locator = this.page.locator(selector);
		return locator.filter(filterOptions);
	}

	// get first matching locator
	async firstLocator(selector: string): Promise<Locator> {
		const locator = this.page.locator(selector);
		return locator.first();
	}

	// focus locator
	async focusOnLocator(selector: string): Promise<void> {
		const locator = this.page.locator(selector);
		await locator.focus();
	}

	// get frame locator
	async frameLocator(selector: string): Promise<FrameLocator> {
		const locator = this.page.locator(selector);
		return await locator.frameLocator(selector);
	}

	// get locator attribute value
	async getAttributeOfLocator(selector: string, attribute: string): Promise<null | string> {
		const locator = this.page.locator(selector);
		return locator.getAttribute(attribute);
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

	//  returns whether the locator is visible
	async isVisibleLocator(selector: string): Promise<boolean> {
		const locator = this.page.locator(selector);
		return await locator.isVisible();
	}

	// get last matching locator
	async lastLocator(selector: string): Promise<Locator> {
		const locator = this.page.locator(selector);
		return locator.last();
	}

	// get child locator
	async locatorOfLocator(parentSelector: string, childSelector: string): Promise<Locator> {
		const locator = this.page.locator(parentSelector);
		return locator.locator(childSelector);
	}

	// get n-th matching locator
	async nthLocator(selector: string, index: number): Promise<Locator> {
		const locator = this.page.locator(selector);
		return await locator.nth(index);
	}

	// get the page locator belongs to
	async pageOfLocator(selector: string): Promise<Page> {
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
	async scrollIntoViewLocator(selector: string): Promise<void> {
		const locator = this.page.locator(selector);
		await locator.scrollIntoViewIfNeeded();
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

	//  upload file
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
		await locator.type(text);
	}

	// uncheck locator
	async uncheckLocator(selector: string): Promise<void> {
		const locator = this.page.locator(selector);
		await locator.uncheck();
	}

	// wait for locator
	async waitForLocator(selector: string): Promise<void> {
		const locator = this.page.locator(selector);
		await locator.waitFor();
	}

	/**
	 * Dialog methods
	 */

	// accept alert
	async acceptAlert(): Promise<void> {
		this.page.on('dialog', (dialog) => {
			dialog.accept();
		});
	}

	// dismiss alert
	async dismissAlert(): Promise<void> {
		this.page.on('dialog', (dialog) => {
			dialog.dismiss();
		});
	}

	// type on prompt box/alert
	async fillAlert(value: string): Promise<void> {
		this.page.on('dialog', (dialog) => {
			dialog.accept(value);
		});
	}

	// get default prompt value. Otherwise, returns empty string.
	async getDefaultPromptValue(): Promise<string> {
		let value: string;
		this.page.on('dialog', (dialog) => {
			value = dialog.defaultValue();
		});
		return value;
	}

	// get dialog's type [alert, beforeunload, confirm or prompt]
	async getDialogType(): Promise<string> {
		let type: string;
		this.page.on('dialog', (dialog) => {
			type = dialog.type();
		});
		return type;
	}

	// get dialog's message
	async getDialogMessage(): Promise<string> {
		let message: string;
		this.page.on('dialog', (dialog) => {
			message = dialog.message();
		});
		return message;
	}

	/**
	 * Cookies methods
	 */

	// get cookies
	async getCookie(name: string): Promise<Cookie[]> {
		return await this.page.context().cookies();
	}

	// get wp current user
	async getCurrentUser() {
		const cookies = await this.page.context().cookies();
		const cookie = cookies.find((c) => {
			let _c$name;
			return !!(c !== null && c !== void 0 && (_c$name = c.name) !== null && _c$name !== void 0 && _c$name.startsWith('wordpress_logged_in_'));
		});
		if (!(cookie !== null && cookie !== void 0 && cookie.value)) {
			return;
		}
		return decodeURIComponent(cookie.value).split('|')[0];
	}

	/**
	 * dropdown methods
	 */

	// set dropdown option  span dropdown
	async setDropdownOptionSpan(selector: string, value: string) {
		const elements = await this.page.$$(selector);
		for (const element of elements) {
			const text: any = element.evaluate((element) => element.textContent, element);
			// console.log(text)
			if (value.toLowerCase() == (text.trim()).toLowerCase()) {
				// console.log(text)
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
	 * custom methods
	 */

	// dokan select2
	async select2ByText(selectSelector: string, optionSelector: string, text: string) {
		await this.click(selectSelector);
		await this.type(optionSelector, text);
		await this.press('Enter');
	}

	// admin enable switcher , if enabled then Skip : admin settings switcher
	async enableSwitcher(selector: string): Promise<void> {
		(/^(\/\/|\(\/\/)/.test(selector)) ? selector += '//span' : selector += ' span';
		const value = await this.getElementBackgroundColor(selector);
		// console.log(selector, value);
		// if (!value.includes('rgb(0, 144, 255)')) {
		if ((!value.includes('rgb(0, 144, 255))')) && (!value.includes('rgb(33, 150, 243)'))) {
			await this.click(selector);
		}
	}

	// admin disable switcher , if disabled then skip : admin settings switcher
	async disableSwitcher(selector: string): Promise<void> {
		(/^(\/\/|\(\/\/)/.test(selector)) ? selector += '//span' : selector += ' span';
		const value = await this.getElementBackgroundColor(selector);
		// if (value.includes('rgb(0, 144, 255)')) {
		if ((value.includes('rgb(0, 144, 255))')) && (value.includes('rgb(33, 150, 243)'))) {
			await this.click(selector);
		}
	}

	// admin Enable payment methods via Slider
	async enablePaymentMethod(selector: string) {
		const classValueBefore: any = await this.getClassValue(selector);
		if (classValueBefore.includes('woocommerce-input-toggle--disabled')) {
			await this.click(selector);
		}
		const classValueAfter = await this.getClassValue(selector);
		expect(classValueAfter).toContain('woocommerce-input-toggle--enabled');
	}

	// get pseudo element style
	async getPseudoElementStyles(selector: string, pseudoElement: string, property: string) {
		let element = await this.getElement(selector)
		// let value = await this.page.evaluate(([element, pseudoElement, property]) => window.getComputedStyle(element, '::' + pseudoElement).getPropertyValue(property), [element, pseudoElement, property]) //todo:fix via page.evaluate
		const value = await element.evaluate((element, [pseudoElement, property]) => window.getComputedStyle(element, '::' + pseudoElement).getPropertyValue(property), [pseudoElement, property]);
		// console.log(value);  
		return value;
	}

	// enable switch or checkbox: dokan setup wizard
	async enableSwitcherSetupWizard(selector: string) {
		let value = await this.getPseudoElementStyles(selector, 'before', 'background-color')
		// rgb(251, 203, 196) for switcher & rgb(242, 98, 77) for checkbox
		if ((!value.includes('rgb(251, 203, 196)')) && (!value.includes('rgb(242, 98, 77)'))) {
			if (selector.includes('withdraw_methods')) selector += '/..';
			await this.click(selector);
		}
	}

	// disable switch or checkbox: dokan setup wizard
	async disableSwitcherSetupWizard(selector: string) {
		let value: any = await this.getPseudoElementStyles(selector, 'before', 'background-color')
		// rgb(251, 203, 196) for switcher & rgb(242, 98, 77) for checkbox
		if ((value.includes('rgb(251, 203, 196)')) || (value.includes('rgb(242, 98, 77)'))) {
			if (selector.includes('withdraw_methods')) selector += '/..'
			await this.click(selector);
		}
	}

	// Check Multiple Elements with Same Selector/Class/Xpath
	async checkMultiple(selector: string) {
		for (const element of await this.page.locator(selector).all()) {
			const isCheckBoxChecked = await element.evaluate((element) => window.getComputedStyle(element).getPropertyValue('checked'));
			console.log(isCheckBoxChecked);
			
			if (!isCheckBoxChecked) {
				await element.click()
			}

			// let elements = await this.getElements(selector)
			// for (let element of elements) {
			// 	const isCheckBoxChecked = await (await element.getProperty("checked")).jsonValue()
			// 	if (!isCheckBoxChecked) {
			// 		await element.click()
			// 	}
			// }
		}
	}

	// delete element if exist (only first will delete) : dokan rma,report abuse
	async deleteIfExists(selector: string) { //TODO: there may be alternative solution, this method might not needed
		const elementExists = await this.isVisible(selector);
		if (elementExists) {
			const element = this.page.locator(selector);
			await element.click();
		}
	}

	//   TODO:: NEW methods

	/**
	 * page methods
	 */

	// get all pages
	async getAllPages() {
		const pages = this.page.context().pages();
		return pages;
	}
}
