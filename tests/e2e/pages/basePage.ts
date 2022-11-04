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
    type ElementHandle
} from '@playwright/test'
import {selector} from './selectors'
require('dotenv').config();

// This Page Contains All Necessary Playwright Automation Methods

export class BasePage {
    readonly page: Page

    constructor(page: Page) {
        this.page = page
    }

    /**
     * Page navigation methods
     */

    // wait for navigation to complete
    async waitForNavigation(): Promise<void> {
        await this.page.waitForNavigation()
    }

    // wait for request
    async waitForRequest(url: string): Promise<Request> {
        return await this.page.waitForRequest(url)
    }

    // wait for Response
    async waitForResponse(url: string): Promise<Response> {
        return await this.page.waitForResponse(url)
    }

    // wait for load state
    async waitForLoadState(): Promise<void> {
        return await this.page.waitForLoadState()
    }

    // wait for url to be loaded
    async waitForUrl(url: string): Promise<void> {
        await this.page.waitForURL(url)
    }

    // goto subUrl
    async goto(subPath: string) {
        // let subPath1: string = await this.createUrl(subPath)
        await this.page.goto(subPath)
    }

    // go forward
    async goForward() {
        await this.page.goForward()
    }

    // go back
    async goBack() {
        await this.page.goBack()
    }

    // reload page
    async reload() {
        await this.page.reload()
    }

    //  returns whether the current URL is expected
    async isCurrentUrl(subPath: string): Promise<boolean> {
        let currentURL = new URL(await this.getCurrentUrl())
        return currentURL.href === await this.createUrl(subPath)
    }

    // Create a New URL
    async createUrl(subPath) {
        // let url = new URL(process.env.BASE_URL)
        // url.pathname = url.pathname + subPath + '/'
        // return url.href
        return process.env.BASE_URL + '/' + subPath + '/'
    }

    // goto subPath if not already there
    async goIfNotThere(subPath: string) {

        if (!await this.isCurrentUrl(subPath)) {
            let url = await this.createUrl(subPath)
            await this.page.goto(url)

            let currentUrl = await this.getCurrentUrl()
            expect(currentUrl).toMatch(subPath)
        }
    }

    // goto subPath if about:blank is loaded
    async goIfBlank(subPath: string) {
        let blankPage = await this.page.evaluate(() => window.location.href === 'about:blank')
        if (blankPage) {
            await this.goto(subPath)
        }
    }

    /**
     * current page methods
     */

    // get base url
    async getBaseUrl(): Promise<string> {
        let url = await this.getCurrentUrl()
        return new URL(url).origin
    }

    // get current page url
    async getCurrentUrl(): Promise<string> {
        return await this.page.url()
    }

    // get current page title
    async getPageTitle(): Promise<string> {
        return await this.page.title()
    }

    // get full HTML contents of the current page
    async getFullHtml(): Promise<string> {
        return await this.page.content()
    }

    // get the browser context that the page belongs to.
    async getPageContext(): Promise<BrowserContext> {
        return await this.page.context()
    }

    // assign html markup to the current page
    async setContent(html: string): Promise<void> {
        await this.page.setContent(html)
    }

    //Brings page to front (activates tab)
    async bringToFront(): Promise<void> {
        await this.page.bringToFront()
    }

    /**
     * click methods
     */

    // click on element
    async click(selector: string): Promise<void> {
        await this.page.click(selector)
    }

    // double click on element
    async doubleClick(selector: string): Promise<void> {
        await this.page.dblclick(selector)
    }

    // click & wait for navigation to complete
    async clickAndWaitForNavigation(selector: string): Promise<void> {
        await Promise.all([this.page.waitForNavigation(), this.page.click(selector)])
    }

    // click & wait for request
    async clickAndWaitForRequest(url: string, selector: string): Promise<void> {
        await Promise.all([this.page.waitForRequest(url), this.page.click(selector)])
    }

    // click & wait for response
    async clickAndWaitForResponse(url: string, selector: string): Promise<Response> {
        const [response] = await Promise.all([this.page.waitForResponse(url), this.page.click(selector)])
        // console.log(await response.json())
        return response
    }

