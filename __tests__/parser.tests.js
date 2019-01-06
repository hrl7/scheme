import Lexer from "../src/lexer";
import Parser from "../src/parser";

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
          loc: {
            end: {
              col: 1,
              line: 0,
            },
            start: {
              col: 1,
              line: 0,
            },
          },
        },
        operands: [
          {
            type: "NUMBER",
            value: 1,
            loc: {
              end: {
                col: 3,
                line: 0,
              },
              start: {
                col: 3,
                line: 0,
              },
            },
          },
          {
            type: "NUMBER",
            value: 2,
            loc: {
              end: {
                col: 5,
                line: 0,
              },
              start: {
                col: 5,
                line: 0,
              },
            },
          },
          {
            type: "NUMBER",
            value: 3,
            loc: {
              end: {
                col: 7,
                line: 0,
              },
              start: {
                col: 7,
                line: 0,
              },
            },
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
      type: "LAMBDA",
      formals: [
        {
          type: "IDENTIFIER",
          name: "hoge",
          loc: {
            end: {
              col: 12,
              line: 0,
            },
            start: {
              col: 9,
              line: 0,
            },
          },
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
              loc: {
                end: {
                  col: 19,
                  line: 0,
                },
                start: {
                  col: 16,
                  line: 0,
                },
              },
            },
            operands: [
              {
                type: "IDENTIFIER",
                name: "hoge",
                loc: {
                  end: {
                    col: 24,
                    line: 0,
                  },
                  start: {
                    col: 21,
                    line: 0,
                  },
                },
              },
            ],
          },
        },
      ],
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
              loc: {
                end: {
                  col: 5,
                  line: 0,
                },
                start: {
                  col: 2,
                  line: 0,
                },
              },
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
                loc: {
                  end: {
                    col: 12,
                    line: 0,
                  },
                  start: {
                    col: 9,
                    line: 0,
                  },
                },
              },
              operands: [
                {
                  type: "IDENTIFIER",
                  name: "hoge",
                  loc: {
                    end: {
                      col: 17,
                      line: 0,
                    },
                    start: {
                      col: 14,
                      line: 0,
                    },
                  },
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
          loc: {
            end: {
              col: 3,
              line: 0,
            },
            start: {
              col: 1,
              line: 0,
            },
          },
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
                  loc: {
                    end: {
                      col: 7,
                      line: 0,
                    },
                    start: {
                      col: 7,
                      line: 0,
                    },
                  },
                },
                {
                  type: "IDENTIFIER",
                  name: "b",
                  loc: {
                    end: {
                      col: 9,
                      line: 0,
                    },
                    start: {
                      col: 9,
                      line: 0,
                    },
                  },
                },
                {
                  type: "IDENTIFIER",
                  name: "c",
                  loc: {
                    end: {
                      col: 11,
                      line: 0,
                    },
                    start: {
                      col: 11,
                      line: 0,
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);
});

test("parse empty list", () => {
  const lexer = new Lexer("'()");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  expect(parser.program).toEqual([
    {
      type: "QUOTED_EXPR",
      expr: {
        type: "LIST",
        contents: [],
      },
    },
  ]);
});

test("parse quoted list", () => {
  const lexer = new Lexer("(car '(a b c d))");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  console.log(JSON.stringify(parser.program[0], null, 2));
  expect(parser.program[0].expr.type).toBe("PROC_CALL");
  expect(parser.program[0].expr.operands[0].expr.contents[0].name).toBe("a");
});

test("parse nested list", () => {
  const lexer = new Lexer("'((a))");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  expect(parser.program).toEqual([
    {
      type: "QUOTED_EXPR",
      expr: {
        type: "LIST",
        contents: [
          {
            type: "LIST",
            contents: [
              {
                type: "IDENTIFIER",
                name: "a",
                loc: {
                  end: {
                    col: 3,
                    line: 0,
                  },
                  start: {
                    col: 3,
                    line: 0,
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ]);
});

test("parse deep nested list", () => {
  const lexer = new Lexer("'(((a) b) c)");
  lexer.tokenize();
  const parser = new Parser(lexer.tokens);
  parser.parse();
  expect(parser.program).toEqual([
    {
      type: "QUOTED_EXPR",
      expr: {
        type: "LIST",
        contents: [
          {
            type: "LIST",
            contents: [
              {
                type: "LIST",
                contents: [
                  {
                    type: "IDENTIFIER",
                    name: "a",
                    loc: {
                      end: {
                        col: 4,
                        line: 0,
                      },
                      start: {
                        col: 4,
                        line: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: "IDENTIFIER",
                name: "b",
                loc: {
                  end: {
                    col: 7,
                    line: 0,
                  },
                  start: {
                    col: 7,
                    line: 0,
                  },
                },
              },
            ],
          },
          {
            type: "IDENTIFIER",
            name: "c",
            loc: {
              end: {
                col: 10,
                line: 0,
              },
              start: {
                col: 10,
                line: 0,
              },
            },
          },
        ],
      },
    },
  ]);
});

test("parse lambda with null", () => {
  const src = "((lambda (a) a) '())";
  const lexer = new Lexer(src);
  lexer.tokenize();
  const parser = new Parser(lexer.tokens, src);
  parser.parse();
  console.log(JSON.stringify(parser.program[0], null, 2));
  expect(parser.program[0].expr.operator.type).toEqual("LAMBDA");
  expect(parser.program[0].expr.operator.body[0].type).toEqual("IDENTIFIER");
  expect(parser.program[0].expr.operands[0].type).toEqual("QUOTED_EXPR");
});

test("parse simple lambda ", () => {
  const src = "((lambda (a) (* a 2)) 4)";
  const lexer = new Lexer(src);
  lexer.tokenize();
  const parser = new Parser(lexer.tokens, src);
  parser.parse();
  console.log(JSON.stringify(parser.program[0], null, 2));
  expect(parser.program[0].expr.operands[0].type).toEqual("NUMBER");
  expect(parser.program[0].expr.operator.body[0].expr.type).toEqual(
    "PROC_CALL"
  );
});

test("parse proc call with 2 quotes", () => {
  const src = "((lambda (a b) (cons a b)) '(a b c) '(d e f))";
  const lexer = new Lexer(src);
  lexer.tokenize();
  const parser = new Parser(lexer.tokens, src);
  parser.parse();
  //console.log(lexer.tokens.map(t => {delete t.loc; return t}))
  console.log(JSON.stringify(parser.program[0], null, 2));
  expect(parser.program[0].expr.operands[0].type).toEqual("QUOTED_EXPR");
  expect(parser.program[0].expr.operands[1].type).toEqual("QUOTED_EXPR");
});

test("parse twice", () => {
  const src = "(define twice (lambda (x) (* 2 x)))";
  const lexer = new Lexer(src);
  lexer.tokenize();
  const parser = new Parser(lexer.tokens, src);
  parser.parse();
  console.log(
    lexer.tokens.map(t => {
      delete t.loc;
      return t;
    })
  );
  console.log(JSON.stringify(parser.program[0], null, 2));
  expect(parser.program[0].expr.operands[0].type).toEqual("IDENTIFIER");
  expect(parser.program[0].expr.operands[1].type).toEqual("LAMBDA");
});

test("makeProcCall", () => {
  const src = "((lambda (a) '()) 3)";
  const lexer = new Lexer(src);
  lexer.tokenize();
  const parser = new Parser(lexer.tokens, src);
  const result = parser.makeExpr();
  parser.debugParsingPosition();
  console.log(result, parser.currentIndex, parser.tokens[parser.currentIndex]);
  expect(parser.tokens[parser.currentIndex].type).toBe("RPAREN");
  expect(parser.currentIndex).toBe(11);
});
