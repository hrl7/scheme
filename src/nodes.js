import { NODE_TYPES } from "./constants";

export const NULL = {
  type: NODE_TYPES.NULL,
};

export const TRUE = {
  type: NODE_TYPES.BOOLEAN,
  value: true,
  symbol: "#t",
};
export const FALSE = {
  type: NODE_TYPES.BOOLEAN,
  value: false,
  symbol: "#f",
};

export const toString = node => {
  if (node == null) {
    throw new Error("undefined node found");
  }
  if (node.symbol != null) {
    return node.symbol;
  }
  if (node.name != null) {
    return node.name;
  }
  if (node.type === NODE_TYPES.NUMBER) {
    return node.value.toString();
  }
  if (node.type === NODE_TYPES.NULL) {
    return "null";
  }
  if (node.type === NODE_TYPES.ERROR) {
    return `ERROR: ${node.message}`;
  }
  return JSON.stringify(node, null, 2);
};

export const buildPair = (car, cdr) => {
  if (car == null || cdr == null) {
    const msg = `cannot make pair. car: ${car}, cdr: ${cdr}`;
    throw new Error(msg);
  }
  return {
    type: NODE_TYPES.PAIR,
    car: car,
    cdr: cdr || NULL,
  };
};

export const buildProc = (name, assertion, body) => {
  return {
    type: NODE_TYPES.PROC,
    name,
    assertion,
    body,
  };
};

export const buildNumber = num => {
  const n = parseFloat(num);
  if (Number.isNaN(n)) {
    throw new Error(`failed to parse as number: ${num}`);
  }
  return {
    type: NODE_TYPES.NUMBER,
    value: num,
  };
};

export const display = node => {
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
    case NODE_TYPES.PAIR: {
      let n = node.cdr;
      let str = "(" + display(node.car);
      while (n != null && n.type !== NODE_TYPES.NULL) {
        if (n.type === NODE_TYPES.PAIR) {
          str += " " + display(n.car);
          n = n.cdr;
        }
      }
      str += ")";
      return str;
    }
    default:
      return JSON.stringify(node);
  }
};
