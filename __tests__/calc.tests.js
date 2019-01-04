import REPL from "../src/repl.js";

test("run simple expr", () => {
  const repl = new REPL();
  repl.run("(+ 1 2)");
  const result = repl.print();
  expect(result).toBe("3");
});

test("run with needless spaces expr", () => {
  const repl = new REPL();
  repl.run("(+   1    2)");
  const result = repl.print();
  expect(result).toBe("3");
});

test("nested", () => {
  const repl = new REPL();
  repl.run("(+ 1 (* 3 2) (+ 3 4))");
  const result = repl.print();
  expect(result).toBe("14");
});
