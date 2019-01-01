const debug = require("debug")("lexer");

// SYMBOLS represent single character sign.
const SYMBOLS = {
  LPAREN: "(",
  RPAREN: ")",
  QUOTE: "'",
};

const KEYWORDS = {
  IF: "if",
  SET_BANG: "set!",
  ELSE: "else",
  LAMBDA: "lambda",
};
const SYMBOLS_KEYS = Object.keys(SYMBOLS);

const isSpace = c => {
  return c === " " || c === "s" || c === "\t" || c === "\n" || c === "\r";
};
const findSymbol = c => {
  for (let k = 0; k < SYMBOLS_KEYS.length; k++) {
    if (SYMBOLS[SYMBOLS_KEYS[k]] === c) {
      return SYMBOLS_KEYS[k];
    }
  }
  return null;
};

class Lexer {
  constructor(src) {
    this.src = src;
    this.tokens = [];
    this.currentIndex = 0;
    this.buf = "";

    this.table = {
      "#t": () => this.makeBoolean(true),
      "#f": () => this.makeBoolean(false),
      if: () => this.makeKeyword(KEYWORDS.IF),
      lambda: () => this.makeKeyword(KEYWORDS.LAMBDA),
    };
  }

  tokenize() {
    const i = this.currentIndex;
    let length = this.src.length;
    if (i >= length) {
      return;
    }

    debug(
      "tokenize: ",
      this.src[i],
      "buf: ",
      this.buf,
      "index: ",
      this.currentIndex
    );
    const c = this.src[i];
    if (isSpace(c)) {
      this.currentIndex++;
      return this.tokenize();
    }
    // check one letter symbol
    const s = findSymbol(c);
    if (s != null) {
      this.tokens.push({ type: s, loc: this.getLocation(i) });
      this.buf = "";
      this.currentIndex++;
      debug("found ", s, "index: ", i);
      return this.tokenize();
    }

    // peek until space or symbol found
    let peekIndex = i;
    let currentChar = this.src[peekIndex];
    while (!isSpace(currentChar) && peekIndex < length) {
      const s = findSymbol(currentChar);
      if (s != null) {
        // found symbol. so stop peeking
        break;
      }
      this.buf += currentChar;
      peekIndex++;
      currentChar = this.src[peekIndex];
    }
    // prev while breaks loop after trying to peek next char.
    peekIndex--;

    const num = parseFloat(this.buf);
    if (!Number.isNaN(num)) {
      this.tokens.push({
        type: "NUMBER",
        value: num,
        loc: this.getLocation(peekIndex),
      });
      debug("found number: ", num, "index: ", this.currentIndex, peekIndex);
      this.currentIndex = peekIndex + 1;
      this.buf = "";
      return this.tokenize();
    }

    if (this.buf !== "") {
      const tokenizeProc = this.table[this.buf];
      if (tokenizeProc != null) {
        tokenizeProc();
      } else {
        this.makeIdentifier(peekIndex);
      }
      this.currentIndex = peekIndex + 1;
      this.buf = "";
      return this.tokenize();
    }

    return this.tokenize();
  }

  makeBoolean(v) {
    this.tokens.push({
      type: "BOOLEAN",
      value: v,
      loc: this.getLocation(this.currentIndex + 1),
    });
  }

  makeKeyword(word) {
    this.tokens.push({
      type: "KEYWORD",
      keyword: word,
      loc: this.getLocation(this.currentIndex + word.length),
    });
  }

  makeIdentifier(peekIndex) {
    this.tokens.push({
      type: "IDENTIFIER",
      identifier: this.buf,
      loc: this.getLocation(peekIndex),
    });
    debug(
      "found identifier: ",
      this.buf,
      "index: ",
      this.currentIndex,
      peekIndex
    );
  }

  getLocation(endIndex) {
    const startIndex = this.currentIndex;
    return {
      start: {
        line: 0,
        col: startIndex,
      },
      end: {
        line: 0,
        col: endIndex,
      },
    };
  }
}

module.exports = {
  Lexer: Lexer,
};
