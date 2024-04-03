export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string;
            ADMIN: string;
            ADMIN_PASSWORD: string;
            VENDOR: string;
            VENDOR2: string;
            USER_PASSWORD: string;
            CUSTOMER: string;
            ADMIN_ID: string;
            VENDOR_ID: string;
            VENDOR2_ID: string;
            CUSTOMER_ID: string;
            PRODUCT_ID: string;
            PRODUCT_ID_V2: string;
            CI: string;
            GMAP: string;
            MAPBOX: string;
            LICENSE_KEY: string;
            DOKAN_PRO: string;
            SITE_PATH: string;
            BASE_URL: string;
            QUERY: string;
            HEADLESS: string;
            SLOWMO: string;
            DEVTOOLS: string;
            RETRY_TIMES: string;
            TIME_OUT: string;
            NO_SETUP: string;
            SERVER_URL: string;
            ADMIN_AUTH: string;
            VENDOR_AUTH: string;
            CUSTOMER_AUTH: string;
            DB_HOST_NAME: string;
            DB_USER_NAME: string;
            DB_USER_PASSWORD: string;
            DATABASE: string;
            DB_PORT: number;
            DB_PREFIX: string;
            API_TEST_RESULT: string;
            E2E_TEST_RESULT: string;
            API_COVERAGE: string;
        }
    }
}
