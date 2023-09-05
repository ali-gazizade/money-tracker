declare module globalThis {
  var token: string;

  namespace jest {
    interface Matchers {
      toBeWithinSecondsOf(expected: Date, precision?: number): CustomMatcherResult;
    }
    interface Expect {
      toBeWithinSecondsOf(expected: Date, precision?: number): CustomMatcherResult;
    }
  }
}