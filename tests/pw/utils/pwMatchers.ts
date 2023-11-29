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
    toBeWithinRange: customMatchers.toBeWithinRange,
};

//todo: add more custom matchers
