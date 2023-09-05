import moment from 'moment';

expect.extend({
  toBeWithinSecondsOf(received: Date, expected: Date, precision = 3) {
    const receivedMoment = moment(received);
    const expectedMoment = moment(expected);

    const diff = Math.abs(receivedMoment.diff(expectedMoment));

    const pass = diff <= precision * 1000;

    const message = pass
      ? () =>
          this.utils.matcherHint('toBeWithinSecondsOf') +
          '\n\n' +
          `Expected: not ${this.utils.printExpected(expectedMoment)}\n` +
          `Received: ${this.utils.printReceived(receivedMoment)}\n` +
          `Difference: ${diff} milliseconds`
      : () =>
          this.utils.matcherHint('toBeWithinSecondsOf') +
          '\n\n' +
          `Expected: ${this.utils.printExpected(expectedMoment)}\n` +
          `Received: ${this.utils.printReceived(receivedMoment)}\n` +
          `Difference: ${diff} milliseconds`;

    return { pass, message };
  },
});