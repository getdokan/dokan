import { Page, expect } from '@playwright/test';
import mysql from 'mysql2/promise';
import { toPath } from '@utils/helpers';

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
const { DB_HOST_NAME, DB_USER_NAME, DB_USER_PASSWORD, DATABASE, DB_PORT, DB_PREFIX } = process.env;
const dbPrefix = DB_PREFIX;

// ============================================
// URLS
// ============================================
export const subUrls = {
    adminDashboard: 'wp-admin',
};

// ============================================
// TEST DATA
// ============================================
export const diagnosticNoticeData = {
    paragraph1: 'Want to help make Dokan Multivendor Marketplace even more awesome? Allow Dokan Multivendor Marketplace to collect diagnostic data and usage information. (what we collect)',
    paragraph2:
        'Server environment details (php, mysql, server, WordPress versions), Number of users in your site, Site language, Number of active and inactive plugins, Site name and URL, Your name and email address. We are using Appsero to collect your data. Learn more about how Appsero collects and handle your data.',
};

// ============================================
// SELECTORS
// ============================================
const diagnosticSelectors = {
    noticeDiv: '.updated .dokan-lite-insights-data-we-collect',
    allowCollectData: '.updated .submit .button-primary',
    disallowCollectData: '.updated .submit .button-secondary',
    paragraph1: '.updated:has(.dokan-lite-insights-data-we-collect) p:first-of-type',
    paragraph2: '.updated:has(.dokan-lite-insights-data-we-collect) p.description',
};

// ============================================
// DB UTILITIES
// ============================================
const pool = mysql.createPool({
    host: DB_HOST_NAME,
    user: DB_USER_NAME,
    password: DB_USER_PASSWORD,
    database: DATABASE,
    port: DB_PORT ? Number(DB_PORT) : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export const db = {
    async dbQuery(query: string, params?: any[]): Promise<any> {
        let connection: mysql.PoolConnection | undefined;
        try {
            connection = await pool.getConnection();
            const [result] = await connection.execute(query, params);
            return result;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        } finally {
            if (connection) connection.release();
        }
    },

    async deleteOptionRow(optionNames: string[]): Promise<any> {
        const query = `DELETE FROM ${dbPrefix}_options WHERE option_name IN (${optionNames.map(() => '?').join(',')})`;
        return await db.dbQuery(query, optionNames);
    },

    async dispose(): Promise<void> {
        await pool.end();
    },
};

// ============================================
// NOTICE AND PROMOTION PAGE
// ============================================
export class NoticeAndPromotionPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Navigation helpers

    private createUrl(subPath: string): string {
        return toPath(subPath);
    }

    private getCurrentUrl(): string {
        return this.page.url();
    }

    private isCurrentUrl(subPath: string): boolean {
        const url = new URL(this.getCurrentUrl());
        const currentURL = url.href.replace(/[/]$/, '');
        return currentURL === this.createUrl(subPath);
    }

    private async goIfNotThere(subPath: string, waitUntil: 'load' | 'domcontentloaded' | 'load' | 'commit' = 'domcontentloaded'): Promise<void> {
        if (!this.isCurrentUrl(subPath)) {
            const url = this.createUrl(subPath);
            await expect(async () => {
                await this.page.goto(url, { waitUntil });
                const currentUrl = this.getCurrentUrl();
                expect(currentUrl).toMatch(subPath);
            }).toPass();
        }
    }

    private async gotoUntilNetworkidle(subPath: string): Promise<void> {
        const url = this.createUrl(subPath);
        await this.page.goto(url, { waitUntil: 'load' });
    }

    // Assertion helpers

    private async toBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeVisible();
    }

    private async notToBeVisible(selector: string): Promise<void> {
        await expect(this.page.locator(selector)).toBeHidden();
    }

    private async toContainText(selector: string, text: string): Promise<void> {
        await expect(this.page.locator(selector)).toContainText(text);
    }

    private async clickAndWaitForLoadState(selector: string, state: 'load' | 'domcontentloaded' | 'load' = 'domcontentloaded'): Promise<void> {
        await Promise.all([
            this.page.waitForLoadState(state),
            this.page.locator(selector).click(),
        ]);
    }

    // Diagnostic notice

    async deleteOption(): Promise<void> {
        // Remove the options from the database to force the notice to show
        await db.deleteOptionRow(['dokan-lite_tracking_notice', 'dokan-lite_allow_tracking']);
    }

    async dokanDiagnosticNoticeRenderProperly(diagnosticNotice: { paragraph1: string; paragraph2: string }): Promise<void> {
        await this.deleteOption();
        await this.gotoUntilNetworkidle(subUrls.adminDashboard);
        await this.toBeVisible(diagnosticSelectors.noticeDiv);
        await this.toContainText(diagnosticSelectors.paragraph1, diagnosticNotice.paragraph1);
        await this.toContainText(diagnosticSelectors.paragraph2, diagnosticNotice.paragraph2);
    }

    async allowDiagnosticTracking(): Promise<void> {
        await this.deleteOption();
        await this.goIfNotThere(subUrls.adminDashboard, 'load');
        await this.clickAndWaitForLoadState(diagnosticSelectors.allowCollectData);
        await this.notToBeVisible(diagnosticSelectors.noticeDiv);
    }

    async disallowDiagnosticTracking(): Promise<void> {
        await this.deleteOption();
        await this.goIfNotThere(subUrls.adminDashboard, 'load');
        await this.clickAndWaitForLoadState(diagnosticSelectors.disallowCollectData);
        await this.notToBeVisible(diagnosticSelectors.noticeDiv);
    }
}