    // click & wait for load state
    async clickAndWaitForLoadState(url: string, selector: string): Promise<void> {
        await Promise.all([this.page.waitForLoadState(), this.page.click(selector)])
    }

    // click if visible
    async clickIfVisible(selector) {
        let IsVisible = await this.isVisible(selector)
        if (IsVisible) {
            await this.click(selector)
        }
    }

    /**
     * Keyboard methods
     */

    // press key
    async press(key: string) {
        await this.page.keyboard.press(key)
    }

    // press on selector [Focuses the element, and then uses keyboard press]
    async pressOnSelector(selector: string, key: string) {
        await this.page.press(selector, key)
    }

    /**
     * selector methods
     */

    // wait for selector
    async waitForSelector(selector: string): Promise<void> {
        await this.page.waitForSelector(selector)
    }

    // locator //TODO: need to update this
    async getLocator(selector: string): Promise<object> {
        return await this.page.locator(selector)
    }

    // returns whether the element is visible
    async isVisible(selector: string): Promise<boolean> {
        return await this.page.isVisible(selector)
    }

    // returns whether the element is hidden
    async isHidden(selector: string): Promise<boolean> {
        return await this.page.isHidden(selector)
    }

    // returns whether the element is enabled
    async isEnabled(selector: string): Promise<boolean> {
        return await this.page.isEnabled(selector)
    }

    // returns whether the element is editable
    async isEditable(selector: string): Promise<boolean> {
        return await this.page.isEditable(selector)
    }

    // returns whether the element is disabled
    async isDisabled(selector: string): Promise<boolean> {
        return await this.page.isDisabled(selector)
    }

    // returns whether the element is checked
    async isChecked(selector: string): Promise<boolean> {
        return await this.page.isChecked(selector)
    }

    // focus on selector
    async focus(selector: string): Promise<void> {
        await this.page.focus(selector)
    }

    // hover on selector
    async hover(selector: string): Promise<void> {
        await this.page.hover(selector)
    }

    // drag and drop
    async dragAndDrop(source: string, target: string): Promise<void> {
        await this.page.dragAndDrop(source, target)
    }

    // get element
    async getElement(selector: string): Promise<Locator> {
        return await this.page.locator(selector)
    }

    // get element text content
    async getElementText(selector: string): Promise<string | null> {
        return await this.page.textContent(selector)
    }

    // get element inner text
    async getElementInnerText(selector: string): Promise<string> {
        return await this.page.innerText(selector)
    }

    // get element inner html
    async getElementInnerHtml(selector: string): Promise<string> {
        return await this.page.innerHTML(selector)
    }

    //get element value [input, textarea, select]
    async getElementValue(selector: string): Promise<string> {
        return await this.page.inputValue(selector)
    }

    //get attribute value
    async getAttributeValue(selector: string, attribute: string): Promise<string | null> {
        return await this.page.getAttribute(selector, attribute)
    }

 

    //get class attribute value
    async getClassValue(selector: string): Promise<string | null> {
        return await this.page.getAttribute(selector, 'className')   //TODO: maybe class
    }

    // set attribute value
    async setAttributeValue(selector: string, attribute: string, value: string): Promise<void> {  //TODO: update with playwright method
        // await page.$eval(selector, (element, attribute, value) => element.setAttribute(attribute, value), attribute, value)
        let element = await this.page.locator(selector)
        // await this.page.evaluate((element, attribute, value) => element.setAttribute(attribute, value), element, attribute, value)
        await element.evaluate(element => element.setAttribute(attribute, value))
    }

    // remove element attribute
    async removeAttribute(selector: string, attribute: string): Promise<void> {    //TODO: update with playwright method
        // let element = await this.getElement(selector)
        // await this.page.evaluate((element, attribute) => element.removeAttribute(attribute), element, attribute)
        let element = await this.page.locator(selector)
        await element.evaluate(element => element.removeAttribute(attribute))
    }


    /**
     * timeout methods
     */

