const TOKEN_TYPES = {
  IDENTIFIER: "IDENTIFIER",
  BOOLEAN: "BOOLEAN",
  KEYWORD: "KEYWORD",
  NUMBER: "NUMBER",
  RPAREN: "RPAREN",
  LPAREN: "LPAREN",
  QUOTE: "QUOTE",
};

const NODE_TYPES = {
  EXPR: "EXPR",
  PROC_CALL: "PROC_CALL",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  LAMBDA: "LAMBDA",
  IDENTIFIER: "IDENTIFIER",
  PROC: "PROC",
  QUOTED_EXPR: "QUOTED_EXPR",
  LIST: "LIST",
  ATOM: "ATOM",
  NULL: "NULL",
  PAIR: "PAIR",
  ERROR: "ERROR",
};
module.exports = {
  TOKEN_TYPES: TOKEN_TYPES,
  NODE_TYPES: NODE_TYPES,
};
