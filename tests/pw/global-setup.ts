
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

const ENV_PATH = join(__dirname, '.env');

// Values shipped in .env.example that we should treat as unset.
const PLACEHOLDERS: Record<string, string> = {
    LICENSE_KEY: 'your_dokan_pro_license_key',
    GMAP: 'your_google_maps_api_key',
    USER_PASSWORD: 'your_test_password',
};

type EnvPrompt = {
    key: string;
    label: string;
    defaultValue?: string;
};

const ENV_PROMPTS: EnvPrompt[] = [
    { key: 'LICENSE_KEY', label: 'Dokan Pro license key' },
    { key: 'GMAP', label: 'Google Maps API key' },
    { key: 'ADMIN_PASSWORD', label: 'WordPress admin password', defaultValue: 'password' },
    { key: 'USER_PASSWORD', label: 'Test user password', defaultValue: 'password' },
];

function isMissing(key: string): boolean {
    const value = process.env[key];
    if (!value) return true;
    return value === PLACEHOLDERS[key];
}

function askQuestion(rl: readline.Interface, query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

function persistEnvVar(key: string, value: string): void {
    if (!existsSync(ENV_PATH)) return;
    const content = readFileSync(ENV_PATH, 'utf8');
    const lineRegex = new RegExp(`^${key}=.*$`, 'm');
    const updated = lineRegex.test(content)
        ? content.replace(lineRegex, `${key}=${value}`)
        : content + (content.endsWith('\n') ? '' : '\n') + `${key}=${value}\n`;
    writeFileSync(ENV_PATH, updated);
}

async function promptForMissingEnvVars(): Promise<void> {
    // Skip prompts in CI and when stdin can't accept interactive input.
    if (String(process.env.CI).toLowerCase() === 'true') return;
    if (!process.stdin.isTTY) return;

    const missing = ENV_PROMPTS.filter(p => isMissing(p.key));
    if (missing.length === 0) return;

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
        console.log('[global-setup] CI=false; collecting missing env values (Enter accepts default/skip):');
        for (const { key, label, defaultValue } of missing) {
            const suffix = defaultValue ? ` [default: ${defaultValue}]` : ' [Enter to skip]';
            const answer = (await askQuestion(rl, `  ${key} — ${label}${suffix}: `)).trim();
            const value = answer || defaultValue || '';
            if (value) {
                process.env[key] = value;
                persistEnvVar(key, value);
            }
        }
    } finally {
        rl.close();
    }
}

async function globalSetup(): Promise<void> {
    await promptForMissingEnvVars();

    // Reset wp-data/debug.log so the surfaced log reflects only the current run.
    // The file is bind-mounted into the wp-env container at
    // /var/www/html/wp-data/debug.log via the "wp-data": "./wp-data" mapping.
    const logDir = join(__dirname, 'wp-data');
    const logPath = join(logDir, 'debug.log');
    try {
        mkdirSync(logDir, { recursive: true });
        writeFileSync(logPath, '');
        console.log(`[global-setup] reset ${logPath}`);
    } catch (err) {
        console.warn(`[global-setup] could not reset ${logPath}: ${(err as Error).message}`);
    }
}

export default globalSetup;
