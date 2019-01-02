const debug = require("debug")("eval:run");
const debugAssert = require("debug")("eval:assert");
const Lexer = require("./lexer");
const Parser = require("./parser");
const { NODE_TYPES } = require("./constants");
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
    debug("run: ", src);
    this.lexer.src = src;
    this.lexer.tokenize();
    this.parser.tokens = this.lexer.tokens;
    this.parser.parse();
    this.program = this.parser.program;
    this.lexer.tokens = null;
    this.parser.program = null;

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
      case NODE_TYPES.NUMBER:
      case NODE_TYPES.PROC:
        return expr;
      case NODE_TYPES.QUOTED_EXPR:
        return this.evalQuote(expr);
      default:
        debug("UNRECOGNIZED Expr type: ", expr.type);
    }
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

  evalQuote(quoted) {
    switch (quoted.type) {
      case NODE_TYPES.IDENTIFIER:
        return {
          type: NODE_TYPES.ATOM,
          name: quoted.name,
        };
      case NODE_TYPES.NUMBER:
        return quoted;
    }
    debug("evalQuote", quoted && quoted.expr && quoted.expr.type, quoted);
    if (quoted.expr.type === NODE_TYPES.LIST) {
      const length = quoted.expr.contents.length;
      const contents = quoted.expr.contents;
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
    const err = proc.assertion(operands);
    if (err != null) {
      return err;
    }

    debug("apply: ", proc.name, "arguments: ", operands.map(toString));
    return proc.body(operands);
  }
}

module.exports = Interpreter;
