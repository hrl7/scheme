const { Lexer } = require("../src/lexer");

test("parse simple expression", () => {
  const src = "(+ 1 2 3)";
  const lexer = new Lexer(src);
  lexer.tokenize();
  expect(lexer.tokens).toEqual([
    {
      type: "SYMBOL",
      token: "LPAREN",
      loc: {
        start: {
          line: 0,
          col: 0,
        },
        end: {
          line: 0,
          col: 0,
        },
      },
    },
    {
      type: "IDENTIFIER",
      identifier: "+",
      loc: {
        start: {
          line: 0,
          col: 1,
        },
        end: {
          line: 0,
          col: 1,
        },
      },
    },
    {
      type: "NUMBER",
      value: 1,
      loc: {
        start: {
          line: 0,
          col: 3,
        },
        end: {
          line: 0,
          col: 3,
        },
      },
    },
    {
      type: "NUMBER",
      value: 2,
      loc: {
        start: {
          line: 0,
          col: 5,
        },
        end: {
          line: 0,
          col: 5,
        },
      },
    },
    {
      type: "NUMBER",
      value: 3,
      loc: {
        start: {
          line: 0,
          col: 7,
        },
        end: {
          line: 0,
          col: 7,
        },
      },
    },
  ]);
});
