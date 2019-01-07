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
  repl.run("((lambda (c d) (cons (car c) d)) '(a (b)) '())");
  const result = repl.print();
  expect(result).toBe("(a)");
});

test("run lat?", () => {
  const repl = new REPL();
  repl.run("(define atom? (lambda (x) (and (not (pair? x)) (not (null? x)))))");
  repl.run(
    "(define lat? (lambda (lst) (cond ((null? lst) #t) ((atom? (car lst)) (lat? (cdr lst))) (else #f))))"
  );
  repl.run("(lat? '())");
  expect(repl.print()).toBe("#t");
  repl.run("(lat? '(a))");
  expect(repl.print()).toBe("#t");
  repl.run("(lat? '(a b c d))");
  expect(repl.print()).toBe("#t");
  repl.run("(lat? '(a (b c) d))");
  expect(repl.print()).toBe("#f");
});
