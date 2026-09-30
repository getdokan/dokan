/**
 * Tiny zero-dependency terminal logger for the setup/teardown flows.
 *
 * Goal: a calm, consistent, "designed" look instead of raw `console.log`
 * dumps — aligned status glyphs, a muted palette, and dimmed secondary
 * detail so the important words stay readable in a busy CI log.
 *
 * Colors auto-disable when `NO_COLOR` is set or output is not a TTY,
 * and force-enable with `FORCE_COLOR` (Playwright/CI capture pipes).
 */

const COLOR_ENABLED = !process.env.NO_COLOR && (!!process.env.FORCE_COLOR || !!process.env.CI || process.stdout.isTTY);

const wrap = (open: number, close: number) => (s: string) => (COLOR_ENABLED ? `\x1b[${open}m${s}\x1b[${close}m` : s);

const c = {
    bold: wrap(1, 22),
    dim: wrap(2, 22),
    italic: wrap(3, 23),
    gray: wrap(90, 39),
    red: wrap(31, 39),
    green: wrap(32, 39),
    yellow: wrap(33, 39),
    blue: wrap(34, 39),
    magenta: wrap(35, 39),
    cyan: wrap(36, 39),
};

const GUTTER = '  '; // 2-space left margin so lines breathe

// indent every line of a (possibly multi-line) detail block under the message
const indentDetail = (detail: string) =>
    detail
        .split('\n')
        .map(l => `${GUTTER}    ${c.dim(l)}`)
        .join('\n');

const emit = (glyph: string, message: string, detail?: string) => {
    console.log(`${GUTTER}${glyph}  ${message}`);
    if (detail?.trim()) console.log(indentDetail(detail.trim()));
};

export const log = {
    /** Section banner — opens a logical group of steps. */
    section(title: string, subtitle?: string) {
        const label = c.bold(title.toUpperCase());
        const sub = subtitle ? c.dim(` · ${subtitle}`) : '';
        console.log('');
        console.log(`${GUTTER}${c.magenta('▌')} ${label}${sub}`);
        console.log(`${GUTTER}${c.gray('─'.repeat(Math.min(52, title.length + (subtitle?.length ?? 0) + 8)))}`);
    },

    /** A step succeeded. */
    success(message: string, detail?: string) {
        emit(c.green('✓'), message, detail);
    },

    /** Non-fatal: something was skipped/unavailable but the flow continues. */
    skip(message: string, detail?: string) {
        emit(c.gray('↪'), c.gray(message), detail);
    },

    /** A warning the reader should notice but that isn't fatal. */
    warn(message: string, detail?: string) {
        emit(c.yellow('⚠'), c.yellow(message), detail);
    },

    /** A hard failure. */
    fail(message: string, detail?: string) {
        emit(c.red('✖'), c.red(message), detail);
    },

    /** Neutral information. */
    info(message: string, detail?: string) {
        emit(c.blue('ℹ'), message, detail);
    },

    /** Dimmed passthrough for raw command output. */
    output(text: string) {
        const trimmed = text.trim();
        if (trimmed) console.log(indentDetail(trimmed));
    },
};

export const palette = c;
