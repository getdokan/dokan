import { expect, Page, BrowserContext, Cookie, Request, Response, Locator, Frame, FrameLocator, JSHandle, ElementHandle, } from '@playwright/test';
import { data } from 'utils/testData';

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
		return await this.page.waitForLoadState( 'domcontentloaded');
	}

	// wait for url to be loaded
	async waitForUrl(url: string, options?: any): Promise<void> {
		// await this.page.waitForURL(url,{ waitUntil: 'networkidle' });
		await this.page.waitForURL(url, options);
	}

	// goto subUrl
	async goto(subPath: string): Promise<void> {
		// let subPath1: string = await this.createUrl(subPath)
		// await this.page.goto(subPath);
		await this.page.goto(subPath, { waitUntil: 'networkidle' });
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

	//  returns whether the current URL is expected
	isCurrentUrl(subPath: string): boolean {
		const url = new URL(this.getCurrentUrl());
		const currentURL = url.href.replace(/[/]$/, ''); // added to remove last '/',
		return currentURL === (this.createUrl(subPath));
	}

	// Create a New URL
	createUrl(subPath: string): string {
		// let url = new URL(process.env.BASE_URL)
		// url.pathname = url.pathname + subPath + '/'
		// return url.href
		return process.env.BASE_URL + '/' + subPath;
	}

	// goto subPath if not already there
	async goIfNotThere(subPath: string): Promise<void> {
		if (!(this.isCurrentUrl(subPath))) {
			const url = this.createUrl(subPath);
			await this.page.goto(url, { waitUntil: 'networkidle' });
			const currentUrl = this.getCurrentUrl();
			expect(currentUrl).toMatch(subPath);
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
	 * current page methods
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

	//brings page to front (activates tab)
	async bringToFront(): Promise<void> {
		await this.page.bringToFront();
	}

	// scroll to top
	async scrollToTop(): Promise<void> {
		await this.page.keyboard.down(data.key.home);
		// await this.page.evaluate(() => window.scroll(0, 0));
		await this.wait(1);
	}

	// scroll to bottom
	async scrollToBottom(): Promise<void> {
		await this.page.keyboard.down(data.key.end);
		// await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		// await this.wait(0.5);
	}

	/**
	 * click methods
	 */

	// click on element
	async click(selector: string): Promise<void> {
		// await this.clickViaPage(selector); // TODO: keep which one is better
		await this.clickLocator(selector);
	}

	// click on element
	async clickViaPage(selector: string): Promise<void> {
		await this.page.click(selector);
	}

	//  click on element by Running the js element.Click() method
	async clickJs(selector: string): Promise<void> {
		const element = this.page.locator(selector);
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

	// click & wait for navigation to complete
	async clickAndWaitForNavigation(selector: string): Promise<void> {
		await Promise.all([
			this.page.waitForNavigation({ waitUntil: 'networkidle' }),
			this.page.locator(selector).click(),
		]);
	}
	// click & wait for navigation to complete
	async clickAndWaitForUrl(url: string, selector: string ): Promise<void> {
		await Promise.all([
			this.page.waitForURL(url, { waitUntil: 'networkidle' }),
			this.page.locator(selector).click(),
		]);
	}

	//TODo: add assertion to every function
	// click & wait for request
	async clickAndWaitForRequest(url: string, selector: string): Promise<void> {
		await Promise.all([
			this.page.waitForRequest(url),
			this.page.locator(selector).click()
		]);
	}

	// TODO: urgent : update wait for multiple different response
	// TODO: urgent : update wait for multiple same response
	// click & wait for response
	async clickAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			this.page.locator(selector).click()
		]);
		return response;
	}

	// click & wait for multiple responses
	async clickAndWaitForResponses(subUrls:   string[][], selector: string, code = 200): Promise<void | Response[]> {

		// 		// // const qrs: string[][] = [[data.subUrls.backend.quotes, '200'], [data.subUrls.backend.products, '200']];
		// // const qrs: string[][] = [[data.subUrls.backend.quotes, '200']];
		// await this.clickAndWaitForResponses(qrs, selector.admin.dokan.requestForQuotation.quoteRules.newQuoteRule);
		const promises = [];
		subUrls.forEach((subUrl) => {
			console.log('subUls: ', subUrl[0], ' code: ', subUrl[1]);
			// const promise = this.page.waitForResponse((resp) => resp.url().includes(subUrl[0] as string ) && resp.status() ===  (subUrl[1] ?? code));
			const promise = this.page.waitForResponse((resp) => resp.url().includes(subUrl[0]) && resp.status() ===  (subUrl[1]));
			promises.push(promise);
		});

		// promises.push(this.page.locator(selector).click());
		// const response = await Promise.all(promises);
		await Promise.all([
			...promises,
			this.page.locator(selector).click()
		]);

		return response;

	}

	// click & accept
	async clickAndAccept(selector: string,): Promise<void> {
		await Promise.all([
			this.acceptAlert(),
			this.page.locator(selector).click()
		]);
	}

	// click & wait for response
	async clickAndAcceptAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			this.acceptAlert(),
			this.page.locator(selector).click()
		]);
		return response;
	}

	// type & wait for response
	async typeAndWaitForResponse(subUrl: string, selector: string, text: string, code = 200,): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			// await this.page.type(selector, text),
			this.clearAndFill(selector, text),
		]);
		return response;
	}

	// type & wait for navigation
	async pressAndWaitForNavigation(key: string,): Promise<void> {
		await Promise.all([
			this.waitForNavigation(),
			this.press(key),
		]);
	}

	// type & wait for response
	async pressAndWaitForResponse(subUrl: string, key: string, code = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			this.press(key),
		]);
		return response;
	}

	// click & wait for event
	async clickAndWaitForEvent(event: any, selector: string): Promise<void> {
		await Promise.all([
			this.page.waitForEvent(event),
			this.page.locator(selector).click()
		]);
		// const popupPromise = this.page.waitForEvent(event)
		// this.page.locator(selector).click()
		// const popup = await popupPromise
	}

	// click & wait for load state
	async clickAndWaitForLoadState(url: string, selector: string): Promise<void> {
		await Promise.all([
			this.page.waitForLoadState(),
			this.page.locator(selector).click()
		]);
	}

	// click if visible
	async clickIfVisible(selector: string): Promise<void> {
		const isVisible = await this.isVisible(selector);
		if (isVisible) {
			await this.click(selector);
		}
	}

	// click if visible
	async clickIfExists(selector: string): Promise<void> {
		const isExists = await this.isLocatorExists(selector);
		if (isExists) {
			await this.click(selector);
		}
	}

	async isLocatorExists(selector: string): Promise<boolean> {
		return (await this.page.locator(selector).count()) ? true : false;
	}

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
	 * selector methods
	 */

	// wait for selector
	async waitForSelector(selector: string): Promise<void> {
		await this.page.waitForSelector(selector);
	}

	// get locator
	getLocator(selector: string): Locator {
		return this.page.locator(selector);
	}

	// get locators  //TODO: need to test
	async getLocators(selector: string): Promise<Locator[]> {
		return await this.page.locator(selector).all(); //TODO: keep which one is better ;
		// return this.page.locator(selector).elementHandles();
		// return this.page.$$(selector);
	}

	// returns whether the element is visible
	async isVisible(selector: string): Promise<boolean> {
		// return await this.isVisibleViaPage(selector);  //TODO: keep which one is better ; also update every page method with locator
		return await this.isVisibleLocator(selector);
	}

	// returns whether the element is visible
	async isVisibleViaPage(selector: string): Promise<boolean> {
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
		// await this.page.hover(selector, { timeout: 2000 });
		// await this.wait(1);
		await this.page.locator(selector).hover();
		await this.wait(1.5);
	}

	// drag and drop
	async dragAndDrop(source: string, target: string): Promise<void> {
		await this.page.dragAndDrop(source, target);
	}

	// get element
	getElement(selector: string): Locator {
		return this.page.locator(selector);
	}

	// get element text content
	async getElementText(selector: string): Promise<string | null> {
		return await this.textContentOfLocator(selector); //TODO: keep which one is better
		// return await this.page.textContent(selector);
	}
	// get element text content
	async getElementTextViaPage(selector: string): Promise<string | null> {
		return await this.page.textContent(selector);
	}

	//get element has test or not
	async hasText(selector: string, text: string): Promise<boolean> {
		//TODO: implement all has methods hasText, hasClass, hasAttribute, hasColor
		const elementText = await this.textContentOfLocator(selector);
		return elementText?.trim() === text ? true : false;
	}

	// get element text content
	async getElementTextIfVisible(selector: string): Promise<string | null> {
		const isVisible = await this.isVisible(selector);
		if (isVisible) {
			return await this.getElementText(selector);
		}
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

	//get class attribute value
	async getClassValue(selector: string): Promise<string | null> {
		return await this.page.getAttribute(selector, 'class');
	}

	//get element has class or not
	async hasClass(selector: string, className: string): Promise<boolean> {
		const element = this.page.locator(selector);
		const hasClass = await element.evaluate((element, className) => element.classList.contains(className), className,);
		return hasClass;
	}

	//get attribute value
	async getAttributeValue(selector: string, attribute: string): Promise<string | null> {
		return await this.page.getAttribute(selector, attribute);
	}

	// has attribute
	async hasAttribute(selector: string, attribute: string): Promise<boolean> {
		const element = this.page.locator(selector);
		const hasAttribute = await element.evaluate(
			(element, attribute) => element.hasAttribute(attribute),
			attribute,
		);
		return hasAttribute;
	}

	// set attribute/class value
	async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {
		const element = this.page.locator(selector);
		await element.evaluate((element, [attribute, value]) => element.setAttribute(attribute, value), [attribute, value],);
	}

	// remove element attribute
	async removeAttribute(selector: string, attribute: string): Promise<void> {
		const element = this.page.locator(selector);
		await element.evaluate(
			(element, attribute) => element.removeAttribute(attribute),
			attribute,
		);
	}

	// get element property value: background color
	async getElementBackgroundColor(selector: string): Promise<string> {
		const element = this.page.locator(selector);
		const value = await element.evaluate((element) =>
			window.getComputedStyle(element).getPropertyValue('background-color'),
		);
		// console.log(value)
		return value;
	}

	// get element property value: background color
	async getElementColor(selector: string): Promise<string> {
		// TODO: All promise<string> should be Promise<string | null> , after refactor check for any conflict
		const element = this.page.locator(selector);
		const value = await element.evaluate((element) =>
			window.getComputedStyle(element).getPropertyValue('color'),
		);
		// console.log(value)
		return value;
	}

	// get pseudo element style
	async getPseudoElementStyles(selector: string, pseudoElement: string, property: string ): Promise<string> {
		const element = this.getElement(selector);
		const value = await element.evaluate(
			(element, [pseudoElement, property]) =>
				window.getComputedStyle(element, '::' + pseudoElement).getPropertyValue(property),
			[pseudoElement, property],
		);
		// console.log(value);
		return value;
	}

	// TODO: apply pseudo-style

	// get multiple element texts
	async getMultipleElementTexts(selector: string): Promise<(string | null)[]> {
		const texts = await this.page.$$eval(selector, (elements) =>
			elements.map((item) => item.textContent),
		);
		// console.log(texts)
		return texts;
	}

	// get element bounding box
	async getElementBoundingBox(selector: string): Promise<null|{ x: number; y: number; width: number; height: number;}>{
		const boundingBox = await this.page.locator(selector).boundingBox();
		return boundingBox;
	}

	/**
	 * timeout methods
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
	async clearInputField1(selector: string): Promise<void> {
		const element = this.getElement(selector);
		await element.click({ clickCount: 3 });
		await this.press('Backspace');
	}

	// Or
	// async clearInputField2(selector): Promise<void>  { //TODO: fix this method
	// 	let element = await this.getElement(selector)
	// 	await this.page.evaluate(element => element.value = '', element)
	// }

	// clear input field and type
	async clearAndType(selector: string, text: string): Promise<void> {
		// TODO: need to update
		await this.fill(selector, text); //TODO: keep which one is better
		// await this.clearAndTypeViaPage(selector, text);
	}

	// clear input field and type
	async clearAndTypeViaPage(selector: string, text: string): Promise<void> {
		await this.clearInputField1(selector);
		await this.type(selector, text);
	}

	// clear input field and type
	async clearAndFill(selector: string, text: string): Promise<void> {
		await this.page.fill(selector, text);
	}

	// type in input field
	async type(selector: string, text: string): Promise<void> {
		await this.page.type(selector, text);
	}

	// fill in input field
	async fill(selector: string, text: string): Promise<void> {
		await this.page.fill(selector, text);
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
		await this.page.type(selector, text);
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
	async check1(selector: string): Promise<void> {
		await this.page.check(selector);
	}

	// check input fields [checkbox/radio]
	async check(selector: string): Promise<void> {
		// await this.checkViaPage(selector); //TODO: keep which one is better
		await this.checkLocator(selector);
	}

	// check input fields [checkbox/radio]
	async checkViaPage(selector: string): Promise<void> {
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
	async selectByNumber(selector: string, value: number | string): Promise<string[]> {
		return await this.page.selectOption(selector, { index: Number(value ) });
	}

	async selectByValueAndWaitForResponse(subUrl: string, selector: string, value: string, code = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			this.page.selectOption(selector, { value })
		]);
		return response;
	}

	async selectByLabelAndWaitForResponse(subUrl: string, selector: string, value: string, code = 200): Promise<Response> {
		const [response] = await Promise.all([
			this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
			this.page.selectOption(selector, { label: value })
		]);
		return response;
	}

	// // set value based on select options text
	// async selectByText(selectSelector: string, optionSelector: string, text: string): Promise<void> {
	//     let optionValue = await this.page.$$eval(optionSelector, (options, text) => options.find(option => (option.innerText).toLowerCase() === text.toLowerCase())?.value, text)
	//     await this.selectByValue(selectSelector, optionValue);
	// }

	/**
	 * Files & Media methods¸¸
	 */

	// upload file
	async uploadFile(selector: string, files: string | string[]): Promise<void> {
		// await this.page.setInputFiles(selector, files, { noWaitAfter: true });
		await this.page.setInputFiles(selector, files);
		await this.wait(2); //TODO: need to handle wait gracefully
	}

	// upload file
	async uploadBuffer(selector: string, filePath: string): Promise<void> {
		await this.page.setInputFiles(selector, { name: String(filePath.split('/').pop()),
			mimeType: 'image/' + filePath.split('.').pop(),
			buffer: Buffer.from(filePath), });
	}

	// upload files when input file element is missing
	async uploadFileViaListener(selector: string, files: string | string[]): Promise<void> {
		this.page.on('filechooser', async (fileChooser: any) => {
			await fileChooser.setFiles(files);
		});
		await this.page.locator(selector).click(); // invokes the filechooser
	}

	async uploadFileViaListener1(selector: string, files: string | string[]): Promise<void> {
		// Start waiting for file chooser before clicking. Note no await.
		const fileChooserPromise = this.page.waitForEvent('filechooser'); //Note: no await on listener
		await this.page.locator(selector).click(); //    invokes the filechooser
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

	//  get all frames attached to the page
	getAllFrames(): Frame[] {
		return this.page.frames();
	}

	// get frame
	getFrame(frame: string): Frame | null {
		return this.page.frame(frame);
	}

	// get child frames
	getChildFrames(frame: string): Frame[] | null {
		const parentFrame = this.page.frame(frame);
		const childFrames = parentFrame.childFrames();
		return childFrames;
	}

	// get frame
	getFrameSelector(frame: string, frameSelector: string): FrameLocator {
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
		await locator.check( { force: true }); //forced is used to avoid "locator.check: Clicking the checkbox did not change its state" error
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
	dispatchEvent(selector: string, event: string): void {
		const locator = this.page.locator(selector);
		locator.dispatchEvent(event);
	}

	// drag locator to target locator
	async dragToTargetLocator(sourceSelector: string, targetSelector: string): Promise<void> {
		const sourceLocator = this.page.locator(sourceSelector);
		const targetLocator = this.page.locator(targetSelector);
		await sourceLocator.dragTo(targetLocator);
	}

	// resolves given locator to the first matching DOM element
	async getElementHandle(selector: string): Promise<null|ElementHandle<SVGElement | HTMLElement>> {
		const locator = this.page.locator(selector);
		return await locator.elementHandle();
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
	filterLocator(selector: string, filterOptions: object): Locator {
		const locator = this.page.locator(selector);
		return locator.filter(filterOptions);
	}

	// get first matching locator
	firstLocator(selector: string): Locator {
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

	//  returns whether the locator is visible
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
	async waitForLocator(selector: string, option: any): Promise<void> {
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
		this.page.on('dialog', (dialog) => { dialog.accept(); });
	}

	// dismiss alert
	dismissAlert(): void {
		this.page.on('dialog', (dialog) => { dialog.dismiss(); });
	}

	// type on prompt box/alert
	fillAlert(value: string): void {
		this.page.on('dialog', (dialog) => { dialog.accept(value); });
	}

	// // get default prompt value. Otherwise, returns empty string.
	// getDefaultPromptValue(): string {
	// 	let value: string;
	// 	this.page.on('dialog', (dialog) => {
	// 		value = dialog.defaultValue();
	// 	});
	// 	return value;
	// }

	// // get dialog's type [alert, beforeunload, confirm or prompt]
	// async getDialogType(): Promise<string> {
	// 	let type: string;
	// 	this.page.on('dialog', (dialog) => {
	// 		type = dialog.type();
	// 	});
	// 	return type;
	// }

	// // get dialog's message
	// async getDialogMessage(): Promise<string> {
	// 	let message: string;
	// 	this.page.on('dialog', (dialog) => {
	// 		message = dialog.message();
	// 	});
	// 	return message;
	// }

	/**
	 * Cookies methods
	 */

	// get cookies
	async getCookie(): Promise<Cookie[]> {
		return await this.page.context().cookies();
	}

	// get wp current user
	async getCurrentUser(): Promise<string | undefined> {
		const cookies = await this.page.context().cookies();
		const cookie = cookies.find((c) => {
			let _c$name: string;
			return !!(
				c !== null &&
				c !== void 0 &&
				(_c$name = c.name) !== null &&
				_c$name !== void 0 &&
				_c$name.startsWith('wordpress_logged_in_')
			);
		});
		if (!(cookie !== null && cookie !== void 0 && cookie.value)) {return;}
		return decodeURIComponent(cookie.value).split('|')[0];
	}

	/**
	 * dropdown methods
	 */

	// set dropdown option  span dropdown
	async setDropdownOptionSpan(selector: string, value: string): Promise<void> {
		const elements = await this.page.$$(selector);
		for (const element of elements) {
			const text: string = element.evaluate((element) => element.textContent, element);
			// console.log(text)
			if (value.toLowerCase() == text.trim().toLowerCase()) {
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

	//   TODO:: NEW methods

	/**
	 * page methods
	 */

	// get all pages
	getAllPages(): Page[] {
		return this.page.context().pages();
	}

	/**
	 * Extra methods
	 */

	async multipleElementCheck(selectors: any){
		for (const selector in selectors ) {
			await this.check(selectors[selector]);
		}
	}

	async multipleElementVisible(selectors: any){

		// TODO: can also be merge with isVisible method and this method should support single selector too
		//TODO: implement for arrays
		// selectors = Object.values(selectors);
		// selectors.forEach( async (selector: string) => {
		// 	// console.log(selector);
		// await expect(this.page.locator(selector)).toBeVisible();
		// });

		for (const selector in selectors ) {
			// console.log(selectors[selector]);
			// await expect(this.page.locator(selectors[selector])).toBeVisible();
			await this.toBeVisible(selectors[selector]);
		}

	}


	/**
	 * Assertion methods
	 */

	// assert element to be visible
	async toBeVisible(selector: string,){
		await expect(this.page.locator(selector)).toBeVisible();
	}

	// assert element to contain text
	async toContainText(selector: string, text: string){
		await expect(this.page.locator(selector)).toContainText(text); //TODO: add lowercase for both expected and received
	}

	// assert element to have count
	async toHaveCount(selector: string, count: number){
		await expect(this.page.locator(selector)).toHaveCount(count);
	}

	// assert element to have value
	async toHaveValue(selector: string, value: string){
		await expect(this.page.locator(selector)).toHaveValue(value);
	}

	// assert element to have attribute
	async toHaveAttribute(selector: string, attribute: string, value: string){
		await expect(this.page.locator(selector)).toHaveAttribute(attribute, value);
	}

	// assert element to have class
	async toHaveClass(selector: string, className: string){
		await expect(this.page.locator(selector)).toHaveClass(className);
	}

	// assert element not to be visible
	async notToBeVisible(selector: string,){
		await expect(this.page.locator(selector)).not.toBeVisible();
	}

	// assert element not to contain text
	async notToContainText(selector: string, text: string){
		await expect(this.page.locator(selector)).not.toContainText(text);
	}

	// assert element not to have count
	async notToHaveCount(selector: string, count: number){
		await expect(this.page.locator(selector)).not.toHaveCount(count);
	}

	// assert element not to have value
	async notToHaveValue(selector: string, value: string){
		await expect(this.page.locator(selector)).not.toHaveValue(value);
	}

	// assert element not to have attribute
	async notToHaveAttribute(selector: string, attribute: string, value: string){
		await expect(this.page.locator(selector)).not.toHaveAttribute(attribute, value);
	}

	// assert element not to have class
	async notToHaveClass(selector: string, className: string){
		await expect(this.page.locator(selector)).not.toHaveClass(className);
	}


	/**
	 * custom methods
	 */

	// dokan select2
	async select2ByText(selectSelector: string, optionSelector: string, text: string): Promise<void> {
		await this.click(selectSelector);
		await this.type(optionSelector, text);
		await this.press('Enter');
	}

	// dokan select2 multi-selector
	async select2ByTextMultiSelector(	selectSelector: string,	optionSelector: string, text: string): Promise<void> {
		const isExists = await this.isLocatorExists(`//li[@class="select2-selection__choice" and @title="${text}"]`);
		if (!isExists) {
			await this.click(selectSelector);
			await this.typeAndWaitForResponse(data.subUrls.ajax, optionSelector, text);
			await this.press('Enter');
		}
	}

	// admin enable switcher , if enabled then Skip : admin settings switcher
	async enableSwitcher(selector: string): Promise<void> {
		/^(\/\/|\(\/\/)/.test(selector) ? (selector += '//span') : (selector += ' span');
		const value = await this.getElementBackgroundColor(selector);
		if (!value.includes('rgb(0, 144, 255)')) {
			await this.click(selector);
		}
	}

	// admin disable switcher , if disabled then skip : admin settings switcher
	async disableSwitcher(selector: string): Promise<void> {
		/^(\/\/|\(\/\/)/.test(selector) ? (selector += '//span') : (selector += ' span');
		const value = await this.getElementBackgroundColor(selector);
		if (value.includes('rgb(0, 144, 255)')) {
			await this.click(selector);
		}
	}

	// admin enable switcher , if enabled then Skip : admin settings switcher
	async enableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response | string> {
		/^(\/\/|\(\/\/)/.test(selector) ? (selector += '//span') : (selector += ' span');
		const value = await this.getElementBackgroundColor(selector);
		if (!value.includes('rgb(0, 144, 255)')) {
			const [response] = await Promise.all([
				this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
				this.page.locator(selector).click()
			]);
			return response;
		}
		return '';
	}

	// admin disable switcher , if disabled then skip : admin settings switcher
	async disableSwitcherAndWaitForResponse(subUrl: string, selector: string, code = 200): Promise<Response | string> {
		/^(\/\/|\(\/\/)/.test(selector) ? (selector += '//span') : (selector += ' span');
		const value = await this.getElementBackgroundColor(selector);
		if (value.includes('rgb(0, 144, 255)')) {
			const [response] = await Promise.all([
				this.page.waitForResponse((resp) => resp.url().includes(subUrl) && resp.status() === code),
				this.page.locator(selector).click()
			]);
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
		const value: any = await this.getPseudoElementStyles(selector, 'before', 'background-color');
		// rgb(251, 203, 196) for switcher & rgb(242, 98, 77) for checkbox
		if (value.includes('rgb(251, 203, 196)') || value.includes('rgb(242, 98, 77)')) {
			if (selector.includes('withdraw_methods')) selector += '/..';
			await this.click(selector);
		}
	}

	// admin enable switcher , if enabled then Skip : vendor dashboard disbursements
	async enableSwitcherDisbursement(selector: string): Promise<void> {
		/^(\/\/|\(\/\/)/.test(selector) ? (selector += '//span') : (selector += ' span');
		const value = await this.getElementBackgroundColor(selector);
		if (!value.includes('rgb(33, 150, 243)')) {
			await this.click(selector);
		}
	}

	// enable switch or checkbox: vendor dashboard delivery time
	async enableSwitcherDeliveryTime(selector: string): Promise<void> {
		const value = await this.hasClass(
			(selector += '//div[contains(@class,"minitoggle")]'),
			'active',
		);
		if (!value) {
			await this.click(selector);
		}
	}

	// admin Enable payment methods via Slider
	async enablePaymentMethod(selector: string): Promise<void> {
		const classValueBefore = await this.getClassValue(selector);
		if (classValueBefore.includes('woocommerce-input-toggle--disabled')) {
			await this.click(selector);
		}
		const classValueAfter = await this.getClassValue(selector);
		expect(classValueAfter).toContain('woocommerce-input-toggle--enabled');
	}

	// Check Multiple Elements with Same Selector/Class/Xpath
	async checkMultiple(selector: string): Promise<void> {
		for (const element of await this.page.locator(selector).all()) {
			const isCheckBoxChecked = await element.isChecked();
			if (!isCheckBoxChecked) {
				await element.click();
			}
		}
	}

	// delete element if exist (only first will delete) : dokan rma,report abuse
	async deleteIfExists(selector: string): Promise<void> {
		//TODO: there may be alternative solution, this method might not needed
		const elementExists = await this.isVisible(selector);
		if (elementExists) {
			const element = this.page.locator(selector);
			await element.click();
		}
	}

	async wpUploadFile(filePath: string | string[]) {
		//wp image upload
		const wpUploadFiles = '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@id="menu-item-upload"]';
		const uploadedMedia = '.attachment-preview';
		const selectFiles =	'//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@class="browser button button-hero"]';
		const select = '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]';
		const crop =
			'//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]';
		const uploadedMediaIsVisible = await this.isVisible(uploadedMedia);
		if (uploadedMediaIsVisible) {
			await this.click(wpUploadFiles);
		} else {
			await this.uploadFile(selectFiles, filePath);
			await this.click(select);
			await this.clickIfVisible(crop);
		}
	}

	// Remove Previous Uploaded media If Exists
	async removePreviouslyUploadedImage(
		previousUploadedImageSelector: string,
		removePreviousUploadedImageSelector: string,
	) {
		const previousUploadedImageIsVisible = await this.isVisible(previousUploadedImageSelector);
		if (previousUploadedImageIsVisible) {
			await this.hover(previousUploadedImageSelector);
			await this.click(removePreviousUploadedImageSelector);
			await this.wait(2);
		}
	}
}
