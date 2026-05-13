import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

async function globalSetup(): Promise<void> {
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
