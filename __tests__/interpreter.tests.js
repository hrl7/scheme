const Interpreter = require("../src/interpreter");

test("eval simple calculation", () => {
  const interpreter = new Interpreter();
  interpreter.run("(+ 1 2 3)");
  expect(interpreter.result).toEqual({
    type: "NUMBER",
    value: 6,
  });
});

test("eval quoted list", () => {
  const interpreter = new Interpreter();
  interpreter.run("(quote (a b c d))");
  expect(interpreter.result).toEqual({
    type: "CONS_CELL",
    car: {
      type: "ATOM",
      value: "a",
    },
    cdr: {
      type: "CONS_CELL",
      car: {
        type: "ATOM",
        value: "b",
      },
      cdr: {
        type: "CONS_CELL",
        car: {
          type: "ATOM",
          value: "c",
        },
        cdr: {
          type: "CONS_CELL",
          car: {
            type: "ATOM",
            value: "d",
          },
          cdr: {
            type: "NULL",
          },
        },
      },
    },
  });
});

test("eval car ", () => {
  const interpreter = new Interpreter();
  interpreter.run("(car '(a b c d))");
  expect(interpreter.result).toEqual({
    type: "ATOM",
    value: "a",
  });
});

test("eval cdr", () => {
  const interpreter = new Interpreter();
  interpreter.run("(cdr '(a b c d))");
  expect(interpreter.result).toEqual({
    type: "CONS_CELL",
    car: {
      type: "ATOM",
      value: "b",
    },
    cdr: {
      type: "CONS_CELL",
      car: {
        type: "ATOM",
        value: "c",
      },
      cdr: {
        type: "CONS_CELL",
        car: {
          type: "ATOM",
          value: "d",
        },
        cdr: {
          type: "NULL",
        },
      },
    },
  });
});

test("eval null? => #t", () => {
  const interpreter = new Interpreter();
  interpreter.run("(null? '()");
  expect(interpreter.result).toEqual({
    type: "BOOLEAN",
    value: "true",
  });
});

test("eval null? => #f", () => {
  const interpreter = new Interpreter();
  interpreter.run("(null? '(a)");
  expect(interpreter.result).toEqual({
    type: "BOOLEAN",
    value: "false",
  });
});
