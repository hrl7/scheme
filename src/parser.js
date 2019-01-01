const debug = require("debug")("parser");
const debugQuote = require("debug")("parser:quote");
const debugProc = require("debug")("parser:proc");
const debugExpr = require("debug")("parser:proc");
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
    const node = this.makeExpr();
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
        case TOKEN_TYPES.RPAREN:
          break;
        case TOKEN_TYPES.KEYWORD: {
          if (token.keyword === "lambda") {
            this.currentIndex++;
            return this.makeLambda();
          }
          break;
        }
        default:
          if (expr.operator == null) {
            expr.operator = this.makeExpr();
          } else {
            expr.operands.push(this.makeExpr());
          }
      }
      this.currentIndex++;
      token = this.tokens[this.currentIndex];
      debugProc("next: ", token);
    }
    debugProc("finish to parse proc call: ", expr);
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
    const token = this.tokens[this.currentIndex];
    debugExpr("make expr: ", token.type);
    if (token.type === TOKEN_TYPES.LPAREN) {
      this.currentIndex++;
      return {
        type: "EXPR",
        expr: this.makeProcCall(),
      };
    }

    if (token.type === TOKEN_TYPES.QUOTE) {
      return this.makeQuotedExpr();
    }

    return toNode(token);
  }

  makeQuotedExpr() {
    this.currentIndex++;
    let token = this.tokens[this.currentIndex];
    debugQuote("quote expr: ", this.tokens[this.currentIndex + 1]);
    if (token.type !== TOKEN_TYPES.LPAREN) {
      debugQuote("atom found : ", token);
      return {
        type: "QUOTED_EXPR",
        expr: toNode(token),
      };
    }
    let depth = 1;
    let currentNode = {
      type: "LIST",
      contents: [],
    };
    let stack = [];
    this.currentIndex++;
    token = this.tokens[this.currentIndex];
    debugQuote(
      "before loop: ",
      this.currentIndex,
      this.tokens[this.currentIndex].name
    );
    while (
      token.type !== TOKEN_TYPES.RPAREN &&
      depth > 0 &&
      this.currentIndex < this.tokens.length
    ) {
      debugQuote(
        "depth: ",
        depth,
        "currentNode: ",
        currentNode,
        "token: ",
        token.type,
        token.name
      );
      switch (token.type) {
        case TOKEN_TYPES.LPAREN: {
          depth++;
          stack.push(currentNode);
          currentNode = {
            type: "LIST",
            contents: [],
          };
          break;
        }
        case TOKEN_TYPES.RPAREN: {
          depth--;
          let n = currentNode;
          currentNode = stack.pop();
          currentNode.contents.push(n);
          break;
        }
        default:
          debugQuote("push: ", token);
          currentNode.contents.push(toNode(token));
      }
      this.currentIndex++;
      token = this.tokens[this.currentIndex];
    }
    debugQuote(currentNode);
    if (currentNode.type === "LIST" && currentNode.contents === []) {
      return {
        type: "NULL",
      };
    }
    return {
      type: "QUOTED_EXPR",
      expr: currentNode,
    };
  }
}

module.exports = Parser;
