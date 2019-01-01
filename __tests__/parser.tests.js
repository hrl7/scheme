const Lexer = require("../src/lexer");
const Parser = require("../src/parser");

test("parse simple expression", () => {
  const lexer = new Lexer("(+ 1 2 3)");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  expect(parser.program).toEqual([
    {
      type: "EXPR",
      expr: {
        type: "PROC_CALL",
        operator: {
          type: "IDENTIFIER",
          name: "+",
        },
        operands: [
          {
            type: "NUMBER",
            value: 1,
          },
          {
            type: "NUMBER",
            value: 2,
          },
          {
            type: "NUMBER",
            value: 3,
          },
        ],
      },
    },
  ]);
});

test("parse lambda expression", () => {
  const lexer = new Lexer("(lambda (hoge) (piyo hoge))");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  expect(parser.program).toEqual([
    {
      type: "EXPR",
      expr: {
        type: "LAMBDA",
        formals: [
          {
            type: "IDENTIFIER",
            name: "hoge",
          },
        ],
        body: [
          {
            type: "EXPR",
            expr: {
              type: "PROC_CALL",
              operator: {
                type: "IDENTIFIER",
                name: "piyo",
              },
              operands: [
                {
                  type: "IDENTIFIER",
                  name: "hoge",
                },
              ],
            },
          },
        ],
      },
    },
  ]);
});
test("parse nested expression", () => {
  const lexer = new Lexer("((hoge) (piyo hoge))");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  expect(parser.program).toEqual([
    {
      type: "EXPR",
      expr: {
        type: "PROC_CALL",
        operator: {
          type: "EXPR",
          expr: {
            type: "PROC_CALL",
            operator: {
              type: "IDENTIFIER",
              name: "hoge",
            },
            operands: [],
          },
        },
        operands: [
          {
            type: "EXPR",
            expr: {
              type: "PROC_CALL",
              operator: {
                type: "IDENTIFIER",
                name: "piyo",
              },
              operands: [
                {
                  type: "IDENTIFIER",
                  name: "hoge",
                },
              ],
            },
          },
        ],
      },
    },
  ]);
});

test("parse expr includes quote", () => {
  const lexer = new Lexer("(car '(a b c))");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  expect(parser.program).toEqual([
    {
      type: "EXPR",
      expr: {
        type: "PROC_CALL",
        operator: {
          type: "IDENTIFIER",
          name: "car",
        },
        operands: [
          {
            type: "QUOTED_EXPR",
            expr: {
              type: "LIST",
              contents: [
                {
                  type: "IDENTIFIER",
                  name: "a",
                },
                {
                  type: "IDENTIFIER",
                  name: "b",
                },
                {
                  type: "IDENTIFIER",
                  name: "c",
                },
              ],
            },
          },
        ],
      },
    },
  ]);
});
