import { ZodTypeAny } from 'zod';

export const customMatchers = {
    toMatchSchema(responseBody: object, schema: ZodTypeAny) {
        const result = schema.safeParse(responseBody);
        if (result.success) {
            return {
                message: () => 'schema matched',
                pass: true,
            };
        } else {
            return {
                message: () => '\x1b[91m ' + ' Result does not match schema: ' + result.error.issues.map(issue => issue.message).join('\n') + '\n' + 'Details: ' + JSON.stringify(result.error, null, 2) + '\x1b[0m',
                pass: false,
            };
        }
    },

    toBeSecureHeader(headers: any) {
        // todo: update this method
        let pass;
        pass = headers['content-type'] === 'application/json; charset=UTF-8';
        pass = headers['x-content-type-options'] === 'nosniff';
        pass = headers['access-control-expose-headers'] === 'X-WP-Total, X-WP-TotalPages, Link';
        pass = headers['access-control-allow-headers'] === 'Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type';
        pass = headers['allow'] === 'GET, POST,';
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
};

export const customExpect = {
    toMatchSchema: customMatchers.toMatchSchema,
    // toBeSecureHeader: customMatchers.toBeSecureHeader,
    toBeWithinRange: customMatchers.toBeWithinRange,
};

//todo: add more custom matchers
