import { TRUE, FALSE, buildPair } from "../nodes";

export const BASE_PROCEDURES = [
  [["*", "*"], "cons", operands => buildPair(operands[0], operands[1])],
  [["PAIR"], "car", operands => operands[0].car],
  [["PAIR"], "cdr", operands => operands[0].cdr],
  [["*"], "null?", operands => operands[0].type === "NULL" ? TRUE : FALSE],
  [["*", "*"], "eq?", operands => operands[0].symbol === operands[1].symbol ? TRUE : FALSE]
];
