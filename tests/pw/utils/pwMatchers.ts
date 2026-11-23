import { ZodTypeAny } from 'zod';
import { helpers } from '@utils/helpers';

export const customMatchers = {
    toMatchSchema(responseBody: object, schema: ZodTypeAny) {
        const result = schema.safeParse(responseBody);
        if (result.success) {
            return {
                message: () => 'schema matched',
                pass: true,
            };
        } else {
            console.log('responseBody:', responseBody);
            return {
                message: () => '\x1b[91m ' + ' Result does not match schema: ' + result.error.issues.map(issue => issue.message).join('\n') + '\n' + 'Details: ' + JSON.stringify(result.error, null, 2) + '\x1b[0m',
                pass: false,
            };
        }
    },

    toBeSecureHeader(headers: any) {
        const checks: { name: string; ok: boolean }[] = [
            { name: 'content-type', ok: headers['content-type'] === 'application/json; charset=UTF-8' },
            { name: 'x-content-type-options', ok: headers['x-content-type-options'] === 'nosniff' },
            { name: 'access-control-expose-headers', ok: headers['access-control-expose-headers'] === 'X-WP-Total, X-WP-TotalPages, Link' },
            { name: 'access-control-allow-headers', ok: headers['access-control-allow-headers'] === 'Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type' },
            { name: 'allow', ok: headers['allow'] === 'GET, POST,' },
        ];
        const failed = checks.filter(c => !c.ok).map(c => c.name);
        const pass = failed.length === 0;
        return {
            message: () => (pass ? 'passed' : `failed: ${failed.join(', ')}`),
            pass,
        };
    },

    toBeWithinRange(received: number, floor: number, ceiling: number) {
        const pass = received >= floor && received <= ceiling;
        if (pass) {
            return {
                message: () => 'passed',
                pass: true,
            };
        } else {
            return {
                message: () => 'failed',
                pass: false,
            };
        }
    },

    toBeApproximately(received: number, expected: number, tolerance: number = 0, log?: any) {
        const yellow = '\x1b[33m';
        const red = '\x1b[91m';
        const reset = '\x1b[0m';

        const diff = helpers.roundToTwo(Math.abs(received - expected));
        const pass = diff <= tolerance;
        const warning = diff > 0;
        if (pass) {
            if (warning) {
                if (Array.isArray(log) && log.length > 0 && typeof log[0] === 'object') {
                    console.table(log);
                }
                console.log(`${yellow}Test failed deep equality checked: expected ${expected} and received ${received}${reset}`);
            }
            return {
                message: () => 'passed',
                pass: true,
            };
        } else {
            if (Array.isArray(log) && log.length > 0 && typeof log[0] === 'object') {
                console.table(log);
            }
            return {
                message: () => '\x1b[91m' + `Difference between expected ${yellow}${expected}${red} and received ${yellow}${received}${red} value is more than the tolerance of  ${yellow}${tolerance}` + '\x1b[0m',
                pass: false,
            };
        }
    },
};

export const customExpect = {
    toMatchSchema: customMatchers.toMatchSchema,
    toBeSecureHeader: customMatchers.toBeSecureHeader,
    toBeWithinRange: customMatchers.toBeWithinRange,
    toBeApproximately: customMatchers.toBeApproximately,
};

// todo: add base-page assertions to custom matchers
