export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // [key: string]: string
            ADMIN: string;
            ADMIN_PASSWORD: string;
            VENDOR: string;
            VENDOR2: string;
            USER_PASSWORD: string;
            CUSTOMER: string;
            ADMIN_ID: string;
            VENDOR_ID: string;
            CUSTOMER_ID: string;
            PRODUCT_ID: string;
            GMAP: string;
            DOKAN_PRO: string
            BASE_URL:string;
            QUERY:string;
            HEADLESS: string;
            SLOWMO: string;
            DEVTOOLS: string;
            RETRY_TIMES: string;
            TIME_OUT: string;
            SERVER_URL: string;
            ADMIN_AUTH: string;
            VENDOR_AUTH: string;
            CUSTOMER_AUTH: string;
            nonce: string;
            DB_HOST_NAME: string;
            DB_USER_NAME: string;
            DB_USER_PASSWORD: string;
            DATABASE: string;
            DB_PORT: number;
            DB_PREFIX: string;


        }
    }
}