    // change default maximum time(seconds) for all the methods
    async setDefaultNavigationTimeout(timeout: number): Promise<void> {
        await this.page.setDefaultTimeout(timeout * 1000)
    }

    // change default maximum navigation time(seconds) for all navigation methods [goto, goBack, goForward, ...]
    async setDefaultTimeout(timeout: number): Promise<void> {
        await this.page.setDefaultTimeout(timeout * 1000)
    }

    // waits for the given timeout in seconds
    async wait(seconds: number): Promise<void> {
        await this.page.waitForTimeout(seconds * 1000)
    }

    /**
     * Input field methods
     */

    // clear input fields
    async clearInputField(selector: string): Promise<void> {
    }

    // clear input field and type
    async clearAndType(selector: string, text: string): Promise<void> {
        await this.page.fill(selector, text)
    }

    // type in input fields
    async type(selector: string, text: string) {
        await this.page.type(selector, text)
    }

    // fill in input fields
    async fill(selector: string, text: string) {
        await this.page.fill(selector, text)
    }

    // check/uncheck input fields [checkbox/radio] based on choice
    async checkUncheck(selector: string, checked: boolean): Promise<void> {
        await this.page.setChecked(selector, checked)
    }

    // check input fields [checkbox/radio]
    async check1(selector: string,): Promise<void> {
        await this.page.check(selector)
    }

    // check input fields [checkbox/radio]
    async check(selector: string,): Promise<void> {
        await this.page.setChecked(selector, true)
    }

    // uncheck input fields [checkbox/radio]
    async uncheck(selector: string): Promise<void> {
        await this.page.uncheck(selector)
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

    async selectbyValue(selector: string, value: string): Promise<string[]> {
        return await this.page.selectOption(selector, {value: value})
        }

        async selectbylabel(selector: string,  value: string): Promise<string[]> {
            return await this.page.selectOption(selector, {label: value})
            }

            async selectbynumber(selector: string,  value: number): Promise<string[]> {
                return await this.page.selectOption(selector, {index: value})
                }



    /**
     * Files & Media methods
     */

    // upload file
    async uploadFile(selector: string, file: string): Promise<void> {
        await this.page.setInputFiles(selector, file)
    }

    // take screenshots
    async screenshot(): Promise<void> {
        await this.page.screenshot()
    }

    // generate a pdf of the page
    async pdf(): Promise<void> {
        await this.page.pdf()
    }

    /**
     * Frame [iframe] methods
     */

    //  get all frames attached to the page
    async getAllFrames(): Promise<Frame[]> {
        return await this.page.frames()
    }

    // get frame
    async getFrame(frame: string): Promise<Frame | null> {
        return await this.page.frame(frame)
    }

    // get frame
    async getFrameSelector(frame: string, frameSelector: string): Promise<FrameLocator> {
        return this.page.frameLocator(frame).locator(frameSelector)
    }

    // click frame locator
    async clickFrameSelector(frame: string, frameSelector: string): Promise<void> {
        const locator = this.page.frameLocator(frame).locator(frameSelector)
        await locator.click()
    }

    // get frame
    async typeFrameSelector(frame: string, frameSelector: string, text: string): Promise<void> {
        const locator = this.page.frameLocator(frame).locator(frameSelector)
        await locator.fill(text)
    }


    /**
     * Locator methods [using playwright locator class]
     */

    // get locator all inner texts
    async allInnerTextLocator(selector: string): Promise<string[]> {
        let locator = await this.page.locator(selector)
        return await locator.allInnerTexts()
    }

    // get locator all text contents
    async allTextContentsLocator(selector: string): Promise<string[]> {
        let locator = await this.page.locator(selector)
        return await locator.allTextContents()
    }

    // get locator boundingBox
    async boundingBoxLocator(selector: string): Promise<null | object> {
        let locator = await this.page.locator(selector)
        return await locator.boundingBox()
    }

    // check locator
    async checkLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.check()
    }

