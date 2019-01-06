import Debug from "debug";
import { TOKEN_TYPES } from "./constants";

const debug = Debug("parser");
const debugQuote = Debug("parser:quote");
const debugProc = Debug("parser:proc");
const debugExpr = Debug("parser:expr");
const debugLambda = Debug("parser:lambda");

const toNode = token => {
  debug("to Node: ", token);
  switch (token.type) {
    case TOKEN_TYPES.NUMBER: {
      return {
        type: "NUMBER",
        value: token.value,
        loc: token.loc || null,
      };
    }
    case TOKEN_TYPES.IDENTIFIER: {
      return {
        type: "IDENTIFIER",
        name: token.identifier,
        loc: token.loc || null,
      };
    }
  }
};

class Parser {
  constructor(tokens, src = null) {
    debug("init parser with: ", tokens);
    this.src = src;
    this.tokens = tokens;
    this.program = [];
    this.currentIndex = 0;
  }

  reset() {
    this.currentIndex = 0;
    this.program = [];
    this.tokens = [];
  }

  parse() {
    const node = this.makeExpr();
    debug("finish parsing");
    this.program.push(node);
  }

  assertLPAREN() {
    const token = this.tokens[this.currentIndex];
    if (token.type !== TOKEN_TYPES.LPAREN) {
      const msg = `failed to parse. expected '(' but found ${token.type}`;
      throw new Error(msg);
    }
  }
  assertLambda() {
    const token = this.tokens[this.currentIndex];
    const nextToken = this.tokens[this.currentIndex + 1];
    if (
      token.type !== TOKEN_TYPES.LPAREN ||
      nextToken.type !== TOKEN_TYPES.KEYWORD ||
      nextToken.keyword !== "lambda"
    ) {
      const msg = `failed to parse. expected 'lambda' but found ${
        token.type
      }, ${nextToken.type}`;
      throw new Error(msg);
    }
  }

  debugParsingPosition(token = null) {
    if (this.src == null) {
      return;
    }
    const targetToken = token != null ? token : this.tokens[this.currentIndex];

    const reset = "\u001b[0m";
    const cyan = "\u001b[36m";

    if (targetToken == null) {
      return;
    }
    const loc = targetToken.loc;
    if (loc == null) {
      return;
    }
    if (typeof process !== "undefined") {
      debug(
        "current parsing token: \n  " +
          reset +
          this.src.slice(0, loc.start.col) +
          cyan +
          this.src.slice(loc.start.col, loc.end.col + 1) +
          reset +
          this.src.slice(loc.end.col + 1)
      );
    } else {
      debug(
        "current parsing token: \n  " +
          "%c" +
          this.src.slice(0, loc.start.col) +
          "%c" +
          this.src.slice(loc.start.col, loc.end.col + 1) +
          "%c" +
          this.src.slice(loc.end.col + 1),
        "color: black",
        "color: cyan",
        "color: black"
      );
    }
  }

  makeProcCall() {
    let token = this.tokens[this.currentIndex];
    debugProc("start parsing proc call. token: ", token.type);
    this.debugParsingPosition();
    this.assertLPAREN();
    this.currentIndex++;
    token = this.tokens[this.currentIndex];
    const expr = {
      type: "PROC_CALL",
      operator: null,
      operands: [],
    };
    let depth = 1;
    do {
      this.debugParsingPosition();
      switch (token.type) {
        case TOKEN_TYPES.RPAREN:
          depth--;
          break;
        case TOKEN_TYPES.LPAREN: {
          const nextToken = this.tokens[this.currentIndex + 1];
          if (
            expr.operator === null &&
            nextToken.type === TOKEN_TYPES.KEYWORD &&
            nextToken.keyword === "lambda"
          ) {
            expr.operator = this.makeLambda();
            this.debugParsingPosition();
            debugProc("back to proc from lambda");
            break;
          }
        }
        default:
          if (expr.operator == null) {
            expr.operator = this.makeExpr();
          } else {
            debugProc("found next operand: ", token);
            expr.operands.push(this.makeExpr());
          }
      }
      this.currentIndex++;
      token = this.tokens[this.currentIndex];
      debugProc("depth: ", depth, "next: ", token);
    } while (
      token != null &&
      depth !== 0 &&
      this.currentIndex < this.tokens.length
    );

    debugProc("finish parsing proc call: ", expr);
    this.currentIndex--;
    this.debugParsingPosition();
    return expr;
  }

