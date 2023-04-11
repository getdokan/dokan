import { expect, type Page } from '@playwright/test';
import { BasePage } from './basePage';
import { ApiUtils } from '../utils/apiUtils';
import { data, user } from '../utils/testData';
import { selector } from './selectors';
import { helpers } from '../utils/helpers';


export class LoginPage extends BasePage {
	constructor( page: Page ) {
		super( page );
	}

	// user login
	async login( user: user ): Promise<void> {
		await this.loginFronted( user );
	}

	// user loginFronted
	async loginFronted( user: user ): Promise<void> {
		await this.goIfBlank( data.subUrls.frontend.myAccount );
		const currentUser = await this.getCurrentUser();
		console.log(currentUser);
		
		// skip if user is already logged in
		if ( user.username === currentUser ) {
			return;
		}
		// logout if other user is already logged in
		// else if ( ( user.username !== currentUser ) && ( currentUser !== undefined ) ) { // TODO : got undefined for using storaage.json 
		else if ( ( user.username !== currentUser ) || ( currentUser === undefined ) ) {
			console.log('logout');
			await this.logoutFrontend();
		}
		// login user
		await this.clearAndFill( selector.frontend.username, user.username );
		await this.clearAndFill( selector.frontend.userPassword, user.password );
		await this.click( selector.frontend.logIn );

		const loggedInUser = await this.getCurrentUser();
		expect( loggedInUser ).toBe( user.username );
	}

	// user loginBackend
	async loginBackend( user: user ): Promise<void> {
		await this.goIfNotThere( data.subUrls.backend.login );
		await this.loginWpDashboard( user );
	}

	async loginWpDashboard( user: user ): Promise<void> {
		const emailField = await this.isVisible( selector.backend.email );
		if ( emailField ) {
			await this.clearAndFill( selector.backend.email, user.username );
			await this.clearAndFill( selector.backend.password, user.password );
			await this.click( selector.backend.login );

			const loggedInUser = await this.getCurrentUser();
			expect( loggedInUser ).toBe( user.username );
		}
	}

	// user logout
	async logout(): Promise<void> {
		await this.logoutFrontend();
	}

	// user logoutFrontend
	async logoutFrontend(): Promise<void> {
		await this.goIfNotThere( data.subUrls.frontend.myAccount );
		await this.focus( selector.frontend.customerLogout );
		await this.click( selector.frontend.customerLogout );

		const loggedInUser = await this.getCurrentUser();
		expect( loggedInUser ).toBeUndefined();
	}

	// admin login
	async adminLogin( user: user ) {
		await this.goIfNotThere( data.subUrls.backend.adminLogin );
		await this.loginWpDashboard( user );
	}

	// admin logout
	async adminLogout(): Promise<void> {
		await this.hover( selector.backend.userMenu );
		await this.click( selector.backend.logout );

		const loggedInUser = await this.getCurrentUser();
		expect( loggedInUser ).toBeUndefined();
	}

	// switch user
	async switchUser( user: user ): Promise<void> {
		const currentUser = await this.getCurrentUser();
		if ( currentUser !== user.username ) {
			await this.loginBackend( user );
		}
	}
}