    // click locator
    async clickLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.click()
    }

    // get locator count
    async countLocator(selector: string): Promise<number> {
        let locator = await this.page.locator(selector)
        return await locator.count()
    }

    // double click element
    async dblclickLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.dblclick()
    }

    // dispatches event('click', 'dragstart',...) on the element
    async locator(selector: string, event: string): Promise<void> {
        let locator = await this.page.locator(selector)
        locator.dispatchEvent(event)
    }

    // drag locator to target locator
    async dragToTargetLocator(sourceSelector: string, targetSelector: string): Promise<void> {
        let sourceLocator = await this.page.locator(sourceSelector)
        let targetLocator = await this.page.locator(targetSelector)
        await sourceLocator.dragTo(targetLocator)
    }

    // resolves given locator to the first matching DOM element
    // async elementHandle(selector: string): Promise<ElementHandle> {
    //     let locator = await this.page.locator(selector)
    //     return await locator.elementHandle()
    // }

    // resolves given locator to all matching DOM elements
    async elementHandles(selector: string): Promise<ElementHandle[]> {
        let locator = await this.page.locator(selector)
        return await locator.elementHandles()
    }

    // returns the return value of pageFunction
    async evaluate(selector: string, pageFunction: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.evaluate(pageFunction)
    }

    // returns the result of pageFunction invocation
    async evaluateAll(selector: string, pageFunction: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.evaluateAll(pageFunction)
    }

    // returns the return value of pageFunction as a JSHandle
    async evaluateHandle(selector: string, pageFunction: Function | string): Promise<JSHandle> {
        let locator = await this.page.locator(selector)
        return await locator.evaluateHandle(pageFunction)
    }

    // fill input locator
    async fillLocator(selector: string, text: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.fill(text)
    }

    // filter locator through inner locator or text
    async filterLocator(selector: string, filterOptions: object): Promise<Locator> {
        let locator = await this.page.locator(selector)
        return await locator.filter(filterOptions)
    }

    // get first matching locator
    async firstLocator(selector: string): Promise<Locator> {
        let locator = await this.page.locator(selector)
        return await locator.first()
    }

    // focus locator
    async focusOnLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.focus()
    }

    // get frame locator
    async frameLocator(selector: string): Promise<FrameLocator> {
        let locator = await this.page.locator(selector)
        return await locator.frameLocator(selector)
    }

    // get locator attribute value
    async getAttributeOfLocator(selector: string, attribute: string): Promise<null | string> {
        let locator = await this.page.locator(selector)
        return locator.getAttribute(attribute)
    }

    // highlight locator
    async highlightLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.highlight()
    }

    // hover on locator
    async hoverOnLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.hover()
    }

    // get locator inner html
    async innerHTMLOfLocator(selector: string): Promise<string> {
        let locator = await this.page.locator(selector)
        return await locator.innerHTML()
    }

    // get locator inner text
    async innerTextOfLocator(selector: string): Promise<string> {
        let locator = await this.page.locator(selector)
        return await locator.innerText()
    }

    // get locator input value
    async inputValueOfLocator(selector: string): Promise<string> {
        let locator = await this.page.locator(selector)
        return await locator.inputValue()
    }

    // returns whether the locator is checked
    async isCheckedLocator(selector: string): Promise<boolean> {
        let locator = await this.page.locator(selector)
        return await locator.isChecked()
    }

    // returns whether the locator is disabled
    async isDisabledLocator(selector: string): Promise<boolean> {
        let locator = await this.page.locator(selector)
        return await locator.isDisabled()
    }

    // returns whether the locator is editable
    async isEditableLocator(selector: string): Promise<boolean> {
        let locator = await this.page.locator(selector)
        return await locator.isEditable()
    }

    // returns whether the locator is enabled
    async isEnabledLocator(selector: string): Promise<boolean> {
        let locator = await this.page.locator(selector)
        return await locator.isEnabled()
    }

    // returns whether the locator is hidden
    async isHiddenLocator(selector: string): Promise<boolean> {
        let locator = await this.page.locator(selector)
        return await locator.isHidden()
    }

    //  returns whether the locator is visible
    async isVisibleLocator(selector: string): Promise<boolean> {
        let locator = await this.page.locator(selector)
        return await locator.isVisible()
    }

    // get last matching locator
    async lastLocator(selector: string): Promise<Locator> {
        let locator = await this.page.locator(selector)
        return await locator.last()
    }

    // get child locator
    async locatorOfLocator(parentSelector: string, childSelector: string): Promise<Locator> {
        let locator = await this.page.locator(parentSelector)
        return await locator.locator(childSelector)
    }

    // get n-th matching locator
    async nthLocator(selector: string, index: number): Promise<Locator> {
        let locator = await this.page.locator(selector)
        return await locator.nth(index)
    }

    // get the page locator belongs to
    async pageOfLocator(selector: string): Promise<Page> {
        let locator = await this.page.locator(selector)
        return await locator.page()
    }

    // key press on locator
    async keyPressOnLocator(selector: string, key: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.press(key)
    }

    // take locator screenshot
    async screenshotOfLocator(selector: string): Promise<Buffer> {
        let locator = await this.page.locator(selector)
        return await locator.screenshot()
    }

    // scroll locator into view if needed
    async scrollIntoViewLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.scrollIntoViewIfNeeded()
    }

    // select from select option through value, option, index
    async selectOptionOfLocator(selector: string, values: string): Promise<string[]> {
        let locator = await this.page.locator(selector)
        return await locator.selectOption(values)
    }

    // select all locator's text content
    async selectTextOfLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.selectText()
    }

    // check/uncheck locator
    async setCheckedLocator(selector: string, checked: boolean): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.setChecked(checked)
    }

    //  upload file
    async setInputFilesLocator(selector: string, file: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.setInputFiles(file)
    }

    // tap on locator
    async tapOnLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.tap()
    }

    // get locator text content
    async textContentOfLocator(selector: string): Promise<null | string> {
        let locator = await this.page.locator(selector)
        return await locator.textContent()
    }

    // type on inout locator
    async typeOnLocator(selector: string, text: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.type(text)
    }

    // uncheck locator
    async uncheckLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.uncheck()
    }

    // wait for locator
    async waitForLocator(selector: string): Promise<void> {
        let locator = await this.page.locator(selector)
        await locator.waitFor()
    }


    /**
     * Dialog methods
     */

    // accept alert
    async acceptAlert(): Promise<void> {
        this.page.on('dialog', async dialog => {
            await dialog.accept()
        })
    }

    // dismiss alert
    async dismissAlert(): Promise<void> {
        this.page.on('dialog', async dialog => {
            await dialog.dismiss()
        })
    }

    // // get default prompt value. Otherwise, returns empty string.
    // async getDefaultPromptValue(): Promise<string> {
    //     let value: string
    //     this.page.on('dialog', async dialog => {
    //         value = await dialog.defaultValue()
    //     })
    //     return value
    // }

    // // get dialog's type [alert, beforeunload, confirm or prompt]
    // async getDialogType(): Promise<string> {
    //     let type: string
    //     this.page.on('dialog', async dialog => {
    //         type = await dialog.type()
    //     })
    //     return type
    // }

    // // get dialog's message
    // async getDialogMessage(): Promise<string> {
    //     let message: string
    //     this.page.on('dialog', async (dialog) => {
    //         message = await dialog.message()
    //     })
    //     return message
    // }

    /**
     * Cookies methods
     */

    // get cookies
    async getCookie(name: string): Promise<Cookie[]> {
        return await this.page.context().cookies()
    }

    // get wp current user
    async getCurrentUser() {
        const cookies = await this.page.context().cookies()
        const cookie = cookies.find(c => {
            let _c$name
            return !!(c !== null && c !== void 0 && (_c$name = c.name) !== null && _c$name !== void 0 && _c$name.startsWith('wordpress_logged_in_'))
        })
        if (!(cookie !== null && cookie !== void 0 && cookie.value)) {
            return
        }
        return decodeURIComponent(cookie.value).split('|')[0]
    }

    /**
     * Debug methods
     */

    // pauses script execution
    async pause(): Promise<void> {
        await this.page.pause()
    }

}
