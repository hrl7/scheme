const { NODE_TYPES } = require("./constants");

const NULL = {
  type: "NULL",
};

const TRUE = {
  type: "BOOLEAN",
  value: true,
  symbol: "#t",
};
const FALSE = {
  type: "BOOLEAN",
  value: false,
  symbol: "#f",
};

const toString = node => {
  if (node == null) {
    throw new Error("undefined node found");
  }
  if (node.symbol != null) {
    return node.symbol;
  }
  if (node.name != null) {
    return node.name;
  }
  if (node.type === "NUMBER") {
    return node.value.toString();
  }
  if (node.type === "NULL") {
    return "null";
  }
  if (node.type === "ERROR") {
    return `ERROR: ${node.message}`;
  }
  return JSON.stringify(node, null, 2);
};

const buildPair = (car, cdr) => {
  if (car == null || cdr == null) {
    const msg = `cannot make pair. car: ${car}, cdr: ${cdr}`;
    throw new Error(msg);
  }
  return {
    type: "PAIR",
    car: car,
    cdr: cdr || NULL,
  };
};

const buildProc = (name, assertion, body) => {
  return {
    type: "PROC",
    name,
    assertion,
    body,
  };
};

const buildNumber = num => {
  const n = parseFloat(num);
  if (Number.isNaN(n)) {
    throw new Error(`failed to parse as number: ${num}`);
  }
  return {
    type: "NUMBER",
    value: num,
  };
};

const display = node => {
  if (node == null) {
    return "";
  }

  switch (node.type) {
    case NODE_TYPES.NUMBER:
      return String(node.value);
    case NODE_TYPES.IDENTIFIER:
    case NODE_TYPES.ATOM:
      return node.name;
    case NODE_TYPES.BOOLEAN:
      return node.value ? "#t" : "#f";
    case NODE_TYPES.LIST:
      return (
        "( " +
        node.contents.reduce((acc, n) => `${acc} ${display(n)}`, "") +
        " )"
      );
    case NODE_TYPES.EXPR:
    case NODE_TYPES.QUOTED_EXPR:
      return display(node.expr);

    default:
      return JSON.stringify(node);
  }
};

module.exports = {
  buildPair: buildPair,
  buildProc: buildProc,
  buildNumber: buildNumber,
  TRUE: TRUE,
  FALSE: FALSE,
  NULL: NULL,
  toString: toString,
  display: display,
};
