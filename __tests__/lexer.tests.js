const Lexer = require("../src/lexer");

test("parse simple expression", () => {
  const src = "(+ 1 2 345)";
  const lexer = new Lexer(src);
  lexer.tokenize();
  expect(lexer.tokens).toEqual([
    {
      type: "LPAREN",
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
      value: 345,
      loc: {
        start: {
          line: 0,
          col: 7,
        },
        end: {
          line: 0,
          col: 9,
        },
      },
    },
    {
      type: "RPAREN",
      loc: {
        start: {
          line: 0,
          col: 10,
        },
        end: {
          line: 0,
          col: 10,
        },
      },
    },
  ]);
});

test("parse expression", () => {
  const src = "   (   + hogepiyo #t(- 321 4565))";
  const lexer = new Lexer(src);
  lexer.tokenize();
  expect(lexer.tokens.length).toBe(10);
});

test("parse true false ", () => {
  const src = "(#t #f)";
  const lexer = new Lexer(src);
  lexer.tokenize();
  expect(lexer.tokens[1].type).toBe("BOOLEAN");
  expect(lexer.tokens[1].value).toBe(true);
  expect(lexer.tokens[2].type).toBe("BOOLEAN");
  expect(lexer.tokens[2].value).toBe(false);
});

test("parse quoted", () => {
  const src = "(car '(a b c))";
  const lexer = new Lexer(src);
  lexer.tokenize();
  expect(lexer.tokens[2].type).toBe("QUOTE");
});

test("parse empty list", () => {
  const src = "'()";
  const lexer = new Lexer(src);
  lexer.tokenize();
  expect(lexer.tokens[0].type).toBe("QUOTE");
  expect(lexer.tokens[1].type).toBe("LPAREN");
  expect(lexer.tokens[2].type).toBe("RPAREN");
});
