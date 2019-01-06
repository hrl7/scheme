import Debug from "debug";
import Lexer from "./lexer";
import Parser from "./parser";
import { NODE_TYPES } from "./constants";

const debug = Debug("eval:run");
const debugAssert = Debug("eval:assert");
const {
  TRUE,
  FALSE,
  NULL,
  buildProc,
  buildPair,
  toString,
} = require("./nodes");
const { BASE_PROCEDURES } = require("./procedures/base");
const { MATH_PROCEDURES } = require("./procedures/math");
class Env {
  constructor(table) {
    this.table = table || {};
  }
}

class ArgumentsError {
  constructor(reason) {
    this.type = "ERROR";
    this.message = reason;
  }
}

class Interpreter {
  constructor() {
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.result = null;
    this.program = null;
    let procs = {};
    procs = BASE_PROCEDURES.reduce(
      (acc, proc) =>
        Object.assign(acc, { [proc[1]]: this.makeProc.apply(this, proc) }),
      procs
    );
    procs = MATH_PROCEDURES.reduce(
      (acc, proc) =>
        Object.assign(acc, { [proc[1]]: this.makeProc.apply(this, proc) }),
      procs
    );
    this.globalEnv = new Env(procs);
    this.stack = [];
  }

  makeProc(argumentsSpec, name, body) {
    if (argumentsSpec === "REST") {
      return buildProc(name, () => null, body);
    }

    const assertion = operands => {
      debugAssert(argumentsSpec, operands);
      if (argumentsSpec.length !== operands.length) {
        return new ArgumentsError(
          `wrong number of arguments: ${name} require ${
            argumentsSpec.length
          }, but got ${operands.length}`
        );
      }
      let i;
      for (i = 0; i < operands.length; i++) {
        const spec = argumentsSpec[i];
        const operand = operands[i];
        if (operand == null) {
          const msg = `operand is undefined, operands: ${operands}, at index: ${i}`;
          throw new Error(msg);
        }
        if (spec !== "*" && spec !== operand.type) {
          return new ArgumentsError(
            `${spec} required, but got ${operands.map(toString)}`
          );
        }
      }
      return null;
    };
    return buildProc(name, assertion, body);
  }

  run(src) {
    this.lexer.reset();
    this.parser.reset();
    debug("run: ", src);
    this.lexer.src = src;
    this.lexer.tokenize();
    this.parser.tokens = this.lexer.tokens;
    this.parser.parse();
    this.program = this.parser.program;

    let pc = 0;
    while (pc < this.program.length) {
      const ast = this.program[pc];
      this.result = this.eval(ast);
      pc++;
    }
    debug("****** finish running ******** \n\n");
  }

  eval(ast) {
    debug("eval: ", toString(ast));
    switch (ast.type) {
      case NODE_TYPES.EXPR: {
        return this.evalExpr(ast.expr);
        break;
      }
      case NODE_TYPES.QUOTED_EXPR: {
        return this.evalQuote(ast);
        break;
      }
      default:
    }
  }

  evalExpr(expr) {
    debug("evalExpr: ", toString(expr));
    switch (expr.type) {
      case NODE_TYPES.PROC_CALL:
        return this.evalProcCall(expr);
      case NODE_TYPES.IDENTIFIER:
        return this.evalIdentifier(expr);
      case NODE_TYPES.PAIR:
      case NODE_TYPES.NUMBER:
      case NODE_TYPES.PROC:
        return expr;
      case NODE_TYPES.EXPR:
        return this.evalExpr(expr.expr);
      case NODE_TYPES.QUOTED_EXPR:
        return this.evalQuote(expr);
      case NODE_TYPES.LAMBDA:
        return this.evalLambda(expr);
      default:
        debug("UNRECOGNIZED Expr type: ", expr.type);
    }
  }

