import Interpreter from "../src/interpreter";

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
    type: "PAIR",
    car: {
      type: "ATOM",
      name: "a",
    },
    cdr: {
      type: "PAIR",
      car: {
        type: "ATOM",
        name: "b",
      },
      cdr: {
        type: "PAIR",
        car: {
          type: "ATOM",
          name: "c",
        },
        cdr: {
          type: "PAIR",
          car: {
            type: "ATOM",
            name: "d",
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
    name: "a",
  });
});

test("eval cdr", () => {
  const interpreter = new Interpreter();
  interpreter.run("(cdr '(a b c d))");
  expect(interpreter.result).toEqual({
    type: "PAIR",
    car: {
      type: "ATOM",
      name: "b",
    },
    cdr: {
      type: "PAIR",
      car: {
        type: "ATOM",
        name: "c",
      },
      cdr: {
        type: "PAIR",
        car: {
          type: "ATOM",
          name: "d",
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
  interpreter.run("(null? '())");
  expect(interpreter.result).toEqual({
    type: "BOOLEAN",
    value: true,
    symbol: "#t",
  });
});

test("eval null? => #f", () => {
  const interpreter = new Interpreter();
  interpreter.run("(null? '(a))");
  expect(interpreter.result).toEqual({
    type: "BOOLEAN",
    value: false,
    symbol: "#f",
  });
});

test("eval empty list", () => {
  const interpreter = new Interpreter();
  const result = interpreter.eval({
    type: "QUOTED_EXPR",
    expr: {
      type: "LIST",
      contents: [],
    },
  });
  expect(result).toEqual({ type: "NULL" });
});
