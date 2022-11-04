import {expect, type Page} from '@playwright/test';
import {BasePage} from "./basePage";
import {data} from '../utils/testData';
import {selector} from './selectors';

export class LoginPage extends BasePage {

    constructor(page: Page) {
        super(page);
    }

    // user login
    async login(user: { username: string, password: string }): Promise<void> {
        await this.loginFronted(user)
    }

    // user loginFronted
    async loginFronted(user: { username: string, password: string }): Promise<void> {
        await this.goIfBlank(data.subUrls.frontend.myAccount)
        let currentUser = await this.getCurrentUser()
        // skip if user is already logged in
        if (user.username === currentUser) {
            return
        }
        // logout if other user is already logged in
        else if ((user.username !== currentUser) && (currentUser !== undefined)) {
            await this.logoutFrontend()
        }
        // login user
        await this.clearAndType(selector.frontend.username, user.username)
        await this.clearAndType(selector.frontend.userPassword, user.password)
        await this.click(selector.frontend.logIn)

        let loggedInUser = await this.getCurrentUser()
        expect(loggedInUser).toBe(user.username)

    }

    // user loginBackend
    async loginBackend(user: { username: string, password: string }): Promise<void> {
        await this.goIfNotThere(data.subUrls.backend.login)
        await this.loginWpDashboard(user)
    }

    async loginWpDashboard(user: { username: string, password: string }): Promise<void> {
        let emailField = await this.isVisible(selector.backend.email)
        if (emailField) {
            await this.clearAndType(selector.backend.email, user.username)
            await this.clearAndType(selector.backend.password, user.password)
            await this.click(selector.backend.login)

            let loggedInUser = await this.getCurrentUser()
            expect(loggedInUser).toBe(user.username)
        }
    }

    // user logout
    async logout(): Promise<void> {
        await this.logoutFrontend()
    }

    // user logoutFrontend
    async logoutFrontend(): Promise<void> {
        await this.goIfNotThere(data.subUrls.frontend.myAccount)
        await this.click(selector.frontend.customerLogout)

        let loggedInUser = await this.getCurrentUser()
        expect(loggedInUser).toBeUndefined()
    }

    // admin login
    async adminLogin(user: { username: string, password: string }) {
        await this.goIfNotThere(data.subUrls.backend.adminLogin)
        await this.loginWpDashboard(user)
    }

    // admin logout
    async adminLogout(): Promise<void> {
        await this.hover(selector.backend.userMenu)
        await this.click(selector.backend.logout)

        let loggedInUser = await this.getCurrentUser()
        expect(loggedInUser).toBeUndefined()
    }

    // switch user
    async switchUser(user: { username: string, password: string }): Promise<void> {
        let currentUser = await this.getCurrentUser()
        if (currentUser !== user.username) {
            await this.loginBackend(user)
        }
    }
}
