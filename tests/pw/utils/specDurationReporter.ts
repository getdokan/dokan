// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/*
 * Lightweight Playwright reporter that records per-spec total duration.
 * Output: { generatedAt, specs: [{ file, ms, tests }] } — one file per shard,
 * later merged into the committed shard-durations.json baseline.
 */
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

type Options = { outputFile?: string };

export default class SpecDurationReporter implements Reporter {
    private specMs: Map<string, { ms: number; tests: number }> = new Map();
    private options: Options = {};

    constructor(options: Options = {}) {
        this.options = options;
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        // Resolve the relative path under tests/e2e so it matches splitter output.
        const fileAbs = test.location?.file ?? '';
        if (!fileAbs) return;
        const e2eIdx = fileAbs.lastIndexOf(`${path.sep}tests${path.sep}e2e${path.sep}`);
        if (e2eIdx === -1) return;
        const rel = fileAbs.slice(e2eIdx + `${path.sep}tests${path.sep}e2e${path.sep}`.length);

        const cur = this.specMs.get(rel) || { ms: 0, tests: 0 };
        // Sum total wall time including retries — that's what shard duration sees.
        cur.ms += result.duration || 0;
        cur.tests += 1;
        this.specMs.set(rel, cur);
    }

    onEnd(): void {
        const out = this.options.outputFile;
        if (!out) return;
        const dir = path.dirname(out);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const specs = Array.from(this.specMs.entries())
            .map(([file, v]) => ({ file, ms: Math.round(v.ms), tests: v.tests }))
            .sort((a, b) => b.ms - a.ms);
        fs.writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), specs }, null, 2));
    }
}