  evalLambda(expr) {
    const spec = [...new Array(expr.formals.length)].map(_ => "*");
    return this.makeProc(spec, "", operands => {
      debug("call lambda: ", operands);
      const table = expr.formals.reduce(
        (acc, variable, i) => ({
          ...acc,
          [variable.name]: this.evalExpr(operands[i]),
        }),
        {}
      );
      this.stack.push(new Env(table));
      debug("apply lambda: ", expr.body);
      const result = this.evalProcCall(expr.body);
      this.stack.pop();
      return result;
    });
  }

  evalIdentifier(ident) {
    debug("evalIdentifier: ", ident.name);
    let i = this.stack.length - 1;
    while (i >= 0) {
      const env = this.stack[i];
      const expr = env.table[ident.name];
      if (expr != null) {
        return this.evalExpr(expr);
      }
      i--;
    }

    const expr = this.globalEnv.table[ident.name];
    if (expr != null) {
      return this.evalExpr(expr);
    }
    return {
      type: "ERROR",
      message: `unbound variable: ${ident.name}`,
    };
  }

  evalList(expr) {
    const length = expr.contents.length;
    const contents = expr.contents;
    if (length === 0) {
      return NULL;
    }
    let i = length - 1;
    let list = NULL;
    while (i >= 0) {
      list = buildPair(this.evalQuote(contents[i]), list);
      i--;
    }
    return list;
  }

  evalQuote(quoted) {
    switch (quoted.type) {
      case NODE_TYPES.IDENTIFIER:
        return {
          type: NODE_TYPES.ATOM,
          name: quoted.name,
        };
      case NODE_TYPES.NUMBER:
        return quoted;
      case NODE_TYPES.LIST:
        return this.evalList(quoted);
      case NODE_TYPES.QUOTED_EXPR:
      case NODE_TYPES.EXPR:
        debug("quoted expr found. go through.");
        break;
      default: {
        const msg = `found unrecognized expr: ${toString(quoted)}`;
        throw new Error(msg);
      }
    }
    debug("evalQuote", quoted && quoted.expr && quoted.expr.type, quoted);
    if (quoted.expr.type === NODE_TYPES.LIST) {
      return this.evalList(quoted.expr);
    }
    if (quoted.expr.type === NODE_TYPES.IDENTIFIER) {
      return {
        type: "ATOM",
        symbol: quoted.expr.name,
        name: quoted.expr.name,
      };
    }
    if (quoted.expr.type === NODE_TYPES.PROC_CALL) {
      const operator = quoted.expr.operator;
      const operands = quoted.expr.operands;
      return this.evalQuote({
        type: NODE_TYPES.QUOTED_EXPR,
        expr: {
          type: NODE_TYPES.LIST,
          contents: [operator, ...operands],
        },
      });
    }
    return quoted.expr;
  }

  evalProcCall(ast) {
    debug("evalProcCall: ", toString(ast));
    if (Array.isArray(ast)) {
      let i, result;
      for (i = 0; i < ast.length; i++) {
        result = this.evalProcCall(ast[i].expr);
      }
      return result;
    }

    if (
      ast.operator.type === NODE_TYPES.IDENTIFIER &&
      ast.operator.name === "quote"
    ) {
      debug("quote macro");
      if (ast.operands.length !== 1) {
        return new ArgumentsError(
          `wrong number of arguments: quote require 1, but got ${
            ast.operands.length
          }`
        );
      }
      return this.evalQuote(ast.operands[0]);
    }

    debug("eval proc");
    const proc = this.evalExpr(ast.operator);
    if (proc.type === "ERROR") {
      return proc;
    }
    if (proc.type !== NODE_TYPES.PROC) {
      return {
        type: "ERROR",
        message: `invalid application for ${toString(proc)}`,
      };
    }

    debug("eval operands");
    const operands = ast.operands.map(this.evalExpr.bind(this));
    debug("evaluated operands: ", operands);
    const err = proc.assertion(operands);
    if (err != null) {
      return err;
    }

    debug("apply: ", proc.name, "arguments: ", operands.map(toString));
    return proc.body(operands);
  }
}

export default Interpreter;
