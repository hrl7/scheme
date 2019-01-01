const debug = require("debug")("parser");
const { TOKEN_TYPES } = require("./constants");

const toNode = token => {
  switch (token.type) {
    case TOKEN_TYPES.NUMBER: {
      return {
        type: "NUMBER",
        value: token.value,
      };
    }
    case TOKEN_TYPES.IDENTIFIER: {
      return {
        type: "IDENTIFIER",
        name: token.identifier,
      };
    }
  }
};

class Parser {
  constructor(tokens) {
    debug("init parser with: ", tokens);
    this.tokens = tokens;
    this.program = [];
    this.currentIndex = 0;
  }

  parse() {
    const token = this.tokens[this.currentIndex];
    const node = {
      type: "EXPR",
      expr: null,
    };
    switch (token.type) {
      case TOKEN_TYPES.LPAREN: {
        this.currentIndex++;
        node.expr = this.makeProcCall();
        break;
      }
    }
    this.program.push(node);
  }

  makeProcCall() {
    let token = this.tokens[this.currentIndex];
    const expr = {
      type: "PROC_CALL",
      operator: null,
      operands: [],
    };
    while (
      token != null &&
      token.type !== TOKEN_TYPES.RPAREN &&
      this.currentIndex < this.tokens.length
    ) {
      switch (token.type) {
        case TOKEN_TYPES.LPAREN:
          if (expr.operator == null) {
            expr.operator = this.makeExpr();
          } else {
            expr.operands.push(this.makeExpr());
          }
          break;
        case TOKEN_TYPES.RPAREN:
          break;
        case TOKEN_TYPES.IDENTIFIER:
        case TOKEN_TYPES.NUMBER:
          if (expr.operator == null) {
            expr.operator = toNode(token);
          } else {
            expr.operands.push(toNode(token));
          }
          break;
        case TOKEN_TYPES.KEYWORD: {
          if (token.keyword === "lambda") {
            this.currentIndex++;
            return this.makeLambda();
          }
        }

        default:
      }
      this.currentIndex++;
      token = this.tokens[this.currentIndex];
      debug("next: ", token);
    }
    debug("finish to parse proc call: ", expr);
    return expr;
  }

  assertLPAREN(token, nodeType) {
    if (token.type !== TOKEN_TYPES.LPAREN) {
      const msg = `failed to parse ${nodeType}. expected '(' but found ${
        token.type
      }`;
      throw new Error(msg);
    }
  }

  // after finding lambda
  makeLambda() {
    let token = this.tokens[this.currentIndex];
    this.assertLPAREN(token, "LAMBDA EXPR");
    const node = {
      type: "LAMBDA",
      formals: [],
      body: [],
    };
    let isReadingBody = false;
    let isReadingFormals = false;
    let finishedReadingFormals = false;
    while (token != null && this.currentIndex < this.tokens.length) {
      debug(
        "token: ",
        token.type,
        "formals: ",
        node.formals,
        "body: ",
        node.body
      );
      switch (token.type) {
        case TOKEN_TYPES.RPAREN: {
          if (isReadingFormals) {
            isReadingFormals = false;
            finishedReadingFormals = true;
          }
          if (isReadingBody && finishedReadingFormals) {
            return node;
          }
          break;
        }
        case TOKEN_TYPES.LPAREN: {
          if (!finishedReadingFormals && !isReadingBody) {
            isReadingFormals = true;
          }
          if (finishedReadingFormals && !isReadingBody) {
            isReadingBody = true;
          }
          if (isReadingBody) {
            node.body.push(this.makeExpr());
          }
          break;
        }
        default:
          if (isReadingFormals) {
            node.formals.push(toNode(token));
          }
      }
      this.currentIndex++;
      token = this.tokens[this.currentIndex];
    }
    throw new Error("failed to parse lambda expr. expected ')' but not found.");
  }

  makeExpr() {
    const node = {
      type: "EXPR",
      expr: {},
    };
    let token = this.tokens[this.currentIndex];
    this.assertLPAREN(token, "EXPR");
    this.currentIndex++;
    node.expr = this.makeProcCall();
    return node;
  }
}

module.exports = {
  Parser: Parser,
};
