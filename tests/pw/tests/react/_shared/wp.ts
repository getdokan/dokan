import { execFileSync } from 'node:child_process';
import path from 'node:path';

const PW_ROOT = path.resolve(__dirname, '../../..');

/** Run PHP inside the wp-env test site (same container locally and in CI) and return its stdout. */
export function wpEval(php: string): string {
    const out = execFileSync('npx', ['wp-env', 'run', 'tests-cli', 'wp', 'eval', php], { cwd: PW_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return out.trim().split('\n').pop() ?? '';
}

/**
 * Set one key of a legacy Dokan settings section through update_option, so the 5.2+ legacy mirror
 * and option hooks run (raw DB writes are ignored by the flat dokan_admin_settings overlay).
 * Returns the previous value, for restoring in afterAll.
 */
export function setDokanSetting(section: string, key: string, value: string): string {
    const k = JSON.stringify(key);
    return wpEval(
        `$o = get_option(${JSON.stringify(section)}, []); if (!is_array($o)) { $o = []; } $prev = $o[${k}] ?? ''; ` +
            `$o[${k}] = ${JSON.stringify(value)}; update_option(${JSON.stringify(section)}, $o); echo $prev;`,
    );
}

/** Add or remove a capability on roles, then flush the object cache so the next REST call sees it. */
export function setRoleCap(cap: string, enabled: boolean, roles = ['seller', 'administrator', 'shop_manager']): void {
    const method = enabled ? 'add_cap' : 'remove_cap';
    wpEval(`foreach (${JSON.stringify(roles)} as $r) { if ($role = get_role($r)) { $role->${method}(${JSON.stringify(cap)}); } } wp_cache_flush();`);
}
