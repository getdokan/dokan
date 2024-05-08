import { FullConfig, FullResult, Reporter, Suite, TestCase, TestError, TestResult, TestStep } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

// todo: update custom reporter, add more features like duration, failed tests list

type TestResults = {
    [key: string]: string;
};

type TestOptions = {
    outputFile?: string;
};

const getFormattedDuration = (milliseconds: number) => {
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

    // onTestBegin(test: TestCase, result: TestResult): void {}

    // onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {}

    // onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {}

    // onStdOut(chunk: string | Buffer, test: void | TestCase, result: void | TestResult): void {
    //     console.log(chunk);
    // }

    // onStdErr(chunk: string | Buffer, test: void | TestCase, result: void | TestResult): void {}

    // onError?(error: TestError): void {
    //     console.log(error);
    // }

    onTestEnd(test: TestCase, result: TestResult): void {
        this.testResults[test.id] = test.outcome();
        test.outcome() !== 'skipped' ? summary.tests.push(test.title) : summary.skipped_tests.push(test.title);
        test.outcome() == 'expected' && summary.passed_tests.push(test.title);
        test.outcome() == 'unexpected' && summary.failed_tests.push(test.title);
        test.outcome() == 'flaky' && summary.flaky_tests.push(test.title);
    }

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
