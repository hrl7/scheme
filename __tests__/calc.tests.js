const { run } = require("../src/index.js");

test("run simple expr", () => {
  const result = run("(+ 1 2)");
  expect(result).toBe(3);
});

test("run with needless spaces expr", () => {
  const result = run("(+   1    2)");
  expect(result).toBe(3);
});