  makeLambda() {
    debugLambda("start parsing Lambda ");
    this.debugParsingPosition();
    this.assertLambda();
    this.currentIndex += 2;
    let token = this.tokens[this.currentIndex];
    const node = {
      type: "LAMBDA",
      formals: [],
      body: [],
    };
    let isReadingBody = false;
    let isReadingFormals = false;
    let finishedReadingFormals = false;
    while (token != null && this.currentIndex < this.tokens.length) {
      debugLambda(
        isReadingBody,
        finishedReadingFormals,
        "token: ",
        token.type,
        "formals: ",
        node.formals.map(n => n.name),
        "body: ",
        node.body
      );
      switch (token.type) {
        case TOKEN_TYPES.RPAREN: {
          if (isReadingFormals) {
            isReadingFormals = false;
            finishedReadingFormals = true;
            debugLambda(
              "finish reading formals: ",
              node.formals.map(n => n.name)
            );
            debugLambda("start reading body: ", node.body);
            isReadingBody = true;
            this.currentIndex++;
            node.body.push(this.makeExpr());
          } else if (isReadingBody && finishedReadingFormals) {
            debugLambda("finish parsing lambda: ", node.formals, node.body);
            this.debugParsingPosition();
            return node;
          }
          break;
        }
        case TOKEN_TYPES.LPAREN: {
          if (!finishedReadingFormals && !isReadingBody) {
            debugLambda(
              "start reading formals: ",
              node.formals.map(n => n.name)
            );
            isReadingFormals = true;
          } else if (isReadingBody) {
            node.body.push(this.makeExpr());
          }
          break;
        }
        default:
          if (isReadingFormals) {
            node.formals.push(toNode(token));
          }
      }
      this.debugParsingPosition();
      this.currentIndex++;
      token = this.tokens[this.currentIndex];
    }
    throw new Error("failed to parse lambda expr. expected ')' but not found.");
  }

  makeExpr() {
    const token = this.tokens[this.currentIndex];
    debugExpr("start parsing expr: ", token.type, token);
    this.debugParsingPosition();
    if (token.type === TOKEN_TYPES.LPAREN) {
      const nextToken = this.tokens[this.currentIndex + 1];
      debugExpr(
        "next token: ",
        nextToken.type,
        TOKEN_TYPES.KEYWORD,
        nextToken.type === TOKEN_TYPES.KEYWORD,
        nextToken.keyword === "lambda"
      );
      if (
        nextToken.type === TOKEN_TYPES.KEYWORD &&
        nextToken.keyword === "lambda"
      ) {
        return this.makeLambda();
      }

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
    this.debugParsingPosition();
    if (token.type !== TOKEN_TYPES.LPAREN) {
      debugQuote("atom found : ", token);
      return {
        type: "QUOTED_EXPR",
        expr: toNode(token),
      };
    }
    let currentNode = {
      type: "LIST",
      contents: [],
    };
    let stack = [];
    let depth = 1;
    this.currentIndex++;
    token = this.tokens[this.currentIndex];

    debugQuote("before loop: ", this.currentIndex, token);

    do {
      debugQuote(
        "depth: ",
        stack.length,
        "stack: ",
        stack,
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
          let n = currentNode;
          depth--;
          if (depth !== 0) {
            currentNode = stack.pop();
            currentNode.contents.push(n);
          }
          break;
        }
        default:
          debugQuote("Not found Paren, got: ", toNode(token).name);
          currentNode.contents.push(toNode(token));
      }

      this.currentIndex++;
      token = this.tokens[this.currentIndex];
      this.debugParsingPosition();
    } while (depth !== 0 && this.currentIndex < this.tokens.length);

    debugQuote(currentNode);
    if (currentNode.type === "LIST" && currentNode.contents === []) {
      return {
        type: "NULL",
      };
    }

    this.currentIndex--;
    return {
      type: "QUOTED_EXPR",
      expr: currentNode,
    };
  }
}

export default Parser;
