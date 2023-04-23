import { expect, type Page } from '@playwright/test';
import { BasePage } from './basePage';
import { ApiUtils } from '../utils/apiUtils';
import { data, user } from '../utils/testData';
import { selector } from './selectors';
import { helpers } from '../utils/helpers';


export class LoginPage extends BasePage {
	constructor(page: Page) {
		super(page);
	}

	// user login
	async login(user: user,storageState?: string): Promise<void> {
		await this.loginFronted(user);
	}

	// user loginFronted
	async loginFronted(user: user, storageState?: string ): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.myAccount);
		const currentUser = await this.getCurrentUser();
		// skip if user is already logged in
		if (user.username === currentUser) {
			return;
		}
		// logout if other user is already logged in
		else if ( ( user.username !== currentUser ) && ( currentUser !== undefined ) ) { // TODO : got undefined for using storage.json 
		// else if ((user.username !== currentUser) || (currentUser === undefined)) {
			await this.logoutFrontend();
		}
		// login user
		await this.clearAndFill(selector.frontend.username, user.username);
		await this.clearAndFill(selector.frontend.userPassword, user.password);
		await this.clickAndWaitForResponse(data.subUrls.frontend.myAccount, selector.frontend.logIn, 302);
		if (storageState){
			await this.page.context().storageState({ path: storageState });
			}
		const loggedInUser = await this.getCurrentUser();
		expect(loggedInUser).toBe(user.username);
	}

	// user loginBackend
	async loginBackend(user: user, url: string = data.subUrls.backend.login, storageState?: string): Promise<void> {
		await this.goIfNotThere(url);
		const emailField = await this.isVisible(selector.backend.email);
		if (emailField) {
			await this.clearAndFill(selector.backend.email, user.username);
			await this.clearAndFill(selector.backend.password, user.password);
			await this.clickAndWaitForResponse(data.subUrls.backend.login, selector.backend.login, 302);
			// await this.waitForUrl(data.subUrls.backend.adminDashboard);
			await this.waitForNavigation();
			if (storageState){
			await this.page.context().storageState({ path: storageState });
			}
			const loggedInUser = await this.getCurrentUser();
			expect(loggedInUser).toBe(user.username);
		}
	}

	// user logout
	async logout(): Promise<void> {
		await this.logoutFrontend();
	}

	// user logoutFrontend
	async logoutFrontend(): Promise<void> {
		await this.goIfNotThere(data.subUrls.frontend.myAccount);
		// await this.clickAndWaitForResponse(data.subUrls.frontend.myAccount, selector.frontend.customerLogout, 200);
		await this.clickAndWaitForNavigation(selector.frontend.customerLogout);
		const loggedInUser = await this.getCurrentUser();
		expect(loggedInUser).toBeUndefined();
	}

	// admin login
	async adminLogin(user: user, storageState?: string) {
		await this.loginBackend(user, data.subUrls.backend.adminLogin, storageState);
	}

	// admin logout
	async logoutBackend(): Promise<void> {
		await this.hover(selector.backend.userMenu);
		await this.clickAndWaitForResponse(data.subUrls.backend.adminLogout, selector.backend.logout, 302);
		const loggedInUser = await this.getCurrentUser();
		expect(loggedInUser).toBeUndefined();
	}

	// switch user
	async switchUser(user: user): Promise<void> {
		const currentUser = await this.getCurrentUser();
		if (currentUser !== user.username) {
			await this.loginBackend(user);
		}
	}
}
