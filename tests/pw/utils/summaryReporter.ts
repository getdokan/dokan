// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { FullConfig, FullResult, Reporter, Suite, TestCase, TestError, TestResult, TestStep } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

type TestResults = {
    [key: string]: string;
};

type TestOptions = {
    outputFile?: string;
};

const getFormattedDuration = (milliseconds: number) => {
    // Handle negative values
    if (milliseconds < 0) return '0s';

    // Handle values less than 1 second
    if (milliseconds < 1000) {
        return Math.round(milliseconds / 100) / 10 + 's';
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const min = Math.floor((milliseconds / (1000 * 60)) % 60);
    const sec = Math.floor((milliseconds / 1000) % 60);
    return `${hours < 1 ? '' : hours + 'h '}${min < 1 ? '' : min + 'm '}${sec < 1 ? '' : sec + 's'}`;
};

const summary: {
    [key: string]: any | { [key: string]: any };
} = {
    suite_name: '',
    total_tests: 0,
    passed: 0,
    failed: 0,
    flaky: 0,
    skipped: 0,
    suite_duration: 0,
    suite_duration_formatted: '',
    tests: [],
    passed_tests: [],
    failed_tests: [],
    flaky_tests: [],
    skipped_tests: [],
};
export default class summaryReport implements Reporter {
    private testResults: TestResults = {};
    private options: TestOptions = {};
    private startTime: number = 0;
    private endTime: number = 0;

    constructor(options: TestOptions) {
        if (options) {
            this.options = options;
        }
    }

    onBegin(config: FullConfig, suite: Suite): void {
        this.startTime = Date.now();
        summary.total_tests = suite.allTests().length;
    }

    onTestBegin(test: TestCase, result: TestResult): void {}

    onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {}

    onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {}

    onStdOut(chunk: string | Buffer, test: void | TestCase, result: void | TestResult): void {
        // console.log(chunk);
    }

    onStdErr(chunk: string | Buffer, test: void | TestCase, result: void | TestResult): void {}

    onError?(error: TestError): void {
        // console.log(error);
    }

    onTestEnd(test: TestCase, result: TestResult): void {
        this.testResults[test.id] = test.outcome();
        // N.B. playwright skip tests from all tests, but we included them in the total tests to track all tests count comment below line and enable other commented line to make similar to playwright
        summary.tests.push(test.title);

        switch (test.outcome()) {
            case 'skipped':
                summary.skipped_tests.push(test.title);
                break;
            case 'expected':
                summary.passed_tests.push(test.title);
                // summary.tests.push(test.title);
                break;
            case 'unexpected':
                if (!summary.failed_tests.includes(test.title)) {
                    summary.failed_tests.push(test.title);
                    // summary.tests.push(test.title);
                }
                break;
            case 'flaky':
                summary.flaky_tests.push(test.title);
                const index = summary.failed_tests.indexOf(test.title);
                if (index !== -1) {
                    summary.failed_tests.splice(index, 1);
                }
                break;
            default:
                break;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onEnd(result: FullResult): void {
        this.endTime = Date.now();
        summary.suite_duration = this.endTime - this.startTime;
        summary.suite_duration_formatted = getFormattedDuration(summary.suite_duration);

        const results = [...Object.values(this.testResults)];
        summary.passed = results.filter(x => x === 'expected').length;
        summary.failed = results.filter(x => x === 'unexpected').length;
        summary.flaky = results.filter(x => x === 'flaky').length;
        summary.skipped = results.filter(x => x === 'skipped').length;
        // console.log(summary);

        if (this.options.outputFile) {
            const outputFile = this.options.outputFile;
            if (!fs.existsSync(path.dirname(outputFile))) {
                fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            }
            fs.writeFileSync(outputFile, JSON.stringify(summary));
        } else {
            console.log(summary);
        }
    }
}
