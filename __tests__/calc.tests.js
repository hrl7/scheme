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

test("run lambda simple", () => {
  const repl = new REPL();
  repl.run("((lambda (a) (* a 2)) 4)");
  const result = repl.print();
  expect(result).toBe("8");
});

test("run lambda car", () => {
  const repl = new REPL();
  repl.run("((lambda (a) (car a)) '(b c))");
  const result = repl.print();
  expect(result).toBe("b");
});

test("run lambda car cons ", () => {
  const repl = new REPL();
  repl.run("((lambda (a b) (cons (car a) b)) '(a (b)) '())");
  const result = repl.print();
  expect(result).toBe("(a)");
});
