import { ZodTypeAny } from 'zod';

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            toMatchSchema(schema: ZodTypeAny): R;
            toBeWithinRange(a: number, b: number): R;
            toBeSecureHeader(): R;
            toBeApproximately(a: number | undefined, b: number, c?: any): R;
        }
    }
}
