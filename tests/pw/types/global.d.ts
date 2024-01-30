import { ZodTypeAny } from 'zod';

declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            toMatchSchema(schema: ZodTypeAny): Promise<R>;
            toBeWithinRange(a: number, b: number): R;
            toBeSecureHeader(): R;
        }
    }
}
