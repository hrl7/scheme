const debug = require("debug")("lexer");

class Lexer {
  constructor(src) {
    this.src = src;
    this.tokens = [];
    this.currentIndex = 0;
  }

  tokenize() {
    let i = this.currentIndex;
    let length = this.src.length;
    while (i < length) {
      console.log(this.src[i]);
      i++;
    }
  }
}

module.exports = {
  Lexer: Lexer,
};
