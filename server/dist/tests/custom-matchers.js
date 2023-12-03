"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
expect.extend({
    toBeWithinSecondsOf(received, expected, precision = 3) {
        const receivedMoment = (0, moment_1.default)(received);
        const expectedMoment = (0, moment_1.default)(expected);
        const diff = Math.abs(receivedMoment.diff(expectedMoment));
        const pass = diff <= precision * 1000;
        const message = pass
            ? () => this.utils.matcherHint('toBeWithinSecondsOf') +
                '\n\n' +
                `Expected: not ${this.utils.printExpected(expectedMoment)}\n` +
                `Received: ${this.utils.printReceived(receivedMoment)}\n` +
                `Difference: ${diff} milliseconds`
            : () => this.utils.matcherHint('toBeWithinSecondsOf') +
                '\n\n' +
                `Expected: ${this.utils.printExpected(expectedMoment)}\n` +
                `Received: ${this.utils.printReceived(receivedMoment)}\n` +
                `Difference: ${diff} milliseconds`;
        return { pass, message };
    },
});
