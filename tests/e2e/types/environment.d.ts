export { };

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // [key: string]: string 
            ADMIN: string;
            ADMIN_PASSWORD: string;
            VENDOR: string;
            VENDOR_PASSWORD: string;
            CUSTOMER: string;
            CUSTOMER_PASSWORD: string;
            GOOGLE_MAP_API_KEY: string;
            BASE_URL:string
            HEADLESS: string;
            SLOWMO: string;
            DEVTOOLS: string;
            RETRY_TIMES: string;
            TIME_OUT: string;
            SERVER_URL: string
            ADMIN_AUTH: any;
            VENDOR_AUTH: any;
            CUSTOMER_AUTH: any;
            nonce: string;


        }
    }
}
