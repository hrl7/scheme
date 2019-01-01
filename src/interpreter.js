const Lexer = require("./lexer");
const Parser = require("./parser");

class Interpreter {
  constructor() {
    this.lexer = new Lexer();
    this.parser = new Parser();
    this.result = null;
  }

  run(src) {
    this.lexer.src = src;
    this.lexer.tokenize();
    this.parser.tokens = this.lexer.tokens;
    this.parser.parse();
  }
}

module.exports = Interpreter;
