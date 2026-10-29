import { defineConfig } from '@playwright/test';
import base from './e2e.config';
import { parseBoolean } from '@utils/helpers';
import 'dotenv/config';

const { CI } = process.env;

// Revamp suite: React UI only (tests/react). Reuses the e2e config (base URL, timeouts,
// reporters, Lite/Pro tag gating) and the auth states written by the e2e auth_setup project.
//
// Two projects:
//  - react         every test seeds and finds its own data, so it runs fully parallel.
//  - react_global  files named *.global.spec.ts flip marketplace-wide options; they run
//                  after `react`, so they never race the parallel tests.
// ponytail: global files can still run side by side with each other; pass --workers=1 once there is more than one.
export default defineConfig({
    ...base,
    testDir: 'tests/react',
    outputDir: 'playwright/react/test-artifacts/',
    workers: parseBoolean(CI) ? 2 : 4,
    retries: parseBoolean(CI) ? 1 : 0,
    projects: [
        { name: 'react', testIgnore: /\.global\.spec\.ts$/, fullyParallel: true },
        { name: 'react_global', testMatch: /\.global\.spec\.ts$/, dependencies: ['react'], fullyParallel: false },
    ],
});
